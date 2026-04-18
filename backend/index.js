const express    = require("express");
const mongoose   = require("mongoose");
const cors       = require("cors");
const path       = require("path");
const http       = require("http");
const { Server } = require("socket.io");
require("dotenv").config();

const app    = express();
const server = http.createServer(app);

// ── Socket.IO ──────────────────────────────────────────────────────────────
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

// Map userId → socketId
const onlineUsers = new Map();

io.on("connection", (socket) => {
  console.log("🟢 Socket connected:", socket.id);

  socket.on("user:join", (userId) => {
    onlineUsers.set(userId, socket.id);
    io.emit("users:online", Array.from(onlineUsers.keys()));
  });

  socket.on("message:send", async (data) => {
    try {
      const Message      = require("./Models/Messagemodel");
      const Conversation = require("./Models/Conversationmodel");

      const message = await Message.create({
        conversationId: data.conversationId,
        senderId:       data.senderId,
        text:           data.text.trim(),
      });

      await Conversation.findByIdAndUpdate(data.conversationId, { updatedAt: new Date() });

      const receiverSocketId = onlineUsers.get(data.receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("message:receive", message);
        // ⭐ Notify receiver for navbar badge
        io.to(receiverSocketId).emit("notification:new", { type: "message" });
      }

      socket.emit("message:sent", message);
    } catch (err) {
      console.error("Socket message:send error:", err);
      socket.emit("message:error", { message: "Erreur envoi message" });
    }
  });

  socket.on("typing:start", ({ conversationId, senderId, receiverId }) => {
    const receiverSocketId = onlineUsers.get(receiverId);
    if (receiverSocketId) io.to(receiverSocketId).emit("typing:start", { conversationId, senderId });
  });

  socket.on("typing:stop", ({ conversationId, senderId, receiverId }) => {
    const receiverSocketId = onlineUsers.get(receiverId);
    if (receiverSocketId) io.to(receiverSocketId).emit("typing:stop", { conversationId, senderId });
  });

  socket.on("disconnect", () => {
    for (const [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        onlineUsers.delete(userId);
        io.emit("users:online", Array.from(onlineUsers.keys()));
        break;
      }
    }
  });
});

// Export io + onlineUsers so controllers can emit notifications
global._io          = io;
global._onlineUsers = onlineUsers;

// ── Middleware ─────────────────────────────────────────────────────────────
app.use(express.json());
app.use(cors());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ── Routes ────────────────────────────────────────────────────────────────
const userRoute        = require("./Routes/userRoute");
const tripRoute        = require("./Routes/Triproute");
const reservationRoute = require("./Routes/Reservationroute");
const chatRoute        = require("./Routes/Chatroute");
const ratingRoute      = require("./Routes/Ratingroute");

app.use("/api/users",        userRoute);
app.use("/api/trips",        tripRoute);
app.use("/api/reservations", reservationRoute);
app.use("/api/chat",         chatRoute);
app.use("/api/ratings",      ratingRoute);

// ── MongoDB + Start ───────────────────────────────────────────────────────
const port = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Atlas connected ✅");
    server.listen(port, () => {
      console.log(`Server running on port: ${port} 🚀`);

      // ── CRON: Mark expired trips as "completed" every 10 minutes ──────
      const tripModel = require("./Models/tripModel");
      setInterval(async () => {
        try {
          const now = new Date();
          const result = await tripModel.updateMany(
            { status: "active", date: { $lt: now } },
            { $set: { status: "completed" } }
          );
          if (result.modifiedCount > 0) {
            console.log(`⏰ ${result.modifiedCount} trajet(s) marqué(s) comme complétés`);
          }
        } catch (err) {
          console.error("Cron error:", err);
        }
      }, 10 * 60 * 1000); // every 10 minutes
    });
  })
  .catch(err => console.log("MongoDB connection error ❌", err));