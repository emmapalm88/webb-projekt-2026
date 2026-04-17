import express from "express";
import Event from "../models/Event.js";
/*  */ import { isAdmin } from "../middleware/auth.js";

const allowedFields = [
  "title",
  "description",
  "date",
  "price",
  "location",
  "totalSpots",
  "category"
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
    const events = await Event.find().sort({ date: 1 });
    res.json(events);
  } catch (err) {
    console.error("EVENT ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

// GET ett event
router.get("/:id", async (req, res) => {
  try {
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
router.post("/",  async (req, res) => {
  try {
    const safeData = filterUpdates(req.body);
    const event = new Event(safeData);
    await event.save();

    res.status(201).json(event);
  } catch (err) {
    res.status(400).json({ message: "Could not create event" });
  }
});

// PUT uppdatera event
router.put("/:id",  async (req, res) => {
  try {
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
router.patch("/:id",  async (req, res) => {
  try {
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
router.delete("/:id",  async (req, res) => {
  try {
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
