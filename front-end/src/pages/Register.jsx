import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { baseUrl } from "../utils/services";

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
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    birthPlace: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    image: null,
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

  // ÉTAPE 1 → envoyer OTP réel par email
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setOtpError(null);

    // ✅ Validation mot de passe AVANT d'envoyer l'OTP
    if (formData.password !== formData.confirmPassword) {
      return setOtpError("Les mots de passe ne correspondent pas");
    }
    if (formData.password.length < 6) {
      return setOtpError("Le mot de passe doit contenir au moins 6 caractères");
    }
    if (!/[A-Z]/.test(formData.password)) {
      return setOtpError("Le mot de passe doit contenir au moins une majuscule");
    }
    if (!/[0-9]/.test(formData.password)) {
      return setOtpError("Le mot de passe doit contenir au moins un chiffre");
    }

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

  // ÉTAPE 2 → vérifier le code OTP
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

  // Renvoyer l'OTP
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
      if (res.ok) setResendMsg("Nouveau code envoyé ✅");
      else setOtpError(data.message);
    } catch {
      setOtpError("Erreur réseau.");
    }
  };

  // ÉTAPE 3 → créer le compte
  const handleFinalRegister = (e) => {
    e.preventDefault();
    if (!agreed) return;
    registerUser(e, formData);
  };

  // Helper : remplir les 4 cases OTP
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
    <div style={styles.page}>
      <div style={styles.card}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.logo}>
            <span style={styles.logoIcon}>🚗</span>
            <span style={styles.logoText}>CoVoiturage</span>
          </div>
          <div style={styles.steps}>
            {[1, 2, 3].map((s) => (
              <div key={s} style={{ display: "flex", alignItems: "center" }}>
                <div style={{ ...styles.stepDot, ...(step >= s ? styles.stepActive : {}) }}>
                  {step > s ? "✓" : s}
                </div>
                {s < 3 && <div style={{ ...styles.stepLine, ...(step > s ? styles.stepLineActive : {}) }} />}
              </div>
            ))}
          </div>
        </div>

        {/* ── STEP 1 : Formulaire ── */}
        {step === 1 && (
          <form onSubmit={handleFormSubmit} style={styles.form}>
            <h2 style={styles.title}>Créer un compte</h2>
            <p style={styles.subtitle}>Rejoignez la communauté de covoiturage</p>

            {/* Avatar */}
            <div style={styles.avatarWrapper}>
              <label htmlFor="image" style={styles.avatarLabel}>
                {preview ? (
                  <img src={preview} alt="preview" style={styles.avatarImg} />
                ) : (
                  <div style={styles.avatarPlaceholder}>
                    <span style={{ fontSize: 28 }}>📷</span>
                    <span style={{ fontSize: 12, marginTop: 4, color: "#a78bfa" }}>Photo de profil</span>
                  </div>
                )}
              </label>
              <input id="image" name="image" type="file" accept="image/*" onChange={handleChange} style={{ display: "none" }} />
            </div>

            <div style={styles.row}>
              <div style={styles.field}>
                <label style={styles.label}>Prénom</label>
                <input style={styles.input} name="firstName" type="text" placeholder="Votre prénom" value={formData.firstName} onChange={handleChange} required />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Nom</label>
                <input style={styles.input} name="lastName" type="text" placeholder="Votre nom" value={formData.lastName} onChange={handleChange} required />
              </div>
            </div>

            <div style={styles.row}>
              <div style={styles.field}>
                <label style={styles.label}>Date de naissance</label>
                <input style={styles.input} name="dateOfBirth" type="date" value={formData.dateOfBirth} onChange={handleChange} required />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Lieu de naissance</label>
                <input style={styles.input} name="birthPlace" type="text" placeholder="Votre ville" value={formData.birthPlace} onChange={handleChange} required />
              </div>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Adresse email</label>
              <input style={styles.input} name="email" type="email" placeholder="exemple@email.com" value={formData.email} onChange={handleChange} required />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Numéro de téléphone</label>
              <input style={styles.input} name="phone" type="tel" placeholder="+213 6XX XXX XXX" value={formData.phone} onChange={handleChange} required />
            </div>

            <div style={styles.row}>
              <div style={styles.field}>
                <label style={styles.label}>Mot de passe</label>
                <input style={styles.input} name="password" type="password" placeholder="••••••••" value={formData.password} onChange={handleChange} required />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Confirmer</label>
                <input style={styles.input} name="confirmPassword" type="password" placeholder="••••••••" value={formData.confirmPassword} onChange={handleChange} required />
              </div>
            </div>

            {otpError && <div style={styles.error}>⚠️ {otpError}</div>}

            <button type="submit" style={styles.btn} disabled={otpLoading}>
              {otpLoading ? "Envoi du code..." : "Envoyer le code de vérification →"}
            </button>

            <p style={styles.loginLink}>
              Déjà un compte ?{" "}
              <Link to="/login" style={{ color: "#a78bfa", fontWeight: 600 }}>Se connecter</Link>
            </p>
          </form>
        )}

        {/* ── STEP 2 : Vérification OTP ── */}
        {step === 2 && (
          <form onSubmit={handleVerification} style={styles.form}>
            <div style={styles.verifIcon}>✉️</div>
            <h2 style={styles.title}>Vérification email</h2>
            <p style={styles.subtitle}>
              Un code à 4 chiffres a été envoyé à <strong style={{ color: "#a78bfa" }}>{formData.email}</strong>
            </p>

            <div style={styles.codeInputWrapper}>
              {[0, 1, 2, 3].map((i) => (
                <input
                  key={i}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  style={styles.codeBox}
                  value={verificationCode[i] || ""}
                  onChange={(e) => handleOtpInput(e, i)}
                />
              ))}
            </div>

            {otpError && <div style={styles.error}>⚠️ {otpError}</div>}
            {resendMsg && <div style={styles.success}>✅ {resendMsg}</div>}

            <button type="submit" style={styles.btn} disabled={otpLoading || verificationCode.replace(/\s/g,"").length < 4}>
              {otpLoading ? "Vérification..." : "Vérifier le code"}
            </button>

            <p style={{ textAlign: "center", fontSize: 13, color: "#9ca3af", marginTop: 12 }}>
              Code non reçu ?{" "}
              <span style={{ color: "#a78bfa", cursor: "pointer", fontWeight: 600 }} onClick={handleResend}>
                Renvoyer
              </span>
            </p>
            <p style={{ textAlign: "center", fontSize: 13, color: "#6b7280", marginTop: 6 }}>
              <span style={{ cursor: "pointer" }} onClick={() => setStep(1)}>← Modifier l'email</span>
            </p>
          </form>
        )}

        {/* ── STEP 3 : Règles ── */}
        {step === 3 && (
          <form onSubmit={handleFinalRegister} style={styles.form}>
            <h2 style={styles.title}>Conditions d'utilisation</h2>
            <p style={styles.subtitle}>Lisez et acceptez nos règles pour accéder à la plateforme</p>

            <div style={styles.rulesBox}>
              {[
                ["🤝", "Respect mutuel", "Traitez chaque membre avec respect et bienveillance."],
                ["⏰", "Ponctualité", "Respectez les horaires convenus avec les autres membres."],
                ["🔒", "Confidentialité", "Ne partagez pas les informations personnelles des autres."],
                ["💳", "Paiement honnête", "Payez le montant convenu sans contestation injustifiée."],
                ["🚫", "Zéro tolérance", "Aucune discrimination, harcèlement ou comportement inapproprié."],
                ["🔞", "Âge minimum", "Vous devez avoir au moins 18 ans pour utiliser cette plateforme."],
              ].map(([icon, title, text]) => (
                <div key={title} style={styles.rule}>
                  <span style={styles.ruleIcon}>{icon}</span>
                  <div>
                    <strong style={{ color: "#e9d5ff", fontSize: 14 }}>{title}</strong>
                    <p style={styles.ruleText}>{text}</p>
                  </div>
                </div>
              ))}
            </div>

            <label style={styles.agreeRow}>
              <div style={{ ...styles.checkbox, ...(agreed ? styles.checkboxActive : {}) }} onClick={() => setAgreed(!agreed)}>
                {agreed && <span style={{ color: "#fff", fontSize: 12 }}>✓</span>}
              </div>
              <span style={{ fontSize: 14, color: "#d1d5db" }}>
                J'accepte les <span style={{ color: "#a78bfa", fontWeight: 600 }}>conditions d'utilisation</span>
              </span>
            </label>

            {registerError && <div style={styles.error}>⚠️ {registerError}</div>}

            <button type="submit" style={{ ...styles.btn, opacity: agreed ? 1 : 0.5 }} disabled={!agreed || isRegisterLoading}>
              {isRegisterLoading ? "Création en cours..." : "Créer mon compte 🚗"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0f0a1e 0%, #1a0f3a 50%, #0d1b2a 100%)",
    display: "flex", alignItems: "center", justifyContent: "center",
    padding: "20px", fontFamily: "'Segoe UI', sans-serif",
  },
  card: {
    background: "rgba(255,255,255,0.04)", backdropFilter: "blur(20px)",
    border: "1px solid rgba(167,139,250,0.2)", borderRadius: 24, width: "100%", maxWidth: 560,
    overflow: "hidden", boxShadow: "0 25px 60px rgba(0,0,0,0.5)",
  },
  header: {
    background: "linear-gradient(135deg, #7c3aed, #4f46e5)", padding: "20px 28px",
    display: "flex", justifyContent: "space-between", alignItems: "center",
  },
  logo: { display: "flex", alignItems: "center", gap: 10 },
  logoIcon: { fontSize: 22 },
  logoText: { color: "#fff", fontWeight: 700, fontSize: 18 },
  steps: { display: "flex", alignItems: "center" },
  stepDot: {
    width: 28, height: 28, borderRadius: "50%", background: "rgba(255,255,255,0.2)",
    color: "#fff", fontSize: 12, fontWeight: 700,
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  stepActive: { background: "#fff", color: "#7c3aed" },
  stepLine: { width: 24, height: 2, background: "rgba(255,255,255,0.2)" },
  stepLineActive: { background: "#fff" },
  form: { padding: "28px 32px" },
  title: { color: "#f3f4f6", fontSize: 22, fontWeight: 700, margin: "0 0 4px" },
  subtitle: { color: "#9ca3af", fontSize: 14, margin: "0 0 24px" },
  avatarWrapper: { display: "flex", justifyContent: "center", marginBottom: 24 },
  avatarLabel: {
    cursor: "pointer", width: 80, height: 80, borderRadius: "50%",
    border: "2px dashed rgba(167,139,250,0.5)",
    display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden",
  },
  avatarImg: { width: "100%", height: "100%", objectFit: "cover" },
  avatarPlaceholder: { display: "flex", flexDirection: "column", alignItems: "center" },
  row: { display: "flex", gap: 16 },
  field: { flex: 1, marginBottom: 16, display: "flex", flexDirection: "column", gap: 6 },
  label: { color: "#c4b5fd", fontSize: 13, fontWeight: 600 },
  input: {
    background: "rgba(255,255,255,0.05)", border: "1px solid rgba(167,139,250,0.25)",
    borderRadius: 10, padding: "10px 14px", color: "#f3f4f6", fontSize: 14,
    outline: "none", width: "100%", boxSizing: "border-box",
  },
  btn: {
    width: "100%", padding: "13px", borderRadius: 12,
    background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
    color: "#fff", border: "none", fontWeight: 700, fontSize: 15,
    cursor: "pointer", marginTop: 8, boxShadow: "0 4px 20px rgba(124,58,237,0.4)",
  },
  error: {
    background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
    color: "#fca5a5", borderRadius: 8, padding: "10px 14px", fontSize: 13, marginBottom: 12,
  },
  success: {
    background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)",
    color: "#86efac", borderRadius: 8, padding: "10px 14px", fontSize: 13, marginBottom: 12,
  },
  loginLink: { textAlign: "center", color: "#6b7280", fontSize: 14, marginTop: 16 },
  verifIcon: { textAlign: "center", fontSize: 48, marginBottom: 8 },
  codeInputWrapper: { display: "flex", gap: 12, justifyContent: "center", margin: "24px 0" },
  codeBox: {
    width: 56, height: 64, textAlign: "center", fontSize: 28, fontWeight: 700,
    background: "rgba(255,255,255,0.05)", border: "2px solid rgba(167,139,250,0.3)",
    borderRadius: 12, color: "#f3f4f6", outline: "none",
  },
  rulesBox: {
    background: "rgba(255,255,255,0.03)", border: "1px solid rgba(167,139,250,0.15)",
    borderRadius: 14, padding: 16, marginBottom: 20, maxHeight: 280, overflowY: "auto",
    display: "flex", flexDirection: "column", gap: 14,
  },
  rule: { display: "flex", gap: 14, alignItems: "flex-start" },
  ruleIcon: { fontSize: 20, flexShrink: 0 },
  ruleText: { color: "#9ca3af", fontSize: 13, margin: "2px 0 0", lineHeight: 1.4 },
  agreeRow: { display: "flex", alignItems: "flex-start", gap: 12, cursor: "pointer", marginBottom: 20 },
  checkbox: {
    width: 20, height: 20, borderRadius: 6, border: "2px solid rgba(167,139,250,0.4)",
    flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
  },
  checkboxActive: { background: "#7c3aed", border: "2px solid #7c3aed" },
};

export default Register;
