import { useState, useRef, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const VITE_API = import.meta.env.VITE_API_URL;

export default function Chatbot() {
  const { user } = useContext(AuthContext);
  const userId = user?.id || user?._id || "guest";
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

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

 const clearChat = () => {
  const initial = [{ role: "bot", text: "Ahlen! 👋 Ana Tawsila Assistant. Kifech najjem n3awnek?" }];
  setMessages(initial);
  sessionStorage.removeItem(storageKey);
};

// ← Ajoute ici
useEffect(() => {
  const saved = sessionStorage.getItem(storageKey);
  setMessages(saved ? JSON.parse(saved) : [
    { role: "bot", text: "Ahlen! 👋 Ana Tawsila Assistant. Kifech najjem n3awnek?" }
  ]);
}, [userId]);

  return (
    <>
      <style>{`
        .cb-bubble {
          position: fixed; bottom: 24px; right: 24px;
          width: 56px; height: 56px; border-radius: 50%;
          background: linear-gradient(135deg, #0D1A35, #1A56DB);
          border: none; cursor: pointer; z-index: 4000;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 6px 24px rgba(26,86,219,0.45);
          transition: transform 0.2s, box-shadow 0.2s;
          font-size: 24px;
        }
        .cb-bubble:hover { transform: scale(1.1); box-shadow: 0 8px 30px rgba(26,86,219,0.55); }

        .cb-window {
          position: fixed; bottom: 90px; right: 24px;
          width: 340px; height: 480px;
          background: #fff; border-radius: 20px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.18);
          display: flex; flex-direction: column;
          z-index: 4000; overflow: hidden;
          animation: cbSlide 0.25s cubic-bezier(0.22,1,0.36,1);
        }
        @keyframes cbSlide {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        .cb-header {
          background: linear-gradient(135deg, #0D1A35, #1A56DB);
          padding: 14px 16px;
          display: flex; align-items: center; gap: 10px;
        }
        .cb-header-avatar {
          width: 36px; height: 36px; border-radius: 50%;
          background: rgba(255,255,255,0.2);
          display: flex; align-items: center; justify-content: center;
          font-size: 18px;
        }
        .cb-header-info { flex: 1; }
        .cb-header-name { color: #fff; font-weight: 700; font-size: 14px; }
        .cb-header-status { color: rgba(255,255,255,0.65); font-size: 11px; }
        .cb-header-actions { display: flex; gap: 6px; }
        .cb-clear {
          background: rgba(255,255,255,0.15); border: none;
          color: rgba(255,255,255,0.8); cursor: pointer;
          font-size: 11px; padding: 4px 8px; border-radius: 6px;
          transition: background 0.15s; font-family: inherit;
        }
        .cb-clear:hover { background: rgba(255,255,255,0.25); color: #fff; }
        .cb-close {
          background: none; border: none; color: rgba(255,255,255,0.7);
          cursor: pointer; font-size: 18px; padding: 4px;
        }
        .cb-close:hover { color: #fff; }

        .cb-messages {
          flex: 1; overflow-y: auto; padding: 14px;
          display: flex; flex-direction: column; gap: 10px;
          background: #F8FAFC;
        }
        .cb-messages::-webkit-scrollbar { width: 4px; }
        .cb-messages::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 4px; }

        .cb-msg { display: flex; gap: 8px; align-items: flex-end; }
        .cb-msg.user { flex-direction: row-reverse; }

        .cb-msg-avatar {
          width: 28px; height: 28px; border-radius: 50%;
          background: linear-gradient(135deg, #0D1A35, #1A56DB);
          display: flex; align-items: center; justify-content: center;
          font-size: 14px; flex-shrink: 0;
        }

        .cb-msg-text {
          max-width: 78%; padding: 9px 13px;
          border-radius: 16px; font-size: 13px;
          line-height: 1.5; word-break: break-word;
        }
        .cb-msg.bot .cb-msg-text {
          background: #fff; color: #0C1220;
          border: 1px solid #E2E8F0;
          border-bottom-left-radius: 4px;
          box-shadow: 0 1px 4px rgba(0,0,0,0.05);
        }
        .cb-msg.user .cb-msg-text {
          background: #1A56DB; color: #fff;
          border-bottom-right-radius: 4px;
        }

        .cb-typing {
          display: flex; gap: 5px; padding: 10px 14px;
          background: #fff; border: 1px solid #E2E8F0;
          border-radius: 16px; border-bottom-left-radius: 4px;
          width: fit-content;
        }
        .cb-typing span {
          width: 7px; height: 7px; border-radius: 50%;
          background: #94A3B8; animation: cbDot 1.2s infinite;
        }
        .cb-typing span:nth-child(2) { animation-delay: 0.2s; }
        .cb-typing span:nth-child(3) { animation-delay: 0.4s; }
        @keyframes cbDot {
          0%,60%,100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-5px); opacity: 1; }
        }

        .cb-input-area {
          display: flex; gap: 8px; padding: 12px;
          border-top: 1px solid #E2E8F0; background: #fff;
        }
        .cb-input {
          flex: 1; border: 1.5px solid #E2E8F0; border-radius: 12px;
          padding: 8px 12px; font-size: 13px; outline: none;
          font-family: inherit; resize: none; background: #F8FAFC;
          transition: border-color 0.18s;
        }
        .cb-input:focus { border-color: #1A56DB; background: #fff; }
        .cb-send {
          width: 38px; height: 38px; border-radius: 50%;
          background: #1A56DB; color: #fff; border: none;
          cursor: pointer; display: flex; align-items: center;
          justify-content: center; flex-shrink: 0;
          transition: all 0.15s;
        }
        .cb-send:hover:not(:disabled) { background: #1344b8; transform: scale(1.05); }
        .cb-send:disabled { background: #CBD5E1; cursor: not-allowed; }

        @media (max-width: 480px) {
          .cb-window { width: calc(100vw - 32px); right: 16px; bottom: 80px; }
          .cb-bubble { bottom: 16px; right: 16px; }
        }
      `}</style>

      {/* Bubble button */}
      <button className="cb-bubble" onClick={() => setOpen(!open)}>
        {open ? "✕" : "🤖"}
      </button>

      {/* Chat window */}
      {open && (
        <div className="cb-window">
          <div className="cb-header">
            <div className="cb-header-avatar">🚗</div>
            <div className="cb-header-info">
              <div className="cb-header-name">Tawsila Assistant</div>
              <div className="cb-header-status">🟢 En ligne</div>
            </div>
            <div className="cb-header-actions">
              <button className="cb-clear" onClick={clearChat} title="Effacer la conversation">
                🗑️ Effacer
              </button>
              <button className="cb-close" onClick={() => setOpen(false)}>✕</button>
            </div>
          </div>

          <div className="cb-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`cb-msg ${msg.role}`}>
                {msg.role === "bot" && (
                  <div className="cb-msg-avatar">🚗</div>
                )}
                <div className="cb-msg-text">{msg.text}</div>
              </div>
            ))}
            {loading && (
              <div className="cb-msg bot">
                <div className="cb-msg-avatar">🚗</div>
                <div className="cb-typing">
                  <span /><span /><span />
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          <div className="cb-input-area">
            <textarea
              className="cb-input"
              placeholder="Écris ton message..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              rows={1}
            />
            <button className="cb-send" onClick={sendMessage} disabled={!input.trim() || loading}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
                <line x1="22" y1="2" x2="11" y2="13"/>
                <polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
