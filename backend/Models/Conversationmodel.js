const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema({
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // toujours 2 membres
}, { timestamps: true });

module.exports = mongoose.models.Conversation || mongoose.model("Conversation", conversationSchema);
