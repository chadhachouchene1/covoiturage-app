// models/user.js

const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      match: [/.+\@.+\..+/, 'Please fill a valid email address']
    },
    password: {
      type: String,
      required: true,
      minlength: 6
    }
  },
  {
    timestamps: true  
  }
);

module.exports = mongoose.model("User", userSchema);
