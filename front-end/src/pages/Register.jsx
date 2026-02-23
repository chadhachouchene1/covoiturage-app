import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { baseUrl } from "../utils/services";
import tawsilaLogo from "../assets/tawsilalogo.png";

const Register = () => {
  const { registerUser, isRegisterLoading, registerError } = useContext(AuthContext);

  const [step, setStep] = useState(1);
  const [agreed, setAgreed] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [preview, setPreview] = useState(null);
  const [otpError, setOtpError] = useState(null);
  const [otpLoading, setOtpLoading] = useState(false);
  const [resendMsg, setResendMsg] = useState(null);

  const [formData, setFormData] = useState({
    firstName: "", lastName: "", dateOfBirth: "", birthPlace: "",
    email: "", phone: "", password: "", confirmPassword: "", image: null,
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image" && files[0]) {
      setFormData((prev) => ({ ...prev, image: files[0] }));
      setPreview(URL.createObjectURL(files[0]));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setOtpError(null);
    if (formData.password !== formData.confirmPassword) return setOtpError("Les mots de passe ne correspondent pas");
    if (formData.password.length < 6) return setOtpError("Le mot de passe doit contenir au moins 6 caractères");
    if (!/[A-Z]/.test(formData.password)) return setOtpError("Le mot de passe doit contenir au moins une majuscule");
    if (!/[0-9]/.test(formData.password)) return setOtpError("Le mot de passe doit contenir au moins un chiffre");
    setOtpLoading(true);
    try {
      const res = await fetch(`${baseUrl}/users/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, phone: formData.phone, firstName: formData.firstName }),
      });
      const data = await res.json();
      setOtpLoading(false);
      if (!res.ok) return setOtpError(data.message);
      setStep(2);
    } catch {
      setOtpLoading(false);
      setOtpError("Erreur réseau. Réessayez.");
    }
  };

  const handleVerification = async (e) => {
    e.preventDefault();
    setOtpError(null);
    setOtpLoading(true);
    try {
      const res = await fetch(`${baseUrl}/users/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, code: verificationCode }),
      });
      const data = await res.json();
      setOtpLoading(false);
      if (!res.ok) return setOtpError(data.message);
      setStep(3);
    } catch {
      setOtpLoading(false);
      setOtpError("Erreur réseau. Réessayez.");
    }
  };

  const handleResend = async () => {
    setResendMsg(null);
    setOtpError(null);
    try {
      const res = await fetch(`${baseUrl}/users/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, phone: formData.phone, firstName: formData.firstName }),
      });
      const data = await res.json();
      if (res.ok) setResendMsg("Nouveau code envoyé !");
      else setOtpError(data.message);
    } catch {
      setOtpError("Erreur réseau.");
    }
  };

  const handleFinalRegister = (e) => {
    e.preventDefault();
    if (!agreed) return;
    registerUser(e, formData);
  };

  const handleOtpInput = (e, index) => {
    const val = e.target.value.replace(/\D/, "");
    const arr = verificationCode.padEnd(4, " ").split("");
    arr[index] = val || " ";
    const newCode = arr.join("").trimEnd();
    setVerificationCode(newCode);
    if (val && e.target.nextSibling) e.target.nextSibling.focus();
    if (!val && e.target.previousSibling) e.target.previousSibling.focus();
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .rg-page {
          min-height: 100dvh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px 16px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          background:
            radial-gradient(ellipse at 15% 25%, rgba(37,99,235,0.2) 0%, transparent 55%),
            radial-gradient(ellipse at 85% 75%, rgba(13,31,78,0.5) 0%, transparent 60%),
            linear-gradient(150deg, #0d1f4e 0%, #091533 100%);
          position: relative;
          overflow: hidden;
        }

        .rg-page::before {
          content: '';
          position: fixed;
          inset: 0;
          background-image: radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px);
          background-size: 36px 36px;
          pointer-events: none;
        }

        /* ── Card ── */
        .rg-card {
          background: rgba(255,255,255,0.04);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(59,130,246,0.25);
          border-radius: 20px;
          width: 100%;
          max-width: 560px;
          overflow: hidden;
          box-shadow:
            0 0 0 1px rgba(37,99,235,0.1),
            0 20px 60px rgba(0,0,0,0.5);
          position: relative;
          z-index: 1;
          animation: rgFadeUp 0.5s cubic-bezier(0.16,1,0.3,1);
        }

        @keyframes rgFadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* ── Header ── */
        .rg-header {
          background: white;
          padding: 16px 28px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1.5px solid #e8ecf4;
        }

        .rg-brand {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .rg-brand-logo {
          width: 80px; height: 80px;
          object-fit: contain;
          filter: none;
        }

        .rg-brand-name {
          font-size: 1.05rem;
          font-weight: 800;
          color: #0d1f4e;
          letter-spacing: -0.3px;
          line-height: 1;
        }

        .rg-brand-tag {
          font-size: 10px;
          color: #2563eb;
          font-weight: 600;
          letter-spacing: 0.3px;
          display: block;
          margin-top: 2px;
        }

        /* ── Stepper ── */
        .rg-stepper {
          display: flex;
          align-items: center;
          gap: 0;
        }

        .rg-step-item {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .rg-step-dot {
          width: 30px; height: 30px;
          border-radius: 50%;
          background: #f1f5f9;
          color: #94a3b8;
          font-size: 12px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1.5px solid #e2e8f0;
          transition: all 0.3s;
        }

        .rg-step-dot.active {
          background: #0d1f4e;
          color: white;
          border-color: #0d1f4e;
          box-shadow: 0 0 0 3px rgba(13,31,78,0.12);
        }

        .rg-step-dot.done {
          background: #4ade80;
          color: white;
          border-color: #4ade80;
        }

        .rg-step-label {
          font-size: 11px;
          font-weight: 600;
          color: #94a3b8;
          transition: color 0.3s;
        }

        .rg-step-label.active { color: #0d1f4e; }
        .rg-step-label.done { color: #4ade80; }

        .rg-step-line {
          width: 24px; height: 2px;
          background: #e2e8f0;
          border-radius: 2px;
          transition: background 0.3s;
          margin: 0 4px;
        }

        .rg-step-line.done { background: #4ade80; }

        /* ── Progress ── */
        .rg-progress {
          height: 3px;
          background: #e8ecf4;
        }

        .rg-progress-bar {
          height: 100%;
          background: linear-gradient(90deg, #0d1f4e, #2563eb);
          transition: width 0.4s cubic-bezier(0.16,1,0.3,1);
        }

        /* ── Form body ── */
        .rg-body {
          padding: 28px 32px;
          color: #f1f5f9;
        }

        .rg-title {
          font-size: 1.45rem;
          font-weight: 800;
          color: #f1f5f9;
          letter-spacing: -0.4px;
          margin-bottom: 0.3rem;
        }

        .rg-subtitle {
          font-size: 0.88rem;
          color: #64748b;
          margin-bottom: 1.6rem;
        }

        /* ── Avatar ── */
        .rg-avatar-wrap {
          display: flex;
          justify-content: center;
          margin-bottom: 1.5rem;
        }

        .rg-avatar-label {
          cursor: pointer;
          width: 84px; height: 84px;
          border-radius: 50%;
          border: 2px dashed rgba(59,130,246,0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          transition: border-color 0.2s;
          background: rgba(255,255,255,0.04);
        }

        .rg-avatar-label:hover { border-color: #3b82f6; }

        .rg-avatar-img {
          width: 100%; height: 100%;
          object-fit: cover;
        }

        .rg-avatar-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          color: #64748b;
          font-size: 11px;
          font-weight: 600;
          text-align: center;
        }

        /* ── Grid ── */
        .rg-row {
          display: flex;
          gap: 14px;
        }

        .rg-field {
          flex: 1;
          margin-bottom: 1rem;
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .rg-label {
          font-size: 0.8rem;
          font-weight: 700;
          color: #94a3b8;
          letter-spacing: 0.3px;
        }

        .rg-input {
          background: rgba(255,255,255,0.06);
          border: 1.5px solid rgba(59,130,246,0.2);
          border-radius: 10px;
          padding: 10px 13px;
          color: #f1f5f9;
          font-size: 0.9rem;
          outline: none;
          width: 100%;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-weight: 500;
          transition: all 0.2s;
        }

        .rg-input:focus {
          border-color: #3b82f6;
          background: rgba(255,255,255,0.09);
          box-shadow: 0 0 0 3px rgba(59,130,246,0.12);
        }

        .rg-input::placeholder { color: #374151; }

        /* Date input color fix */
        .rg-input[type="date"]::-webkit-calendar-picker-indicator {
          filter: invert(0.5);
          cursor: pointer;
        }

        /* ── OTP ── */
        .rg-otp-icon {
          text-align: center;
          font-size: 3rem;
          margin-bottom: 0.8rem;
        }

        .rg-otp-wrap {
          display: flex;
          gap: 12px;
          justify-content: center;
          margin: 1.8rem 0;
        }

        .rg-otp-box {
          width: 58px; height: 66px;
          text-align: center;
          font-size: 1.7rem;
          font-weight: 800;
          background: rgba(255,255,255,0.05);
          border: 2px solid rgba(59,130,246,0.25);
          border-radius: 12px;
          color: white;
          outline: none;
          font-family: 'Plus Jakarta Sans', sans-serif;
          transition: all 0.2s;
          caret-color: #3b82f6;
        }

        .rg-otp-box:focus {
          border-color: #3b82f6;
          background: rgba(255,255,255,0.09);
          box-shadow: 0 0 0 3px rgba(59,130,246,0.18);
        }

        /* ── Rules ── */
        .rg-rules-box {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(59,130,246,0.15);
          border-radius: 14px;
          padding: 14px 16px;
          margin-bottom: 1.2rem;
          max-height: 270px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 12px;
          scrollbar-width: thin;
          scrollbar-color: rgba(59,130,246,0.3) transparent;
        }

        .rg-rule {
          display: flex;
          gap: 12px;
          align-items: flex-start;
        }

        .rg-rule-icon { font-size: 18px; flex-shrink: 0; margin-top: 1px; }

        .rg-rule-title {
          font-size: 13px;
          font-weight: 700;
          color: #e2e8f0;
          margin-bottom: 2px;
        }

        .rg-rule-text {
          font-size: 12px;
          color: #64748b;
          line-height: 1.45;
        }

        /* ── Checkbox ── */
        .rg-agree-row {
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
          margin-bottom: 1.2rem;
          user-select: none;
        }

        .rg-checkbox {
          width: 20px; height: 20px;
          border-radius: 6px;
          border: 2px solid rgba(59,130,246,0.35);
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
        }

        .rg-checkbox.checked {
          background: #2563eb;
          border-color: #2563eb;
        }

        .rg-agree-text {
          font-size: 13.5px;
          color: #94a3b8;
        }

        .rg-agree-text span {
          color: #3b82f6;
          font-weight: 700;
        }

        /* ── Error / Success ── */
        .rg-error {
          background: rgba(239,68,68,0.1);
          border: 1px solid rgba(239,68,68,0.3);
          border-left: 3px solid #ef4444;
          color: #fca5a5;
          padding: 10px 13px;
          border-radius: 10px;
          font-size: 0.85rem;
          margin-bottom: 0.9rem;
          line-height: 1.5;
        }

        .rg-success {
          background: rgba(34,197,94,0.1);
          border: 1px solid rgba(34,197,94,0.3);
          border-left: 3px solid #22c55e;
          color: #86efac;
          padding: 10px 13px;
          border-radius: 10px;
          font-size: 0.85rem;
          margin-bottom: 0.9rem;
        }

        /* ── Button ── */
        .rg-btn {
          width: 100%;
          padding: 13px;
          border-radius: 11px;
          background: linear-gradient(135deg, #0d1f4e 0%, #2563eb 100%);
          color: white;
          border: none;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-weight: 700;
          font-size: 0.94rem;
          cursor: pointer;
          margin-top: 0.5rem;
          transition: all 0.22s;
          box-shadow: 0 4px 14px rgba(37,99,235,0.28);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .rg-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 22px rgba(37,99,235,0.4);
        }

        .rg-btn:disabled { opacity: 0.55; cursor: not-allowed; transform: none; }

        .rg-spinner {
          width: 16px; height: 16px;
          border-radius: 50%;
          border: 2.5px solid rgba(255,255,255,0.3);
          border-top-color: white;
          animation: rgSpin 0.75s linear infinite;
        }
        @keyframes rgSpin { to { transform: rotate(360deg); } }

        /* ── Links ── */
        .rg-login-link {
          text-align: center;
          color: #64748b;
          font-size: 0.87rem;
          margin-top: 1.2rem;
        }

        .rg-login-link a {
          color: #3b82f6;
          font-weight: 700;
          text-decoration: none;
        }
        .rg-login-link a:hover { text-decoration: underline; }

        .rg-link-btn {
          background: none;
          border: none;
          color: #3b82f6;
          font-weight: 700;
          font-size: 0.87rem;
          cursor: pointer;
          font-family: 'Plus Jakarta Sans', sans-serif;
          padding: 0;
        }
        .rg-link-btn:hover { text-decoration: underline; }
      `}</style>

      <div className="rg-page">
        <div className="rg-card">

          {/* ── Header ── */}
          <div className="rg-header">
            <div className="rg-brand">
              <img src={tawsilaLogo} alt="Tawsila" className="rg-brand-logo" />
              <div>
                <span className="rg-brand-name">Tawsila</span>
                <span className="rg-brand-tag">Your Ride, Our Pride</span>
              </div>
            </div>
            <div className="rg-stepper">
              {[["Infos", 1], ["Email", 2], ["Règles", 3]].map(([label, s]) => (
                <div key={s} style={{ display: "flex", alignItems: "center" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                    <div className={`rg-step-dot ${step === s ? "active" : ""} ${step > s ? "done" : ""}`}>
                      {step > s ? (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      ) : s}
                    </div>
                    <span className={`rg-step-label ${step === s ? "active" : ""} ${step > s ? "done" : ""}`}>{label}</span>
                  </div>
                  {s < 3 && <div className={`rg-step-line ${step > s ? "done" : ""}`} style={{ marginBottom: 16 }} />}
                </div>
              ))}
            </div>
          </div>

          {/* ── Progress ── */}
          <div className="rg-progress">
            <div className="rg-progress-bar" style={{ width: `${((step - 1) / 2) * 100}%` }} />
          </div>

          {/* ── STEP 1 : Formulaire ── */}
          {step === 1 && (
            <form onSubmit={handleFormSubmit} className="rg-body">
              <h2 className="rg-title">Créer un compte</h2>
              <p className="rg-subtitle">Rejoignez la communauté Tawsila</p>

              {/* Avatar */}
              <div className="rg-avatar-wrap">
                <label htmlFor="image" className="rg-avatar-label">
                  {preview ? (
                    <img src={preview} alt="preview" className="rg-avatar-img" />
                  ) : (
                    <div className="rg-avatar-placeholder">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                        <circle cx="12" cy="13" r="4"/>
                      </svg>
                      <span>Photo</span>
                    </div>
                  )}
                </label>
                <input id="image" name="image" type="file" accept="image/*" onChange={handleChange} style={{ display: "none" }} />
              </div>

              <div className="rg-row">
                <div className="rg-field">
                  <label className="rg-label">Prénom</label>
                  <input className="rg-input" name="firstName" type="text" placeholder="Votre prénom" value={formData.firstName} onChange={handleChange} required />
                </div>
                <div className="rg-field">
                  <label className="rg-label">Nom</label>
                  <input className="rg-input" name="lastName" type="text" placeholder="Votre nom" value={formData.lastName} onChange={handleChange} required />
                </div>
              </div>

              <div className="rg-row">
                <div className="rg-field">
                  <label className="rg-label">Date de naissance</label>
                  <input className="rg-input" name="dateOfBirth" type="date" value={formData.dateOfBirth} onChange={handleChange} required />
                </div>
                <div className="rg-field">
                  <label className="rg-label">Lieu de naissance</label>
                  <input className="rg-input" name="birthPlace" type="text" placeholder="Votre ville" value={formData.birthPlace} onChange={handleChange} required />
                </div>
              </div>

              <div className="rg-field">
                <label className="rg-label">Adresse email</label>
                <input className="rg-input" name="email" type="email" placeholder="exemple@email.com" value={formData.email} onChange={handleChange} required />
              </div>

              <div className="rg-field">
                <label className="rg-label">Numéro de téléphone</label>
                <input className="rg-input" name="phone" type="tel" placeholder="+216 XX XXX XXX" value={formData.phone} onChange={handleChange} required />
              </div>

              <div className="rg-row">
                <div className="rg-field">
                  <label className="rg-label">Mot de passe</label>
                  <input className="rg-input" name="password" type="password" placeholder="••••••••" value={formData.password} onChange={handleChange} required />
                </div>
                <div className="rg-field">
                  <label className="rg-label">Confirmer</label>
                  <input className="rg-input" name="confirmPassword" type="password" placeholder="••••••••" value={formData.confirmPassword} onChange={handleChange} required />
                </div>
              </div>

              {otpError && <div className="rg-error">{otpError}</div>}

              <button type="submit" className="rg-btn" disabled={otpLoading}>
                {otpLoading ? <><div className="rg-spinner" /> Envoi du code…</> : "Envoyer le code de vérification"}
              </button>

              <p className="rg-login-link">
                Déjà un compte ?{" "}
                <Link to="/login">Se connecter</Link>
              </p>
            </form>
          )}

          {/* ── STEP 2 : OTP ── */}
          {step === 2 && (
            <form onSubmit={handleVerification} className="rg-body">
              <div className="rg-otp-icon">📧</div>
              <h2 className="rg-title" style={{ textAlign: "center" }}>Vérification email</h2>
              <p className="rg-subtitle" style={{ textAlign: "center" }}>
                Un code à 4 chiffres a été envoyé à{" "}
                <strong style={{ color: "#93c5fd" }}>{formData.email}</strong>
              </p>

              <div className="rg-otp-wrap">
                {[0, 1, 2, 3].map((i) => (
                  <input
                    key={i}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    className="rg-otp-box"
                    value={verificationCode[i] || ""}
                    onChange={(e) => handleOtpInput(e, i)}
                  />
                ))}
              </div>

              {otpError && <div className="rg-error">{otpError}</div>}
              {resendMsg && <div className="rg-success">{resendMsg}</div>}

              <button type="submit" className="rg-btn" disabled={otpLoading || verificationCode.replace(/\s/g, "").length < 4}>
                {otpLoading ? <><div className="rg-spinner" /> Vérification…</> : "Vérifier le code"}
              </button>

              <p style={{ textAlign: "center", fontSize: "0.86rem", color: "#64748b", marginTop: "1rem" }}>
                Code non reçu ?{" "}
                <button type="button" className="rg-link-btn" onClick={handleResend}>Renvoyer</button>
              </p>
              <p style={{ textAlign: "center", fontSize: "0.86rem", color: "#64748b", marginTop: "6px" }}>
                <button type="button" className="rg-link-btn" onClick={() => setStep(1)}>← Modifier l'email</button>
              </p>
            </form>
          )}

          {/* ── STEP 3 : Règles ── */}
          {step === 3 && (
            <form onSubmit={handleFinalRegister} className="rg-body">
              <h2 className="rg-title">Conditions d'utilisation</h2>
              <p className="rg-subtitle">Lisez et acceptez nos règles pour rejoindre Tawsila</p>

              <div className="rg-rules-box">
                {[
                  ["🤝", "Respect mutuel", "Traitez chaque membre avec respect et bienveillance."],
                  ["⏰", "Ponctualité", "Respectez les horaires convenus avec les autres membres."],
                  ["🔒", "Confidentialité", "Ne partagez pas les informations personnelles des autres."],
                  ["💳", "Paiement honnête", "Payez le montant convenu sans contestation injustifiée."],
                  ["🚫", "Zéro tolérance", "Aucune discrimination, harcèlement ou comportement inapproprié."],
                  ["🔞", "Âge minimum", "Vous devez avoir au moins 18 ans pour utiliser cette plateforme."],
                ].map(([icon, title, text]) => (
                  <div key={title} className="rg-rule">
                    <span className="rg-rule-icon">{icon}</span>
                    <div>
                      <div className="rg-rule-title">{title}</div>
                      <p className="rg-rule-text">{text}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="rg-agree-row" onClick={() => setAgreed(!agreed)}>
                <div className={`rg-checkbox ${agreed ? "checked" : ""}`}>
                  {agreed && (
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  )}
                </div>
                <span className="rg-agree-text">
                  J'accepte les <span>conditions d'utilisation</span> de Tawsila
                </span>
              </div>

              {registerError && <div className="rg-error">{registerError}</div>}

              <button type="submit" className="rg-btn" disabled={!agreed || isRegisterLoading}>
                {isRegisterLoading ? <><div className="rg-spinner" /> Création en cours…</> : "Créer mon compte"}
              </button>
            </form>
          )}

        </div>
      </div>
    </>
  );
};

export default Register;
