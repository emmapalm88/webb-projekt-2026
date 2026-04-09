import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import productsRouter from "./routes/products.js";
import authRouter from "./routes/auth.js";
import cors from "cors";
import eventsRouter from "./routes/events.js";

const app = express();

// Connect DB direkt vid start
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ DB error:", err));

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get("/", (req, res) => {
  res.json({ message: "Webbshop API", stack: "MEN (MongoDB, Express, Node.js)" });
});

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/products", productsRouter);
app.use("/auth", authRouter);
app.use("/events", eventsRouter);
app.use("/bookings", bookingsRouter);

export default app;
