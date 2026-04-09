import express from "express";
import Event from "../models/Event.js";
import { isAdmin } from "../middleware/auth.js";

const router = express.Router();

// GET alla events
router.get("/", async (req, res) => {
  try {
    const events = await Event.find().sort({ date: 1 });
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: "Error fetching events" });
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
router.post("/", isAdmin, async (req, res) => {
  try {
    const event = new Event(req.body);
    await event.save();

    res.status(201).json(event);
  } catch (err) {
    res.status(400).json({ message: "Could not create event" });
  }
});

// PUT uppdatera event
router.put("/:id", isAdmin, async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.json(event);
  } catch (err) {
    res.status(400).json({ message: "Could not update event" });
  }
});

// DELETE event
router.delete("/:id", isAdmin, async (req, res) => {
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