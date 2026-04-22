import express from "express";
import Booking from "../models/bookingModel.js";
import Event from "../models/Event.js";
import { connectToDatabase } from "../config/database.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

// CREATE booking
router.post("/", async (req, res) => {
  try {
     await connectToDatabase(); 
    const { name, email, event, quantity = 1 } = req.body;

    // 1. Check event exists
    const foundEvent = await Event.findById(event);
    if (!foundEvent) {
      return res.status(404).json({ message: "Event not found" });
    }

    // 2. Prevent double booking
    const existingBooking = await Booking.findOne({ email, event });
    if (existingBooking) {
      return res.status(400).json({ message: "You already booked this event" });
    }

    // 3. Atomic capacity update
    const updatedEvent = await Event.findOneAndUpdate(
      {
        _id: event,
        bookedSpots: { $lte: foundEvent.totalSpots - quantity }
      },
      {
        $inc: { bookedSpots: quantity }
      },
      { new: true }
    );

    if (!updatedEvent) {
      return res.status(400).json({ message: "Not enough spots available" });
    }

    // 4. Create booking
    const booking = new Booking({ name, email, event, quantity });
    const savedBooking = await booking.save();

    res.status(201).json(savedBooking);

  } catch (error) {
    // rollback if booking fails
    if (req.body?.event && req.body?.quantity) {
      await Event.findByIdAndUpdate(req.body.event, {
        $inc: { bookedSpots: -req.body.quantity }
      });
    }

    res.status(500).json({ error: error.message });
  }
});


// GET bookings for an event
router.get("/event/:eventId", async (req, res) => {
  try {
     await connectToDatabase(); 
    const bookings = await Booking.find({ event: req.params.eventId })
      .populate("event");

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// DELETE booking
router.delete("/:id", async (req, res) => {
  try {
     await connectToDatabase(); 
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // atomic decrement
    await Event.findByIdAndUpdate(booking.event, {
      $inc: { bookedSpots: -booking.quantity }
    });

    await Booking.findByIdAndDelete(req.params.id);

    res.json({ message: "Booking deleted and spots updated" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;