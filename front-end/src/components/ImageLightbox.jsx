import { useEffect } from "react";
import { createPortal } from "react-dom";

export default function ImageLightbox({ src, alt = "", onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  if (!src) return null;

  return createPortal(
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(8,12,22,0.92)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 5000,
        padding: "24px",
        animation: "lightboxFade 0.2s ease",
        cursor: "zoom-out",
      }}
    >
      <style>{`
        @keyframes lightboxFade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes lightboxZoom {
          from { opacity: 0; transform: scale(0.92); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>

      <button
        onClick={onClose}
        aria-label="Fermer"
        style={{
          position: "absolute",
          top: 20,
          right: 24,
          width: 42,
          height: 42,
          borderRadius: "50%",
          border: "none",
          background: "rgba(255,255,255,0.12)",
          color: "#fff",
          fontSize: 20,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "background 0.15s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.22)")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.12)")}
      >
        ✕
      </button>

      <img
        src={src}
        alt={alt}
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: "min(92vw, 1000px)",
          maxHeight: "88vh",
          objectFit: "contain",
          borderRadius: 14,
          boxShadow: "0 30px 90px rgba(0,0,0,0.5)",
          animation: "lightboxZoom 0.25s cubic-bezier(0.22,1,0.36,1)",
          cursor: "default",
        }}
      />
    </div>,
    document.body
  );
}
