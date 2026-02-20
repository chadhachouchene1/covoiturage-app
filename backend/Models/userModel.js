const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, minlength: 2 },
    lastName:  { type: String, required: true, minlength: 2 },
    dateOfBirth: { type: Date, required: true },
    birthPlace: { type: String, required: true },
    email: {
      type: String, required: true, unique: true,
      match: [/.+\@.+\..+/, "Please fill a valid email address"],
    },
    phone: { type: String, required: true, unique: true },
    password: { type: String, required: true, minlength: 6 },
    image: { type: String, default: "" },          // path or URL to profile picture
    role: { type: String, enum: ["passenger", "driver", "admin"], default: "passenger" },
    isVerified: { type: Boolean, default: false },  // email/phone verification flag
    acceptedRules: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);