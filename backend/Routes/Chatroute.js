const express = require("express");
const router  = express.Router();
const { protect } = require("../Controllers/Tripcontroller");
const {
  getOrCreateConversation,
  getMyConversations,
  getMessages,
  sendMessage,
  getUnreadMessages,
} = require("../Controllers/Chatcontroller");

router.use(protect);

router.post  ("/conversations",        getOrCreateConversation); // POST   /api/chat/conversations
router.get   ("/conversations",        getMyConversations);      // GET    /api/chat/conversations
router.get   ("/messages/:conversationId", getMessages);         // GET    /api/chat/messages/:id
router.post  ("/messages",             sendMessage);             // POST   /api/chat/messages
router.get   ("/unread",               getUnreadMessages);       // GET    /api/chat/unread

module.exports = router;
