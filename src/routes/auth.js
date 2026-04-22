import { Router } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { connectToDatabase } from "../config/database.js";
import { createUser, findUserByEmail } from "../db/users.js";
import { validateRegister, validateAuthResult } from "../middleware/authValidation.js";
import { verifyToken } from "../middleware/auth.js";

const router = Router();

router.post(
  "/register",
  validateRegister,
  validateAuthResult,
  async (req, res) => {
    try {
      await connectToDatabase();

      const { name, email, password, role, adminSecret } = req.body;

      const existingUser = await findUserByEmail(email);
      if (existingUser) {
        return res.status(409).json({ error: "Email already registered" });
      }

  
      const ADMIN_SECRET = process.env.ADMIN_SECRET;

      let userRole = "user";

      if (role === "admin" && adminSecret === ADMIN_SECRET) {
        userRole = "admin";
      }

      const user = await createUser({
        name,
        email,
        password,
        role: userRole
      });

      res.status(201).json({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role
});



    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ error: "Registration failed" });
    }
  }
);

router.post("/login", async (req, res) => {
  console.log("LOGIN ROUTE HIT");
  console.log("JWT_SECRET:", process.env.JWT_SECRET);
  try {
    await connectToDatabase();

    const { email, password } = req.body;

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (user.role !== "admin") {
      return res.status(403).json({ message: "Admin only" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ token });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/refresh", verifyToken, async (req, res) => {
  try {
   
    const newToken = jwt.sign(
      { id: req.user.id, role: req.user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ token: newToken });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/logout", verifyToken, async (req, res) => {
  
  res.json({ message: "Logged out successfully" });
});


export default router;