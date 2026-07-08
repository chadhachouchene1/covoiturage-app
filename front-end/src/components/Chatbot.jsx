import { useState, useRef, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const VITE_API = import.meta.env.VITE_API_URL;

export default function Chatbot() {
  const { user } = useContext(AuthContext);
  const userId = user?.id || user?._id || "guest";

  // ── Historique unique par utilisateur ──
  const storageKey = `tawsila_chat_${userId}`;

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState(() => {
    try {
      const saved = sessionStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : [
        { role: "bot", text: "Ahlen! 👋 Ana Tawsila Assistant. Kifech najjem n3awnek?" }
      ];
    } catch {
      return [{ role: "bot", text: "Ahlen! 👋 Ana Tawsila Assistant. Kifech najjem n3awnek?" }];
    }
  });

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  // ── Sauvegarde l'historique à chaque nouveau message ──
  useEffect(() => {
    try {
      sessionStorage.setItem(storageKey, JSON.stringify(messages));
    } catch {}
  }, [messages, storageKey]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");

    const newMessages = [...messages, { role: "user", text: userMsg }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const res = await fetch(`${VITE_API}/chatbot`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("Token")}`,
        },
        body: JSON.stringify({
          message: userMsg,
          history: newMessages.slice(-6).map(m => ({
            role: m.role === "user" ? "user" : "assistant",
            content: m.text
          }))
        }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: "bot", text: data.reply || "Désolé, erreur!" }]);
    } catch {
      setMessages(prev => [...prev, { role: "bot", text: "❌ Erreur de connexion." }]);
    }
    setLoading(false);
  };