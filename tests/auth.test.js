import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import express from "express";
import jwt from "jsonwebtoken";
import { createUser, findUserByEmail } from "../src/db/users.js";
import { connectToDatabase } from "../src/config/database.js";
import authRoutes from "../src/routes/auth.js";
import { verifyToken, isAdmin } from "../src/middleware/auth.js";

const app = express();
app.use(express.json());
app.use("/auth", authRoutes);

describe("Auth Tests", () => {
  beforeEach(async () => {
    await connectToDatabase();
    // Clean up users if needed
  });

  describe("POST /auth/register", () => {
    it("should register a new user", async () => {
      const response = await request(app)
        .post("/auth/register")
        .send({
          name: "Test User",
          email: "test@example.com",
          password: "password123"
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("id");
      expect(response.body.email).toBe("test@example.com");
      expect(response.body.role).toBe("user");
    });

    it("should register an admin with secret", async () => {
      process.env.ADMIN_SECRET = "secret123";
      const response = await request(app)
        .post("/auth/register")
        .send({
          name: "Admin User",
          email: "admin@example.com",
          password: "password123",
          role: "admin",
          adminSecret: "secret123"
        });

      expect(response.status).toBe(201);
      expect(response.body.role).toBe("admin");
    });

    it("should not register duplicate email", async () => {
      await createUser({
        name: "Existing",
        email: "existing@example.com",
        password: "pass"
      });

      const response = await request(app)
        .post("/auth/register")
        .send({
          name: "New User",
          email: "existing@example.com",
          password: "password123"
        });

      expect(response.status).toBe(409);
    });
  });

  describe("POST /auth/login", () => {
    beforeEach(async () => {
      await createUser({
        name: "Admin",
        email: "admin@example.com",
        password: "password123",
        role: "admin"
      });
    });

    it("should login admin and return token", async () => {
      const response = await request(app)
        .post("/auth/login")
        .send({
          email: "admin@example.com",
          password: "password123"
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("token");
    });

    it("should not login non-admin", async () => {
      await createUser({
        name: "User",
        email: "user@example.com",
        password: "password123",
        role: "user"
      });

      const response = await request(app)
        .post("/auth/login")
        .send({
          email: "user@example.com",
          password: "password123"
        });

      expect(response.status).toBe(403);
    });
  });

  describe("verifyToken middleware", () => {
    it("should pass with valid token", async () => {
      const token = jwt.sign({ id: "123", role: "admin" }, process.env.JWT_SECRET);

      const testApp = express();
      testApp.use(express.json());
      testApp.get("/protected", verifyToken, (req, res) => {
        res.json({ user: req.user });
      });

      const response = await request(testApp)
        .get("/protected")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.user).toHaveProperty("id", "123");
    });

    it("should fail without token", async () => {
      const testApp = express();
      testApp.get("/protected", verifyToken, (req, res) => res.json({}));

      const response = await request(testApp).get("/protected");

      expect(response.status).toBe(401);
    });
  });

  describe("isAdmin middleware", () => {
    it("should pass for admin", async () => {
      const token = jwt.sign({ id: "123", role: "admin" }, process.env.JWT_SECRET);

      const testApp = express();
      testApp.use(express.json());
      testApp.get("/admin", verifyToken, isAdmin, (req, res) => res.json({ ok: true }));

      const response = await request(testApp)
        .get("/admin")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
    });

    it("should fail for non-admin", async () => {
      const token = jwt.sign({ id: "123", role: "user" }, process.env.JWT_SECRET);

      const testApp = express();
      testApp.get("/admin", verifyToken, isAdmin, (req, res) => res.json({}));

      const response = await request(testApp)
        .get("/admin")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(403);
    });
  });
});