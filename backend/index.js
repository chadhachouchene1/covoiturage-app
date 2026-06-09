const express    = require("express");
const mongoose   = require("mongoose");
const cors       = require("cors");
const path       = require("path");
const http       = require("http");
const { Server } = require("socket.io");
require("dotenv").config();
const supportRoute = require("./Routes/supportRoute");


const app    = express();
const server = http.createServer(app);

// ── Socket.IO ──────────────────────────────────────────────────────────────
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST"],
  },
});

// Map userId → socketId
const onlineUsers = new Map();

io.on("connection", (socket) => {
  console.log("🟢 Socket connected:", socket.id);

  socket.on("user:join", (userId) => {
    if (!userId) return;
    onlineUsers.set(String(userId), socket.id);
    io.emit("users:online", Array.from(onlineUsers.keys()));
  });

  socket.on("message:send", async (data) => {
    try {
      const Message      = require("./Models/Messagemodel");
      const Conversation = require("./Models/Conversationmodel");
      const messageType = data.messageType === "location" ? "location" : "text";
      const text = (data.text || "").trim();
      const isLocation = messageType === "location";
      if (!text && !isLocation) {
        socket.emit("message:error", { message: "Message vide" });
        return;
      }
      if (isLocation && (typeof data?.location?.lat !== "number" || typeof data?.location?.lng !== "number")) {
        socket.emit("message:error", { message: "Localisation invalide" });
        return;
      }

      const message = await Message.create({
        conversationId: data.conversationId,
        senderId:       data.senderId,
        text:           isLocation ? (text || "📍 Localisation partagée") : text,
        messageType,
        location:       isLocation ? data.location : undefined,
      });

      await Conversation.findByIdAndUpdate(data.conversationId, { updatedAt: new Date() });

      const receiverSocketId = onlineUsers.get(String(data.receiverId));
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

  socket.on("messages:read", async ({ conversationId, readerId, senderId }) => {
    try {
      if (!conversationId || !readerId) return;
      await require("./Models/Messagemodel").updateMany(
        { conversationId, senderId: { $ne: readerId }, read: false },
        { $set: { read: true, readAt: new Date() } }
      );

      const targetSocketId = onlineUsers.get(String(senderId));
      if (targetSocketId) {
        io.to(targetSocketId).emit("messages:read", { conversationId, readerId, readAt: new Date().toISOString() });
      }
    } catch (err) {
      console.error("Socket messages:read error:", err);
    }
  });

  socket.on("typing:start", ({ conversationId, senderId, receiverId }) => {
    const receiverSocketId = onlineUsers.get(String(receiverId));
    if (receiverSocketId) io.to(receiverSocketId).emit("typing:start", { conversationId, senderId });
  });

  socket.on("typing:stop", ({ conversationId, senderId, receiverId }) => {
    const receiverSocketId = onlineUsers.get(String(receiverId));
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


// ── Routes ────────────────────────────────────────────────────────────────
const userRoute        = require("./Routes/userRoute");
const tripRoute        = require("./Routes/Triproute");
const reservationRoute = require("./Routes/Reservationroute");
const chatRoute        = require("./Routes/Chatroute");
const ratingRoute      = require("./Routes/Ratingroute");
app.use("/api/support", supportRoute);

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
      const tripModel = require("./Models/Tripmodel");
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