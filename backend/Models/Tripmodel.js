const mongoose = require("mongoose");
const { Schema } = mongoose;

const tripSchema = new Schema({
  // ── Conducteur ─────────────────────────────────────
  driver: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  // ── Trajet ─────────────────────────────────────────
  departure: {
    type: String,
    required: true,
    trim: true,
  },
  destination: {
    type: String,
    required: true,
    trim: true,
  },
  date: {
    type: Date,
    required: true,
  },
  time: {
    type: String,
    required: true, // ex: "08:30"
  },

  // ── Voiture ────────────────────────────────────────
  carImage: {
    type: String,
    default: "",
  },
  licensePlate: {
    type: String,
    required: true,
    trim: true,
    uppercase: true,
  },

  // ── Détails du trajet ───────────────────────────────
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  seats: {
    type: Number,
    required: true,
    min: 1,
    max: 8,
  },
  availableSeats: {
    type: Number,
    required: true,
    min: 0,
  },
  luggage: {
    type: Boolean,
    default: false, // false = pas de bagages
  },
  description: {
    type: String,
    default: "",
    maxlength: 500,
  },

  // ── Statut ──────────────────────────────────────────
  status: {
    type: String,
    enum: ["active", "cancelled", "completed"],
    default: "active",
  },
}, { timestamps: true });

module.exports = mongoose.models.Trip || mongoose.model("Trip", tripSchema);