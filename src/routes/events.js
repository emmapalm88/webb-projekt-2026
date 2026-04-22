import express from "express";
import Event from "../models/Event.js";
import { connectToDatabase } from "../config/database.js";
import { verifyToken, isAdmin } from "../middleware/auth.js";

const allowedFields = [
  "title",
  "description",
  "date",
  "price",
  "location",
  "totalSpots",
  "category",
  "image"
];

function filterUpdates(body) {
  const updates = {};

  for (let key of allowedFields) {
    if (body[key] !== undefined) {
      updates[key] = body[key];
    }
  }

  return updates;
}

const router = express.Router();

// GET alla events
router.get("/", async (req, res) => {
  try {
    await connectToDatabase(); 

    const events = await Event.find().sort({ date: 1 });
    res.json(events);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// GET ett event
router.get("/:id", async (req, res) => {
  try {
     await connectToDatabase(); 
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.json(event);
  } catch (err) {
    res.status(400).json({ message: "Invalid ID" });
  }
});

// POST skapa event
router.post("/", verifyToken, isAdmin, async (req, res) => {
  await connectToDatabase();

  const event = new Event(req.body);
  await event.save();

  res.status(201).json(event);
});

// PUT uppdatera event
router.put("/:id", verifyToken, isAdmin, async (req, res) => {
  try {
     await connectToDatabase(); 
    const safeUpdates = filterUpdates(req.body);

    const existingEvent = await Event.findById(req.params.id);
    if (!existingEvent) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (
      safeUpdates.totalSpots !== undefined &&
      safeUpdates.totalSpots < existingEvent.bookedSpots
    ) {
      return res.status(400).json({
        message: "totalSpots cannot be less than bookedSpots"
      });
    }

    const event = await Event.findByIdAndUpdate(
      req.params.id,
      safeUpdates,
      {
        new: true,
        runValidators: true
      }
    );

    res.json(event);

  } catch (err) {
    res.status(400).json({ message: "Could not update event" });
  }
});

// PATCH uppdatera delar av event
router.patch("/:id", verifyToken, isAdmin, async (req, res) => {
  try {
     await connectToDatabase(); 
    const safeUpdates = filterUpdates(req.body);

    const existingEvent = await Event.findById(req.params.id);
    if (!existingEvent) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (
      safeUpdates.totalSpots !== undefined &&
      safeUpdates.totalSpots < existingEvent.bookedSpots
    ) {
      return res.status(400).json({
        message: "totalSpots cannot be less than bookedSpots"
      });
    }

    const event = await Event.findByIdAndUpdate(
      req.params.id,
      safeUpdates,
      {
        new: true,
        runValidators: true
      }
    );

    res.json(event);

  } catch (err) {
    res.status(400).json({ message: "Could not update event" });
  }
});



// DELETE event
router.delete("/:id", verifyToken, isAdmin, async (req, res) => {
  try {
     await connectToDatabase(); 
    const event = await Event.findByIdAndDelete(req.params.id);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.json({ message: "Event deleted" });
  } catch (err) {
    res.status(400).json({ message: "Invalid ID" });
  }

});

export default router;
