const Conversation = require("../Models/Conversationmodel");
const Message      = require("../Models/Messagemodel");
const User         = require("../Models/userModel");

// ─── CRÉER OU RÉCUPÉRER UNE CONVERSATION ────────────────────────────────────
// POST /api/chat/conversations
const getOrCreateConversation = async (req, res) => {
  try {
    const { receiverId } = req.body;
    const senderId = req.userId;

    if (!receiverId) return res.status(400).json({ message: "receiverId requis" });
    if (receiverId === senderId) return res.status(400).json({ message: "Vous ne pouvez pas vous écrire à vous-même" });

    // Chercher une conversation existante entre les 2 membres
    let conv = await Conversation.findOne({
      members: { $all: [senderId, receiverId] },
    }).populate("members", "firstName lastName image");

    if (!conv) {
      conv = await Conversation.create({ members: [senderId, receiverId] });
      conv = await Conversation.findById(conv._id).populate("members", "firstName lastName image");
    }

    res.status(200).json(conv);
  } catch (error) {
    console.error("GetOrCreateConversation Error:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// ─── MES CONVERSATIONS (liste sidebar) ───────────────────────────────────────
// GET /api/chat/conversations
const getMyConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      members: { $in: [req.userId] },
    })
      .populate("members", "firstName lastName image")
      .sort({ updatedAt: -1 });

    // Pour chaque conversation, ajouter le dernier message + nombre non lus
    const result = await Promise.all(
      conversations.map(async (conv) => {
        const lastMessage = await Message.findOne({ conversationId: conv._id })
          .sort({ createdAt: -1 });

        const unreadCount = await Message.countDocuments({
          conversationId: conv._id,
          senderId: { $ne: req.userId },
          read: false,
        });

        return {
          ...conv.toObject(),
          lastMessage: lastMessage || null,
          unreadCount,
        };
      })
    );

    res.status(200).json(result);
  } catch (error) {
    console.error("GetMyConversations Error:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// ─── MESSAGES D'UNE CONVERSATION ─────────────────────────────────────────────
// GET /api/chat/messages/:conversationId
const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;

    // Vérifier que l'utilisateur fait partie de la conversation
    const conv = await Conversation.findById(conversationId);
    if (!conv) return res.status(404).json({ message: "Conversation introuvable" });
    if (!conv.members.map(String).includes(req.userId)) {
      return res.status(403).json({ message: "Non autorisé" });
    }

    const messages = await Message.find({ conversationId }).sort({ createdAt: 1 });

    // Marquer tous les messages non lus comme lus
    await Message.updateMany(
      { conversationId, senderId: { $ne: req.userId }, read: false },
      { $set: { read: true, readAt: new Date() } }
    );

    res.status(200).json(messages);
  } catch (error) {
    console.error("GetMessages Error:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// ─── ENVOYER UN MESSAGE (REST — backup si socket échoue) ────────────────────
// POST /api/chat/messages
const sendMessage = async (req, res) => {
  try {
    const { conversationId, text, messageType = "text", location } = req.body;
    const trimmedText = text?.trim() || "";
    const isLocation = messageType === "location";
    if (isLocation && (typeof location?.lat !== "number" || typeof location?.lng !== "number")) {
      return res.status(400).json({ message: "Coordonnées localisation invalides" });
    }
    if (!conversationId || (!trimmedText && !isLocation)) {
      return res.status(400).json({ message: "conversationId et contenu requis" });
    }

    const conv = await Conversation.findById(conversationId);
    if (!conv) return res.status(404).json({ message: "Conversation introuvable" });
    if (!conv.members.map(String).includes(req.userId)) {
      return res.status(403).json({ message: "Non autorisé" });
    }

    const message = await Message.create({
      conversationId,
      senderId: req.userId,
      text: isLocation ? (trimmedText || "📍 Localisation partagée") : trimmedText,
      messageType,
      location: isLocation ? location : undefined,
    });

    // Mettre à jour updatedAt de la conversation pour le tri
    await Conversation.findByIdAndUpdate(conversationId, { updatedAt: new Date() });

    res.status(201).json(message);
  } catch (error) {
    console.error("SendMessage Error:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// ─── NOMBRE DE MESSAGES NON LUS (badge navbar) ──────────────────────────────
// GET /api/chat/unread
const getUnreadMessages = async (req, res) => {
  try {
    const myConvs = await Conversation.find({ members: { $in: [req.userId] } }).select("_id");
    const convIds = myConvs.map(c => c._id);

    const count = await Message.countDocuments({
      conversationId: { $in: convIds },
      senderId: { $ne: req.userId },
      read: false,
    });

    res.status(200).json({ count });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

module.exports = {
  getOrCreateConversation,
  getMyConversations,
  getMessages,
  sendMessage,
  getUnreadMessages,
};
