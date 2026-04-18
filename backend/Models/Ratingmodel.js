const mongoose = require("mongoose");

const ratingSchema = new mongoose.Schema({
  reviewer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  reviewed: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  stars:    { type: Number, required: true, min: 1, max: 5 },
  comment:  { type: String, default: "", maxlength: 300 },
  tripId:   { type: mongoose.Schema.Types.ObjectId, ref: "Trip" },
}, { timestamps: true });

// Un utilisateur ne peut noter qu'une fois par trajet
ratingSchema.index({ reviewer: 1, reviewed: 1, tripId: 1 }, { unique: true });

module.exports = mongoose.models.Rating || mongoose.model("Rating", ratingSchema);
