console.log("ENV TEST:", process.env.MONGODB_URI);
import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import authRouter from "./routes/auth.js";
import cors from "cors";
import eventsRouter from "./routes/events.js";
import bookingsRouter from "./routes/bookings.js";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// DB connection
let isConnected = false;

async function connectDB() {
  if (isConnected) return;

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ MongoDB connected");
    isConnected = true;
  } catch (err) {
    console.error("❌ DB error:", err);
  }
}

// Körs före routes
app.use(async (req, res, next) => {
  await connectDB();
  next();
});

// Routes (SKA LIGGA UTANFÖR!)
app.get("/", (req, res) => {
  res.json({ message: "Webbshop API", stack: "MEN (MongoDB, Express, Node.js)" });
});

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/auth", authRouter);
app.use("/events", eventsRouter);
app.use("/bookings", bookingsRouter);

export default app;