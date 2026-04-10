import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  date: { type: Date, required: true },
  price: { type: Number, required: true },
  location: String,
  totalSpots: { type: Number, required: true },
  bookedSpots: {
    type: Number,
    default: 0
  },
  category: String
});

export default mongoose.model("Event", eventSchema); 