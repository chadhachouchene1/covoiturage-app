import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { baseUrl } from "../utils/services";
import "./parametre.css";

export default function Settings() {
  const { user, setUser } = useContext(AuthContext);
  const currentUserId = user?.id || user?._id;
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    birthPlace: "",
    dateOfBirth: "",
    image: null,
  });
  const [emailStep, setEmailStep] = useState(1);
  const [newEmail, setNewEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("Token");

  const parseResponse = async (res) => {
    const raw = await res.text();
    let data = {};
    try {
      data = raw ? JSON.parse(raw) : {};
    } catch {
      data = { message: raw || "Réponse serveur invalide" };
    }
    return data;
  };

  useEffect(() => {
    const load = async () => {
      if (!currentUserId) return;
      try {
        const res = await fetch(`${baseUrl}/users/find/${currentUserId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await parseResponse(res);
        if (res.ok) {
          setForm((prev) => ({
            ...prev,
            firstName: data.firstName || "",
            lastName: data.lastName || "",
            phone: data.phone || "",
            birthPlace: data.birthPlace || "",
            dateOfBirth: data.dateOfBirth ? data.dateOfBirth.slice(0, 10) : "",
          }));
        }
      } catch {}
      setLoading(false);
    };
    load();
  }, [currentUserId, token]);

  const saveProfile = async (e) => {
    e.preventDefault();
    setMsg(null);
    if (!token) {
      setMsg({ type: "error", text: "Session expirée, reconnectez-vous." });
      return;
    }
    const fd = new FormData();
    fd.append("firstName", form.firstName);
    fd.append("lastName", form.lastName);
    fd.append("phone", form.phone);
    fd.append("birthPlace", form.birthPlace);
    fd.append("dateOfBirth", form.dateOfBirth);
    if (form.image) fd.append("image", form.image);

    try {
      const res = await fetch(`${baseUrl}/users/me/profile`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      const data = await parseResponse(res);
      if (!res.ok) return setMsg({ type: "error", text: data.message || "Erreur mise à jour profil" });
      setUser(data.user);
      localStorage.setItem("User", JSON.stringify(data.user));
      setMsg({ type: "success", text: data.message || "Profil mis à jour" });
    } catch {
      setMsg({ type: "error", text: "Erreur réseau" });
    }
  };

  const sendOtpForEmail = async () => {
    setMsg(null);
    if (!token) {
      setMsg({ type: "error", text: "Session expirée, reconnectez-vous." });
      return;
    }
    try {
      const res = await fetch(`${baseUrl}/users/me/email/send-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ newEmail }),
      });
      const data = await parseResponse(res);
      if (!res.ok) return setMsg({ type: "error", text: data.message || "Erreur envoi OTP" });
      setEmailStep(2);
      setMsg({ type: "success", text: data.message || "OTP envoyé" });
    } catch {
      setMsg({ type: "error", text: "Erreur réseau" });
    }
  };

  const verifyEmailOtp = async () => {
    setMsg(null);
    if (!token) {
      setMsg({ type: "error", text: "Session expirée, reconnectez-vous." });
      return;
    }
    try {
      const res = await fetch(`${baseUrl}/users/me/email/verify`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ newEmail, code: otpCode }),
      });
      const data = await parseResponse(res);
      if (!res.ok) return setMsg({ type: "error", text: data.message || "OTP invalide" });
      setUser(data.user);
      localStorage.setItem("User", JSON.stringify(data.user));
      setEmailStep(1);
      setOtpCode("");
      setNewEmail("");
      setMsg({ type: "success", text: data.message || "Email modifié" });
    } catch {
      setMsg({ type: "error", text: "Erreur réseau" });
    }
  };

  const updatePassword = async (e) => {
    e.preventDefault();
    setMsg(null);
    if (!token) {
      setMsg({ type: "error", text: "Session expirée, reconnectez-vous." });
      return;
    }
    if (newPassword !== confirmPassword) {
      return setMsg({ type: "error", text: "Confirmation mot de passe incorrecte" });
    }
    try {
      const res = await fetch(`${baseUrl}/users/me/password`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await parseResponse(res);
      if (!res.ok) return setMsg({ type: "error", text: data.message || "Erreur mot de passe" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setMsg({ type: "success", text: data.message || "Mot de passe modifié" });
    } catch {
      setMsg({ type: "error", text: "Erreur réseau" });
    }
  };

  if (loading) {
    return (
      <div className="settings-page">
        <div className="settings-loading">
          <div className="settings-loading-spinner" />
          <p>Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="settings-page">
      <header className="settings-hero">
        <div className="settings-hero-bg" aria-hidden />
        <div className="settings-hero-overlay" aria-hidden />
        <div className="settings-hero-inner">
          <h1 className="settings-title">Paramètres du compte</h1>
          <p className="settings-subtitle">
            Mettez à jour votre profil, votre email et votre mot de passe 
          </p>
        </div>
      </header>

      <div className="settings-wrap">
        {msg && (
          <div className={`settings-alert ${msg.type === "error" ? "settings-alert--error" : "settings-alert--success"}`}>
            {msg.text}
          </div>
        )}

        <form onSubmit={saveProfile} className="settings-card">
          <h2 className="settings-card-title">Profil</h2>
          <div className="settings-grid">
            <div className="settings-field">
              <label className="settings-label" htmlFor="set-first">Prénom</label>
              <input
                id="set-first"
                className="settings-input"
                placeholder="Prénom"
                value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
              />
            </div>
            <div className="settings-field">
              <label className="settings-label" htmlFor="set-last">Nom</label>
              <input
                id="set-last"
                className="settings-input"
                placeholder="Nom"
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
              />
            </div>
            <div className="settings-field">
              <label className="settings-label" htmlFor="set-phone">Téléphone</label>
              <input
                id="set-phone"
                className="settings-input"
                placeholder="Téléphone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
            <div className="settings-field">
              <label className="settings-label" htmlFor="set-birthplace">Lieu de naissance</label>
              <input
                id="set-birthplace"
                className="settings-input"
                placeholder="Lieu de naissance"
                value={form.birthPlace}
                onChange={(e) => setForm({ ...form, birthPlace: e.target.value })}
              />
            </div>
            <div className="settings-field">
              <label className="settings-label" htmlFor="set-dob">Date de naissance</label>
              <input
                id="set-dob"
                className="settings-input"
                type="date"
                value={form.dateOfBirth}
                onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
              />
            </div>
            <div className="settings-field">
              <label className="settings-label" htmlFor="set-photo">Photo de profil</label>
              <input
                id="set-photo"
                className="settings-input"
                type="file"
                accept="image/*"
                onChange={(e) => setForm({ ...form, image: e.target.files?.[0] || null })}
              />
            </div>
          </div>
          <div className="settings-actions">
            <button type="submit" className="settings-btn settings-btn--primary">
              Enregistrer le profil
            </button>
          </div>
        </form>

        <section className="settings-card">
          <h2 className="settings-card-title">Changer l&apos;email</h2>
          {emailStep === 1 ? (
            <div className="settings-row">
              <input
                className="settings-input"
                type="email"
                placeholder="Nouvel email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
              />
              <button type="button" className="settings-btn settings-btn--teal" onClick={sendOtpForEmail}>
                Envoyer 
              </button>
            </div>
          ) : (
            <div className="settings-row">
              <input
                className="settings-input"
                placeholder="Code OTP"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
              />
              <button type="button" className="settings-btn settings-btn--success" onClick={verifyEmailOtp}>
                Vérifier et changer
              </button>
            </div>
          )}
        </section>

        <form onSubmit={updatePassword} className="settings-card">
          <h2 className="settings-card-title">Mot de passe</h2>
          <div className="settings-grid settings-grid--single">
            <div className="settings-field">
              <label className="settings-label" htmlFor="set-cur-pw">Mot de passe actuel</label>
              <input
                id="set-cur-pw"
                className="settings-input"
                type="password"
                placeholder="Mot de passe actuel"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
            <div className="settings-field">
              <label className="settings-label" htmlFor="set-new-pw">Nouveau mot de passe</label>
              <input
                id="set-new-pw"
                className="settings-input"
                type="password"
                placeholder="Nouveau mot de passe"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div className="settings-field">
              <label className="settings-label" htmlFor="set-confirm-pw">Confirmer</label>
              <input
                id="set-confirm-pw"
                className="settings-input"
                type="password"
                placeholder="Confirmer le nouveau mot de passe"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>
          <div className="settings-actions">
            <button type="submit" className="settings-btn settings-btn--purple">
              Mettre à jour le mot de passe
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
