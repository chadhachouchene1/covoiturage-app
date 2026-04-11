const mongoose = require("mongoose");
const { Schema } = mongoose;

const reservationSchema = new Schema({
  // ── Références ─────────────────────────────────────
  trip: {
    type: Schema.Types.ObjectId,
    ref: "Trip",
    required: true,
  },
  passenger: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  // ── Détails de la réservation ───────────────────────
  seatsRequested: {
    type: Number,
    required: true,
    min: 1,
  },
  message: {
    type: String,
    default: "",
    maxlength: 300,
  },

  // ── Statut ──────────────────────────────────────────
  // pending  = en attente de réponse du conducteur
  // accepted = conducteur a accepté
  // rejected = conducteur a refusé
  // cancelled = passager a annulé
  status: {
    type: String,
    enum: ["pending", "accepted", "rejected", "cancelled"],
    default: "pending",
  },

  // ── Notification conducteur ─────────────────────────
  // true = conducteur a vu la demande, false = non lue
  driverRead: {
    type: Boolean,
    default: false,
  },
  paymentStatus: {
  type: String,
  enum: ["unpaid", "paid"],
  default: "unpaid",
},
paymentId: {
  type: String,
  default: "",
},

}, { timestamps: true });

module.exports = mongoose.models.Reservation || mongoose.model("Reservation", reservationSchema);