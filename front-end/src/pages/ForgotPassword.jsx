import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";  // ✅
import { baseUrl } from "../utils/services";

const ForgotPassword = () => {
  const [searchParams] = useSearchParams();  // ✅ ici une seule fois
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState(searchParams.get("email") || "");  // ✅
  // ... reste du code
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // ÉTAPE 1 — Envoyer OTP reset
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`${baseUrl}/users/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      setLoading(false);
      if (!res.ok) return setError(data.message);
      setStep(2);
    } catch {
      setLoading(false);
      setError("Erreur réseau. Réessayez.");
    }
  };

  // ÉTAPE 2 — Vérifier OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`${baseUrl}/users/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: otp }),
      });
      const data = await res.json();
      setLoading(false);
      if (!res.ok) return setError(data.message);
      setStep(3);
    } catch {
      setLoading(false);
      setError("Erreur réseau. Réessayez.");
    }
  };

  // ÉTAPE 3 — Réinitialiser le mot de passe
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) return setError("Les mots de passe ne correspondent pas");
    if (newPassword.length < 6) return setError("Minimum 6 caractères");
    if (!/[A-Z]/.test(newPassword)) return setError("Au moins une majuscule requise");
    if (!/[0-9]/.test(newPassword)) return setError("Au moins un chiffre requis");

    setLoading(true);
    try {
      const res = await fetch(`${baseUrl}/users/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, newPassword }),
      });
      const data = await res.json();
      setLoading(false);
      if (!res.ok) return setError(data.message);
      setSuccess("Mot de passe modifié avec succès !");
    } catch {
      setLoading(false);
      setError("Erreur réseau. Réessayez.");
    }
  };

  const handleOtpInput = (e, index) => {
    const val = e.target.value.replace(/\D/, "");
    const arr = otp.padEnd(4, " ").split("");
    arr[index] = val || " ";
    const newCode = arr.join("").trimEnd();
    setOtp(newCode);
    if (val && e.target.nextSibling) e.target.nextSibling.focus();
    if (!val && e.target.previousSibling) e.target.previousSibling.focus();
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.logo}>
            <span>🚗</span>
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

        <div style={styles.form}>
          {/* ── STEP 1 : Email ── */}
          {step === 1 && (
            <form onSubmit={handleSendOtp}>
              <div style={styles.iconWrapper}>🔐</div>
              <h2 style={styles.title}>Mot de passe oublié ?</h2>
              <p style={styles.subtitle}>Entrez votre email — nous vous enverrons un code de réinitialisation</p>

              <div style={styles.field}>
                <label style={styles.label}>Adresse email</label>
                <div style={styles.inputWrapper}>
                  <span style={styles.inputIcon}>📧</span>
                  <input
                    style={{ ...styles.input, opacity: searchParams.get('email') ? 0.7 : 1 }}
                    type="email"
                    placeholder="exemple@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    readOnly={!!searchParams.get('email')}
                    required
                  />
                </div>
              </div>

              {error && <div style={styles.error}>⚠️ {error}</div>}

              <button type="submit" style={styles.btn} disabled={loading}>
                {loading ? "Envoi en cours..." : "Envoyer le code →"}
              </button>

              <p style={styles.backLink}>
                <Link to="/login" style={{ color: "#a78bfa", fontWeight: 600, textDecoration: "none" }}>
                  ← Retour à la connexion
                </Link>
              </p>
            </form>
          )}

          {/* ── STEP 2 : OTP ── */}
          {step === 2 && (
            <form onSubmit={handleVerifyOtp}>
              <div style={styles.iconWrapper}>✉️</div>
              <h2 style={styles.title}>Vérification email</h2>
              <p style={styles.subtitle}>
                Un code à 4 chiffres a été envoyé à <strong style={{ color: "#a78bfa" }}>{email}</strong>
              </p>

              <div style={styles.codeInputWrapper}>
                {[0, 1, 2, 3].map((i) => (
                  <input
                    key={i}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    style={styles.codeBox}
                    value={otp[i] || ""}
                    onChange={(e) => handleOtpInput(e, i)}
                  />
                ))}
              </div>

              {error && <div style={styles.error}>⚠️ {error}</div>}

              <button type="submit" style={styles.btn} disabled={loading || otp.replace(/\s/g, "").length < 4}>
                {loading ? "Vérification..." : "Vérifier le code"}
              </button>

              <p style={{ textAlign: "center", fontSize: 13, color: "#9ca3af", marginTop: 12 }}>
                Code non reçu ?{" "}
                <span
                  style={{ color: "#a78bfa", cursor: "pointer", fontWeight: 600 }}
                  onClick={() => { setStep(1); setOtp(""); setError(null); }}
                >
                  Renvoyer
                </span>
              </p>
            </form>
          )}

          {/* ── STEP 3 : Nouveau mot de passe ── */}
          {step === 3 && !success && (
            <form onSubmit={handleResetPassword}>
              <div style={styles.iconWrapper}>🔑</div>
              <h2 style={styles.title}>Nouveau mot de passe</h2>
              <p style={styles.subtitle}>Choisissez un mot de passe fort pour sécuriser votre compte</p>

              <div style={styles.field}>
                <label style={styles.label}>Nouveau mot de passe</label>
                <div style={styles.inputWrapper}>
                  <span style={styles.inputIcon}>🔒</span>
                  <input
                    style={styles.input}
                    type="password"
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Confirmer le mot de passe</label>
                <div style={styles.inputWrapper}>
                  <span style={styles.inputIcon}>🔒</span>
                  <input
                    style={styles.input}
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Indicateur force mot de passe */}
              {newPassword.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: "flex", gap: 6, marginBottom: 6 }}>
                    {[
                      newPassword.length >= 6,
                      /[A-Z]/.test(newPassword),
                      /[0-9]/.test(newPassword),
                      /[^A-Za-z0-9]/.test(newPassword),
                    ].map((ok, i) => (
                      <div key={i} style={{ flex: 1, height: 4, borderRadius: 4, background: ok ? "#7c3aed" : "rgba(255,255,255,0.1)" }} />
                    ))}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                    {[
                      [newPassword.length >= 6, "6 caractères minimum"],
                      [/[A-Z]/.test(newPassword), "Une majuscule"],
                      [/[0-9]/.test(newPassword), "Un chiffre"],
                    ].map(([ok, label]) => (
                      <span key={label} style={{ fontSize: 12, color: ok ? "#86efac" : "#9ca3af" }}>
                        {ok ? "✓" : "○"} {label}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {error && <div style={styles.error}>⚠️ {error}</div>}

              <button type="submit" style={styles.btn} disabled={loading}>
                {loading ? "Modification en cours..." : "Réinitialiser le mot de passe 🔑"}
              </button>
            </form>
          )}

          {/* ── Succès ── */}
          {success && (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
              <h2 style={{ ...styles.title, color: "#86efac" }}>Mot de passe modifié !</h2>
              <p style={styles.subtitle}>Votre mot de passe a été réinitialisé avec succès.</p>
              <Link to="/login" style={{ ...styles.btn, display: "inline-block", marginTop: 16, textDecoration: "none", textAlign: "center" }}>
                Se connecter maintenant →
              </Link>
            </div>
          )}
        </div>
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
    border: "1px solid rgba(167,139,250,0.2)", borderRadius: 24,
    width: "100%", maxWidth: 460, overflow: "hidden",
    boxShadow: "0 25px 60px rgba(0,0,0,0.5)",
  },
  header: {
    background: "linear-gradient(135deg, #7c3aed, #4f46e5)", padding: "20px 28px",
    display: "flex", justifyContent: "space-between", alignItems: "center",
  },
  logo: { display: "flex", alignItems: "center", gap: 10, fontSize: 22 },
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
  form: { padding: "32px" },
  iconWrapper: { textAlign: "center", fontSize: 52, marginBottom: 12 },
  title: { color: "#f3f4f6", fontSize: 22, fontWeight: 700, margin: "0 0 6px", textAlign: "center" },
  subtitle: { color: "#9ca3af", fontSize: 14, margin: "0 0 24px", textAlign: "center", lineHeight: 1.5 },
  field: { marginBottom: 16 },
  label: { display: "block", color: "#c4b5fd", fontSize: 13, fontWeight: 600, marginBottom: 8 },
  inputWrapper: {
    display: "flex", alignItems: "center",
    background: "rgba(255,255,255,0.05)", border: "1px solid rgba(167,139,250,0.25)",
    borderRadius: 12, overflow: "hidden",
  },
  inputIcon: { padding: "0 12px", fontSize: 16 },
  input: {
    flex: 1, padding: "12px 0", background: "transparent",
    border: "none", color: "#f3f4f6", fontSize: 14, outline: "none",
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
  backLink: { textAlign: "center", marginTop: 16, fontSize: 14 },
  codeInputWrapper: { display: "flex", gap: 12, justifyContent: "center", margin: "24px 0" },
  codeBox: {
    width: 56, height: 64, textAlign: "center", fontSize: 28, fontWeight: 700,
    background: "rgba(255,255,255,0.05)", border: "2px solid rgba(167,139,250,0.3)",
    borderRadius: 12, color: "#f3f4f6", outline: "none",
  },
};

export default ForgotPassword;
