import express from "express";
import Booking from "../models/bookingModel.js";
import Event from "../models/Event.js";

const router = express.Router();

//create en booking
router.post("/", async (req, res) => {
  try {
    const { name, email, event, quantity = 1 } = req.body;

    //hitta event
    const foundEvent = await Event.findById(event);
    if (!foundEvent) {
      return res.status(404).json({ message: "Event not found" });
    }

    // räkna bokade platser
    const bookings = await Booking.find({ event });
    const totalBooked = bookings.reduce((sum, b) => sum + b.quantity, 0);

    //kolla kapacitet
    if (totalBooked + quantity > foundEvent.totalSpots) {
      return res.status(400).json({ message: "Not enough spots available" });
    }

    //kolla dubbelbokning
    const existingBooking = await Booking.findOne({ email, event });
    if (existingBooking) {
      return res.status(400).json({ message: "You already booked this event" });
    }

    //skapa booking
    const booking = new Booking({ name, email, event, quantity });
    const savedBooking = await booking.save();

    //uppdatera bookedSpots
    foundEvent.bookedSpots = (foundEvent.bookedSpots || 0) + quantity;
    await foundEvent.save();

    res.status(201).json(savedBooking);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// GET bookings för ett event
router.get("/event/:eventId", async (req, res) => {
  try {
    const bookings = await Booking.find({ event: req.params.eventId })
      .populate("event");

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// DELETE booking + uppdatera event
router.delete("/:id", async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // hitta event
    const foundEvent = await Event.findById(booking.event);

    if (foundEvent) {
      foundEvent.bookedSpots =
        (foundEvent.bookedSpots || 0) - booking.quantity;

      //säkerställ att det inte blir negativt
      if (foundEvent.bookedSpots < 0) {
        foundEvent.bookedSpots = 0;
      }

      await foundEvent.save();
    }

    //ta bort booking
    await Booking.findByIdAndDelete(req.params.id);

    res.json({ message: "Booking deleted and spots updated" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


export default router;