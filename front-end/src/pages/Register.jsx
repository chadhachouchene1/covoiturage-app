import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { baseUrl } from "../utils/services";
import tawsilaLogo from "../assets/tawsilalogo.png";
import "./Register.css";

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
      if (res.ok) setResendMsg("✅ Nouveau code envoyé !");
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

  const steps = [["Infos", 1], ["Email", 2], ["Règles", 3]];

  return (
    <div className="rg-page">

      {/* Fond voiture animé */}
      <div className="rg-bg" />
      <div className="rg-overlay" />

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
            {steps.map(([label, s]) => (
              <div key={s} className="rg-step-item">
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                  <div className={`rg-step-dot ${step === s ? "active" : ""} ${step > s ? "done" : ""}`}>
                    {step > s ? (
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : s}
                  </div>
                  <span className={`rg-step-label ${step === s ? "active" : ""} ${step > s ? "done" : ""}`}>{label}</span>
                </div>
                {s < 3 && <div className={`rg-step-line ${step > s ? "done" : ""}`} />}
              </div>
            ))}
          </div>
        </div>

        {/* Progress bar */}
        <div className="rg-progress">
          <div className="rg-progress-bar" style={{ width: `${((step - 1) / 2) * 100}%` }} />
        </div>

        {/* ── STEP 1 : Formulaire ── */}
        {step === 1 && (
          <form onSubmit={handleFormSubmit} className="rg-body">
            <h2 className="rg-title">Créer un compte</h2>
            <p className="rg-subtitle">Rejoignez la communauté Tawsila</p>

            <div className="rg-avatar-wrap">
              <label htmlFor="image" className="rg-avatar-label">
                {preview ? (
                  <img src={preview} alt="preview" className="rg-avatar-img" />
                ) : (
                  <div className="rg-avatar-placeholder">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                      <circle cx="12" cy="13" r="4" />
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
              <input className="rg-input" name="email" type="email" placeholder="exemple@email.com" autoComplete="email" value={formData.email} onChange={handleChange} required />
            </div>

            <div className="rg-field">
              <label className="rg-label">Numéro de téléphone</label>
              <input className="rg-input" name="phone" type="tel" placeholder="+216 XX XXX XXX" value={formData.phone} onChange={handleChange} required />
            </div>

            <div className="rg-row">
              <div className="rg-field">
                <label className="rg-label">Mot de passe</label>
                <input className="rg-input" name="password" type="password" placeholder="••••••••" autoComplete="new-password" value={formData.password} onChange={handleChange} required />
              </div>
              <div className="rg-field">
                <label className="rg-label">Confirmer</label>
                <input className="rg-input" name="confirmPassword" type="password" placeholder="••••••••" autoComplete="new-password" value={formData.confirmPassword} onChange={handleChange} required />
              </div>
            </div>

            {otpError && <div className="rg-error">{otpError}</div>}

            <button type="submit" className="rg-btn" disabled={otpLoading}>
              {otpLoading ? <><div className="rg-spinner" /> Envoi du code…</> : "Envoyer le code de vérification →"}
            </button>

            <p className="rg-login-link">
              Déjà un compte ? <Link to="/login">Se connecter</Link>
            </p>
          </form>
        )}

        {/* ── STEP 2 : OTP ── */}
        {step === 2 && (
          <form onSubmit={handleVerification} className="rg-body" style={{ textAlign: "center" }}>
            <div className="rg-otp-icon">📧</div>
            <h2 className="rg-title" style={{ textAlign: "center" }}>Vérification email</h2>
            <p className="rg-subtitle" style={{ textAlign: "center" }}>
              Code envoyé à <strong style={{ color: '#1a56db' }}>{formData.email}</strong>
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

            {otpError  && <div className="rg-error">{otpError}</div>}
            {resendMsg && <div className="rg-success">{resendMsg}</div>}

            <button type="submit" className="rg-btn" disabled={otpLoading || verificationCode.replace(/\s/g, "").length < 4}>
              {otpLoading ? <><div className="rg-spinner" /> Vérification…</> : "Vérifier le code"}
            </button>

            <p style={{ fontSize: "0.83rem", color: "#94a3b8", marginTop: "0.9rem" }}>
              Code non reçu ?{" "}
              <button type="button" className="rg-link-btn" onClick={handleResend}>Renvoyer</button>
            </p>
            <p style={{ fontSize: "0.83rem", color: "#94a3b8", marginTop: "6px" }}>
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
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </div>
              <span className="rg-agree-text">
                J'accepte les <span>conditions d'utilisation</span> de Tawsila
              </span>
            </div>

            {registerError && <div className="rg-error">{registerError}</div>}

            <button type="submit" className="rg-btn" disabled={!agreed || isRegisterLoading}>
              {isRegisterLoading ? <><div className="rg-spinner" /> Création en cours…</> : "Créer mon compte 🚗"}
            </button>
          </form>
        )}

      </div>
    </div>
  );
};

export default Register;
