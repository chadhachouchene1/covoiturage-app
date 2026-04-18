const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  conversationId: { type: mongoose.Schema.Types.ObjectId, ref: "Conversation", required: true },
  senderId:       { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  text:           { type: String, default: "", maxlength: 2000 },
  messageType:    { type: String, enum: ["text", "location"], default: "text" },
  location: {
    lat: { type: Number },
    lng: { type: Number },
  },
  read:           { type: Boolean, default: false },
  readAt:         { type: Date, default: null },
}, { timestamps: true });

module.exports = mongoose.models.Message || mongoose.model("Message", messageSchema);
