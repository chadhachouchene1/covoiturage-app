import { useContext, useEffect, useRef, useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { io } from "socket.io-client";
import { MapContainer, TileLayer, CircleMarker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { AuthContext } from "../context/AuthContext";
import "./Chat.css";

const BASE_URL   = import.meta.env.VITE_API_URL;
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;
const QUICK_EMOJIS = ["😀", "😂", "😍", "👍", "🙏", "🔥", "🎉", "💯", "🤝", "❤️", "😎", "😢"];

// ── Helpers ──────────────────────────────────────────────────────────────────
const getToken  = () => localStorage.getItem("Token");
const avatarUrl = (img) => img ? img : null;
// Ajoute cet état en haut
const [mobileConvOpen, setMobileConvOpen] = useState(false);
const Avatar = ({ user, size = 40, online = false }) => {
  const initials = `${user?.firstName?.[0] || ""}${user?.lastName?.[0] || ""}`.toUpperCase();
  const src = avatarUrl(user?.image);
  return (
    <div style={{ position: "relative", flexShrink: 0 }}>
      {src
        ? <img src={src} alt={initials} style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", border: "2px solid #e2e8f0" }} />
        : <div style={{ width: size, height: size, borderRadius: "50%", background: "linear-gradient(135deg,#1A56DB,#0D1A35)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.36, fontWeight: 700 }}>{initials || "?"}</div>}
      {online && (
        <div style={{ position: "absolute", bottom: 1, right: 1, width: 11, height: 11, background: "#22c55e", borderRadius: "50%", border: "2px solid #fff" }} />
      )}
    </div>
  );
};

const formatTime = (date) => {
  const d = new Date(date);
  const now = new Date();
  const diffDays = Math.floor((now - d) / 86400000);
  if (diffDays === 0) return d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  if (diffDays === 1) return "Hier";
  if (diffDays < 7)  return d.toLocaleDateString("fr-FR", { weekday: "short" });
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
};

// ── Composant principal ───────────────────────────────────────────────────────
export default function Chat() {
  const { user } = useContext(AuthContext);
  const currentUserId = user?.id || user?._id;
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const socketRef     = useRef(null);
  const messagesEndRef = useRef(null);
  const typingTimerRef = useRef(null);

  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv]       = useState(null);
  const [messages, setMessages]           = useState([]);
  const [text, setText]                   = useState("");
  const [onlineUsers, setOnlineUsers]     = useState([]);
  const [typingFrom, setTypingFrom]       = useState(null);
  const [loadingConvs, setLoadingConvs]   = useState(true);
  const [loadingMsgs, setLoadingMsgs]     = useState(false);
  const [searchQ, setSearchQ]             = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [sendingLocation, setSendingLocation] = useState(false);

  const notifyMessagesRead = useCallback((conversationId, senderId) => {
    if (!socketRef.current || !conversationId || !currentUserId || !senderId) return;
    socketRef.current.emit("messages:read", {
      conversationId,
      readerId: currentUserId,
      senderId,
    });
  }, [currentUserId]);

  // ── Socket setup ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!user || !currentUserId) return;

    const socket = io(SOCKET_URL, { transports: ["websocket"] });
    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("user:join", currentUserId);
    });

    socket.on("users:online", (ids) => setOnlineUsers(ids));

    socket.on("message:receive", (msg) => {
      setMessages((prev) => {
        if (activeConvRef.current?._id === msg.conversationId) {
          if (prev.some(m => m._id === msg._id)) return prev;
          notifyMessagesRead(msg.conversationId, msg.senderId);
          return [...prev, msg];
        }
        return prev;
      });

      setConversations((prev) =>
        prev.map((c) =>
          c._id === msg.conversationId
            ? { ...c, lastMessage: msg, unreadCount: activeConvRef.current?._id === msg.conversationId ? 0 : (c.unreadCount || 0) + 1, updatedAt: msg.createdAt }
            : c
        ).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      );
    });

    socket.on("message:sent", (msg) => {
      setMessages((prev) => {
        if (prev.some(m => m._id === msg._id)) return prev;
        return [...prev, msg];
      });
      setConversations((prev) =>
        prev.map((c) =>
          c._id === msg.conversationId
            ? { ...c, lastMessage: msg, updatedAt: msg.createdAt }
            : c
        ).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      );
    });

    socket.on("messages:read", ({ conversationId }) => {
      setMessages((prev) =>
        prev.map((m) =>
          m.conversationId === conversationId && m.senderId === currentUserId
            ? { ...m, read: true, readAt: new Date().toISOString() }
            : m
        )
      );
    });

    socket.on("typing:start", ({ conversationId, senderId }) => {
      if (activeConvRef.current?._id === conversationId) {
        setTypingFrom(senderId);
      }
    });

    socket.on("typing:stop", ({ conversationId }) => {
      if (activeConvRef.current?._id === conversationId) {
        setTypingFrom(null);
      }
    });

    return () => socket.disconnect();
  }, [user, currentUserId, notifyMessagesRead]);

  const activeConvRef = useRef(activeConv);
  useEffect(() => { activeConvRef.current = activeConv; }, [activeConv]);

  // ── Charger les conversations ─────────────────────────────────────────
  const loadConversations = useCallback(async () => {
    setLoadingConvs(true);
    try {
      const res = await fetch(`${BASE_URL}/chat/conversations`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      setConversations(Array.isArray(data) ? data : []);
    } catch {}
    setLoadingConvs(false);
  }, []);

  useEffect(() => { loadConversations(); }, []);

  // ── Ouvrir une conversation depuis ?with=userId ───
  useEffect(() => {
    const withUser = searchParams.get("with");
    if (withUser && user) {
      openOrCreateConv(withUser);
    }
  }, [searchParams, user]);

  // ── Ouvrir / créer une conversation ──────────────────────────────────
  const openOrCreateConv = async (receiverId) => {
    try {
      const res = await fetch(`${BASE_URL}/chat/conversations`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ receiverId }),
      });
      const conv = await res.json();
      setActiveConv(conv);
      setConversations((prev) => {
        const exists = prev.some(c => c._id === conv._id);
        if (exists) return prev.map(c => c._id === conv._id ? { ...c, unreadCount: 0 } : c);
        return [{ ...conv, unreadCount: 0 }, ...prev];
      });
      loadMessages(conv._id);
      setSearchQ("");
      setSearchResults([]);
    } catch {}
  };

  // ── Charger les messages ──────────────────────────────────────────────
  const loadMessages = async (convId) => {
    setMobileConvOpen(true);
    setLoadingMsgs(true);
    setMessages([]);
    try {
      const res = await fetch(`${BASE_URL}/chat/messages/${convId}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      setMessages(Array.isArray(data) ? data : []);
      setConversations(prev => prev.map(c => c._id === convId ? { ...c, unreadCount: 0 } : c));
      const conv = conversations.find((c) => c._id === convId);
      const peer = conv?.members?.find((m) => m._id !== currentUserId);
      if (peer?._id) notifyMessagesRead(convId, peer._id);
    } catch {}
    setLoadingMsgs(false);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingFrom]);

  // ── Envoyer un message ────────────────────────────────────────────────
  const sendMessage = () => {
    if (!text.trim() || !activeConv || !socketRef.current) return;

    const receiver = activeConv.members.find(m => m._id !== currentUserId);
    socketRef.current.emit("message:send", {
      conversationId: activeConv._id,
      senderId:       currentUserId,
      receiverId:     receiver._id,
      text:           text.trim(),
      messageType:    "text",
    });
    setText("");
    setShowEmojiPicker(false);
    socketRef.current.emit("typing:stop", {
      conversationId: activeConv._id,
      senderId: currentUserId,
      receiverId: receiver._id,
    });
  };

  const sendLocationMessage = () => {
    if (!activeConv || !socketRef.current || !navigator.geolocation || sendingLocation) return;
    const receiver = activeConv.members.find(m => m._id !== currentUserId);
    if (!receiver?._id) return;

    setSendingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        socketRef.current?.emit("message:send", {
          conversationId: activeConv._id,
          senderId: currentUserId,
          receiverId: receiver._id,
          messageType: "location",
          text: "📍 Localisation partagée",
          location: {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          },
        });
        setSendingLocation(false);
      },
      () => setSendingLocation(false),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // ── Typing indicator ─────────────────────────────────────────────────
  const handleTextChange = (e) => {
    setText(e.target.value);
    if (!activeConv || !socketRef.current) return;
    const receiver = activeConv.members.find(m => m._id !== currentUserId);
    socketRef.current.emit("typing:start", {
      conversationId: activeConv._id,
      senderId: currentUserId,
      receiverId: receiver._id,
    });
    clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      socketRef.current?.emit("typing:stop", {
        conversationId: activeConv._id,
        senderId: currentUserId,
        receiverId: receiver._id,
      });
    }, 1500);
  };

  const appendEmoji = (emoji) => {
    setText((prev) => `${prev}${emoji}`);
  };

  // ── Recherche utilisateurs ────────────────────────────────────────────
  useEffect(() => {
    if (searchQ.trim().length < 2) { setSearchResults([]); return; }
    const timer = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const res = await fetch(`${BASE_URL}/users/search?q=${encodeURIComponent(searchQ)}`, {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        const data = await res.json();
        setSearchResults(Array.isArray(data) ? data.filter(u => u._id !== currentUserId) : []);
      } catch {}
      setSearchLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQ]);

  const getOtherMember = (conv) =>
    conv?.members?.find(m => m._id !== currentUserId);

  const activePeer = activeConv ? getOtherMember(activeConv) : null;
  const isPeerOnline = activePeer ? onlineUsers.includes(activePeer._id) : false;

  const groupedMessages = (() => {
    const groups = [];
    let lastDate = null;
    messages.forEach(msg => {
      const d = new Date(msg.createdAt).toLocaleDateString("fr-FR", { weekday:"long", day:"numeric", month:"long" });
      if (d !== lastDate) { groups.push({ type: "date", label: d }); lastDate = d; }
      groups.push({ type: "msg", data: msg });
    });
    return groups;
  })();

  return (
    <div className={`chat-root${mobileConvOpen ? " chat-conv-open" : ""}`}>

      {/* ── Sidebar ────────────────────────────────────────────────────── */}
      <aside className="chat-sidebar">
        <div className="chat-sidebar-header">
          <h2 className="chat-sidebar-title">Messages</h2>
        </div>

        <div className="chat-search-wrap">
          <div className="chat-search-box">
            <span className="chat-search-icon">🔍</span>
            <input
              className="chat-search-input"
              placeholder="Rechercher un utilisateur..."
              value={searchQ}
              onChange={e => setSearchQ(e.target.value)}
            />
            {searchQ && <button className="chat-search-clear" onClick={() => { setSearchQ(""); setSearchResults([]); }}>✕</button>}
          </div>
        </div>

        {searchResults.length > 0 && (
          <div className="chat-search-results">
            <div className="chat-search-results-label">Nouvelle conversation</div>
            {searchResults.map(u => (
              <div key={u._id} className="chat-search-result-item" onClick={() => openOrCreateConv(u._id)}>
                <Avatar user={u} size={36} online={onlineUsers.includes(u._id)} />
                <span className="chat-search-result-name">{u.firstName} {u.lastName}</span>
              </div>
            ))}
          </div>
        )}

        <div className="chat-conv-list">
          {loadingConvs ? (
            <div className="chat-conv-loading">Chargement...</div>
          ) : conversations.length === 0 ? (
            <div className="chat-conv-empty">
              <span>💬</span>
              <p>Aucune conversation.<br/>Recherchez un utilisateur pour commencer.</p>
            </div>
          ) : (
            conversations.map(conv => {
              const peer    = getOtherMember(conv);
              const isOnline = peer ? onlineUsers.includes(peer._id) : false;
              const isActive = activeConv?._id === conv._id;
              const lastMsg  = conv.lastMessage;
              return (
                <div
                  key={conv._id}
                  className={`chat-conv-item ${isActive ? "chat-conv-active" : ""}`}
                  onClick={() => { setActiveConv(conv); loadMessages(conv._id); }}
                >
                  <Avatar user={peer} size={46} online={isOnline} />
                  <div className="chat-conv-info">
                    <div className="chat-conv-row">
                      <span className="chat-conv-name">{peer?.firstName} {peer?.lastName}</span>
                      {lastMsg && <span className="chat-conv-time">{formatTime(lastMsg.createdAt)}</span>}
                    </div>
                    <div className="chat-conv-row">
                      <span className="chat-conv-last">
                        {lastMsg
                          ? (lastMsg.senderId === currentUserId ? "Vous : " : "") + (lastMsg.messageType === "location" ? "📍 Localisation partagée" : lastMsg.text.slice(0, 40) + (lastMsg.text.length > 40 ? "…" : ""))
                          : "Démarrer la conversation"}
                      </span>
                      {conv.unreadCount > 0 && (
                        <span className="chat-unread-badge">{conv.unreadCount}</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </aside>

      {/* ── Zone messages ──────────────────────────────────────────────── */}
      <main className="chat-main">
        {!activeConv ? (
          <div className="chat-empty-state">
            <div className="chat-empty-icon">💬</div>
            <h3>Vos messages</h3>
            <p>Sélectionnez une conversation ou recherchez un utilisateur pour commencer à discuter.</p>
          </div>
        ) : (
          <>
            <div className="chat-header">
               {/* Bouton retour mobile */}
  <button
    onClick={() => setMobileConvOpen(false)}
    style={{
      display: "none",
      background: "none", border: "none", cursor: "pointer",
      fontSize: 20, marginRight: 4, color: "#1A56DB"
    }}
    className="chat-back-btn"
  >
    ←
  </button>
              <Avatar user={activePeer} size={40} online={isPeerOnline} />
              <div className="chat-header-info">
                <span className="chat-header-name">{activePeer?.firstName} {activePeer?.lastName}</span>
                <span className="chat-header-status">
                  {isPeerOnline ? "🟢 En ligne" : "⚫ Hors ligne"}
                </span>
              </div>
              <button className="chat-header-profile" onClick={() => navigate(`/profile/${activePeer?._id}`)}>
                Voir le profil →
              </button>
            </div>

            <div className="chat-messages">
              {loadingMsgs ? (
                <div className="chat-messages-loading">
                  <div className="chat-spinner" />
                </div>
              ) : (
                <>
                  {groupedMessages.map((item, idx) =>
                    item.type === "date" ? (
                      <div key={idx} className="chat-date-separator">
                        <span>{item.label}</span>
                      </div>
                    ) : (
                      <div
                        key={item.data._id}
                        className={`chat-msg-wrap ${item.data.senderId === currentUserId ? "chat-msg-mine" : "chat-msg-theirs"}`}
                      >
                        {item.data.senderId !== currentUserId && (
                          <Avatar user={activePeer} size={28} />
                        )}
                        <div className="chat-bubble-wrap">
                          <div className={`chat-bubble ${item.data.senderId === currentUserId ? "chat-bubble-mine" : "chat-bubble-theirs"}`}>
                            {item.data.messageType === "location" && item.data.location?.lat && item.data.location?.lng ? (
                              <div style={{ width: 240 }}>
                                <div style={{ marginBottom: 8, fontWeight: 600 }}>📍 Localisation</div>
                                <div style={{ borderRadius: 10, overflow: "hidden", border: "1px solid rgba(15,23,42,0.1)" }}>
                                  <MapContainer
                                    center={[item.data.location.lat, item.data.location.lng]}
                                    zoom={14}
                                    style={{ width: "100%", height: 160 }}
                                    scrollWheelZoom={false}
                                    dragging={false}
                                    doubleClickZoom={false}
                                    zoomControl={false}
                                    attributionControl={false}
                                  >
                                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                    <CircleMarker center={[item.data.location.lat, item.data.location.lng]} radius={8} pathOptions={{ color: "#2563eb", fillColor: "#2563eb", fillOpacity: 0.8 }} />
                                  </MapContainer>
                                </div>
                                <a
                                  href={`https://www.openstreetmap.org/?mlat=${item.data.location.lat}&mlon=${item.data.location.lng}#map=16/${item.data.location.lat}/${item.data.location.lng}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  style={{ fontSize: 12, color: item.data.senderId === currentUserId ? "#fff" : "#2563eb", textDecoration: "underline", marginTop: 6, display: "inline-block" }}
                                >
                                  Ouvrir dans la carte
                                </a>
                              </div>
                            ) : (
                              item.data.text
                            )}
                          </div>
                          <span className="chat-msg-time">
                            {formatTime(item.data.createdAt)}
                            {item.data.senderId === currentUserId ? ` • ${item.data.read ? "Vu" : "Envoyé"}` : ""}
                          </span>
                        </div>
                      </div>
                    )
                  )}

                  {typingFrom && typingFrom !== currentUserId && (
                    <div className="chat-msg-wrap chat-msg-theirs">
                      <Avatar user={activePeer} size={28} />
                      <div className="chat-bubble-wrap">
                        <div className="chat-bubble chat-bubble-theirs chat-typing">
                          <span /><span /><span />
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            <div className="chat-input-area">
              {showEmojiPicker && (
                <div style={{ position: "absolute", bottom: 74, right: 94, background: "#fff", border: "1px solid #E2E8F0", borderRadius: 12, boxShadow: "0 12px 28px rgba(15,23,42,0.15)", padding: 10, display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 6, zIndex: 20 }}>
                  {QUICK_EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => appendEmoji(emoji)}
                      style={{ border: "none", background: "transparent", fontSize: 20, cursor: "pointer", padding: 4 }}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}
              <button
                type="button"
                className="chat-send-btn"
                onClick={() => setShowEmojiPicker((prev) => !prev)}
                style={{ marginRight: 8 }}
                title="Emoji"
              >
                😊
              </button>
              <button
                type="button"
                className="chat-send-btn"
                onClick={sendLocationMessage}
                disabled={sendingLocation}
                style={{ marginRight: 8 }}
                title="Partager ma localisation"
              >
                📍
              </button>
              <textarea
                className="chat-input"
                placeholder="Écrivez un message..."
                value={text}
                onChange={handleTextChange}
                onKeyDown={handleKeyDown}
                rows={1}
              />
              <button
                className="chat-send-btn"
                onClick={sendMessage}
                disabled={!text.trim()}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 20, height: 20 }}>
                  <line x1="22" y1="2" x2="11" y2="13"/>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
