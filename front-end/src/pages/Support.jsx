import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { baseUrl } from "../utils/services";
import "./Support.css";
import { useEffect } from "react";
const CATEGORIES = [
  { value: "reservation",  label: "🎫 Problème de réservation" },
  { value: "paiement",     label: "💳 Problème de paiement" },
  { value: "compte",       label: "👤 Problème de compte" },
  { value: "trajet",       label: "🚗 Problème avec un trajet" },
  { value: "securite",     label: "🔒 Signalement / Sécurité" },
  { value: "autre",        label: "💬 Autre" },
];

export default function Support() {
  const { user } = useContext(AuthContext);

  const [form, setForm] = useState({
  firstName: "",
  lastName: "",
  email: "",
  category: "",
  subject: "",
  message: "",
  });

  const [loading,  setLoading]  = useState(false);
  const [success,  setSuccess]  = useState(false);
  const [error,    setError]    = useState(null);
  useEffect(() => {
    if (user) {
      const names = user?.name?.split(" ") || [];

      setForm(prev => ({
        ...prev,
        firstName: names[0] || "",
        lastName: names[1] || "",
        email: user?.email || "",
      }));
    }
  }, [user]);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!form.firstName || !form.lastName || !form.email || !form.category || !form.subject || !form.message) {
      return setError("Veuillez remplir tous les champs obligatoires.");
    }
    if (form.message.length < 10) {
      return setError("Votre message doit contenir au moins 10 caractères.");
    }

    setLoading(true);
    try {
      const res = await fetch(`${baseUrl}/support/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, userId: user?.id }),
      });
      const data = await res.json();
      setLoading(false);
      if (!res.ok) return setError(data.message || "Erreur lors de l'envoi.");
      
      setSuccess(true);
    } catch {
      setLoading(false);
      setError("Erreur réseau. Vérifiez votre connexion et réessayez.");
    }
  };

  if (success) {
    return (
      <div className="support-page">
        <div className="support-bg" />
        <div className="support-overlay" />
        <div className="support-success-card">
          <div className="success-icon">✅</div>
          <h2 className="success-title">Message envoyé !</h2>
          <p className="success-sub">
            Votre demande a bien été transmise à l'équipe support de Tawsila.
          </p>
          
          <div className="success-info">
            <p>📧 Une confirmation a été envoyée à <strong>{form.email}</strong></p>
            <p>⏱️ Notre équipe vous répondra dans les <strong>24–48h</strong> ouvrées.</p>
          </div>
          <button
            className="btn-back-home"
            onClick={() => { setSuccess(false); setForm({ firstName: user?.name?.split(" ")[0] || "", lastName: user?.name?.split(" ")[1] || "", email: user?.email || "", category: "", subject: "", message: "" }); }}
          >
            Envoyer une autre demande
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="support-page">
      <div className="support-bg" />
      <div className="support-overlay" />

      <div className="support-wrapper">

        {/* ── Left — Info ── */}
        <div className="support-info">
          <div className="support-info-card">
            <h2 className="info-title">🚗 Support Tawsila</h2>
            <p className="info-sub">
              Vous avez un problème ou une question ? Notre équipe est là pour vous aider.
            </p>

            <div className="info-items">
              {[
                { icon: "⏱️", title: "Temps de réponse",   desc: "24–48h ouvrées" },
                { icon: "📧", title: "Email support",       desc: "Tawwsila@gmail.com" },
                { icon: "🔒", title: "Données sécurisées",  desc: "Vos infos restent confidentielles" },
                
              ].map(({ icon, title, desc }) => (
                <div key={title} className="info-item">
                  <span className="info-icon">{icon}</span>
                  <div>
                    <strong>{title}</strong>
                    <span>{desc}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="info-categories">
              <p className="info-cats-title">Catégories disponibles :</p>
              {CATEGORIES.map(c => (
                <span key={c.value} className="info-cat-pill">{c.label}</span>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right — Form ── */}
        <div className="support-form-wrap">
          <div className="support-form-card">
            <div className="form-card-header">
              <h1 className="form-card-title">Contactez le support</h1>
              <p className="form-card-sub">Remplissez le formulaire — nous vous répondrons rapidement</p>
            </div>

            <form onSubmit={handleSubmit} className="support-form" noValidate>

              {/* Nom / Prénom */}
              <div className="form-row">
                <div className="form-field">
                  <label>Prénom <span className="req">*</span></label>
                  <input
                    name="firstName"
                    value={form.firstName}
                    onChange={handleChange}
                    placeholder="Votre prénom"
                    required
                    disabled={!!user}
                  />
                </div>
                <div className="form-field">
                  <label>Nom <span className="req">*</span></label>
                  <input
                    name="lastName"
                    value={form.lastName}
                    onChange={handleChange}
                    placeholder="Votre nom"
                    required
                    disabled={!!user}
                  />
                </div>
              </div>

              {/* Email */}
              <div className="form-field">
                <label>Adresse email <span className="req">*</span></label>
                <div className="input-with-icon">
                  <span>📧</span>
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="votre@email.com"
                    required
                    disabled={!!user}
                    autoComplete="email"
                  />
                </div>
                {user && <p className="field-hint">Email lié à votre compte Tawsila</p>}
              </div>

              {/* Catégorie */}
              <div className="form-field">
                <label>Catégorie <span className="req">*</span></label>
                <div className="select-wrap">
                  <select name="category" value={form.category} onChange={handleChange} required>
                    <option value="">— Choisissez une catégorie —</option>
                    {CATEGORIES.map(c => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                  <span className="select-arrow">▾</span>
                </div>
              </div>

              {/* Sujet */}
              <div className="form-field">
                <label>Sujet <span className="req">*</span></label>
                <input
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                  placeholder="Résumez votre problème en une phrase"
                  maxLength={120}
                  required
                />
                <span className="char-count">{form.subject.length}/120</span>
              </div>

              {/* Message */}
              <div className="form-field">
                <label>Description détaillée <span className="req">*</span></label>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  placeholder="Décrivez votre problème en détail : quand est-ce arrivé ? Quel trajet ? Quel message d'erreur ?"
                  rows={5}
                  maxLength={2000}
                  required
                />
                <span className="char-count">{form.message.length}/2000</span>
              </div>

              {error && (
                <div className="form-error">
                  <span>⚠️</span> {error}
                </div>
              )}

              <button type="submit" className="btn-send" disabled={loading}>
                {loading
                  ? <><span className="btn-spinner" /> Envoi en cours...</>
                  : <>📨 Envoyer au support</>}
              </button>

              <p className="form-note">
                En envoyant ce message, vous acceptez que vos données soient traitées par l'équipe support de Tawsila.
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
