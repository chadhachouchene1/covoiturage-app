import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { baseUrl } from "../utils/services";

const ForgotPassword = () => {
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState(searchParams.get("email") || "");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

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
      if (!res.ok) return setError(data.message || "Erreur lors de l'envoi");
      setStep(2);
    } catch {
      setLoading(false);
      setError("Erreur réseau. Vérifiez votre connexion.");
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`${baseUrl}/users/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: otp.replace(/\s/g, "") }),
      });
      const data = await res.json();
      setLoading(false);
      if (!res.ok) return setError(data.message || "Code invalide");
      setStep(3);
    } catch {
      setLoading(false);
      setError("Erreur réseau. Réessayez.");
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError(null);
    if (newPassword !== confirmPassword) return setError("Les mots de passe ne correspondent pas");
    if (newPassword.length < 6) return setError("Minimum 6 caractères");
    if (!/[A-Z]/.test(newPassword)) return setError("Au moins une majuscule");
    if (!/[0-9]/.test(newPassword)) return setError("Au moins un chiffre");
    setLoading(true);
    try {
      const res = await fetch(`${baseUrl}/users/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, newPassword }),
      });
      const data = await res.json();
      setLoading(false);
      if (!res.ok) return setError(data.message || "Échec de la réinitialisation");
      setSuccess("Mot de passe modifié avec succès !");
    } catch {
      setLoading(false);
      setError("Erreur réseau. Réessayez.");
    }
  };

  const handleOtpChange = (e, index) => {
    const val = e.target.value.replace(/\D/, "");
    if (val.length > 1) return;
    const newOtp = otp.split("");
    newOtp[index] = val;
    setOtp(newOtp.join(""));
    if (val && index < 3) {
      const nextInput = e.target.parentElement.children[index + 1];
      if (nextInput) nextInput.focus();
    }
    if (!val && index > 0) {
      const prevInput = e.target.parentElement.children[index - 1];
      if (prevInput) prevInput.focus();
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

        :root {
          --navy:       #0d1f4e;
          --navy-mid:   #1a3474;
          --blue:       #2563eb;
          --blue-light: #3b82f6;
          --text:       #f1f5f9;
          --text-muted: #94a3b8;
          --radius:     14px;
        }

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .forgot-page {
          min-height: 100dvh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          background:
            radial-gradient(ellipse at 15% 25%, rgba(37,99,235,0.2) 0%, transparent 55%),
            radial-gradient(ellipse at 85% 75%, rgba(13,31,78,0.5) 0%, transparent 60%),
            linear-gradient(150deg, #0d1f4e 0%, #091533 100%);
          position: relative;
          overflow: hidden;
        }

        /* Dot grid like left panel */
        .forgot-page::before {
          content: '';
          position: fixed;
          inset: 0;
          background-image: radial-gradient(rgba(255,255,255,0.055) 1px, transparent 1px);
          background-size: 36px 36px;
          pointer-events: none;
        }

        .forgot-card {
          background: rgba(255,255,255,0.04);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(59,130,246,0.25);
          border-radius: 20px;
          width: 100%;
          max-width: 480px;
          overflow: hidden;
          box-shadow:
            0 0 0 1px rgba(37,99,235,0.1),
            0 20px 60px rgba(0,0,0,0.5);
          position: relative;
          z-index: 1;
          animation: fpFadeUp 0.5s cubic-bezier(0.16,1,0.3,1);
        }

        @keyframes fpFadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* ── Header ── */
        .header {
          background: linear-gradient(135deg, var(--navy) 0%, var(--blue) 100%);
          padding: 20px 28px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 1.1rem;
          font-weight: 800;
          color: white;
          letter-spacing: -0.3px;
        }

        /* ── Stepper ── */
        .steps {
          display: flex;
          align-items: center;
          gap: 0;
        }

        .step {
          width: 30px; height: 30px;
          border-radius: 50%;
          background: rgba(255,255,255,0.15);
          color: rgba(255,255,255,0.7);
          font-weight: 700;
          font-size: 13px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s;
          border: 1.5px solid rgba(255,255,255,0.15);
        }

        .step.active {
          background: white;
          color: var(--blue);
          border-color: white;
          box-shadow: 0 0 0 3px rgba(255,255,255,0.2);
        }

        .step.completed {
          background: #4ade80;
          color: white;
          border-color: #4ade80;
        }

        .step-line {
          width: 28px; height: 2px;
          background: rgba(255,255,255,0.2);
          border-radius: 2px;
          transition: background 0.3s;
        }

        .step-line.active { background: rgba(255,255,255,0.6); }

        /* ── Progress bar ── */
        .fp-progress {
          height: 3px;
          background: rgba(255,255,255,0.08);
        }

        .fp-progress-bar {
          height: 100%;
          background: linear-gradient(90deg, var(--navy-mid), var(--blue-light));
          transition: width 0.4s cubic-bezier(0.16,1,0.3,1);
        }

        /* ── Form content ── */
        .form-content {
          padding: 32px;
          color: var(--text);
        }

        .step-icon {
          font-size: 3.2rem;
          text-align: center;
          margin-bottom: 0.9rem;
          display: block;
        }

        .title {
          font-size: 1.7rem;
          font-weight: 800;
          text-align: center;
          margin-bottom: 0.5rem;
          color: var(--text);
          letter-spacing: -0.4px;
        }

        .subtitle {
          color: var(--text-muted);
          text-align: center;
          font-size: 0.93rem;
          line-height: 1.55;
          margin-bottom: 1.8rem;
        }

        .subtitle strong { color: #93c5fd; }

        /* ── Fields ── */
        .field { margin-bottom: 1.3rem; }

        .label {
          font-size: 0.82rem;
          font-weight: 700;
          color: #cbd5e1;
          margin-bottom: 0.45rem;
          display: block;
          letter-spacing: 0.2px;
        }

        .input-group {
          display: flex;
          align-items: center;
          background: rgba(255,255,255,0.06);
          border: 1.5px solid rgba(59,130,246,0.25);
          border-radius: var(--radius);
          transition: all 0.2s;
          overflow: hidden;
        }

        .input-group:focus-within {
          border-color: var(--blue-light);
          box-shadow: 0 0 0 3px rgba(59,130,246,0.15);
          background: rgba(255,255,255,0.09);
        }

        .input-icon {
          padding: 0 14px;
          color: var(--text-muted);
          font-size: 1rem;
          flex-shrink: 0;
        }

        .input-group input {
          flex: 1;
          padding: 13px 12px 13px 0;
          background: transparent;
          border: none;
          color: var(--text);
          font-size: 0.94rem;
          outline: none;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-weight: 500;
        }

        .input-group input::placeholder { color: #4b5563; }

        /* ── OTP ── */
        .otp-container {
          display: flex;
          gap: 12px;
          justify-content: center;
          margin: 2rem 0;
        }

        .otp-input {
          width: 60px; height: 68px;
          text-align: center;
          font-size: 1.9rem;
          font-weight: 800;
          background: rgba(255,255,255,0.05);
          border: 2px solid rgba(59,130,246,0.25);
          border-radius: 12px;
          color: white;
          outline: none;
          font-family: 'Plus Jakarta Sans', sans-serif;
          transition: all 0.2s;
          caret-color: var(--blue-light);
        }

        .otp-input:focus {
          border-color: var(--blue-light);
          box-shadow: 0 0 0 3px rgba(59,130,246,0.2);
          background: rgba(255,255,255,0.09);
        }

        /* ── Strength ── */
        .strength-bars {
          display: flex;
          gap: 6px;
          margin: 1rem 0 0.5rem;
          height: 5px;
        }

        .strength-bar {
          flex: 1;
          border-radius: 3px;
          background: rgba(255,255,255,0.1);
          transition: background 0.3s;
        }

        .strength-bar.active { background: #22c55e; }

        /* ── Error ── */
        .error-message {
          background: rgba(239,68,68,0.12);
          border: 1px solid rgba(239,68,68,0.3);
          border-left: 3px solid #ef4444;
          color: #fca5a5;
          padding: 11px 14px;
          border-radius: 10px;
          margin: 0.8rem 0;
          font-size: 0.88rem;
          line-height: 1.5;
        }

        /* ── Button ── */
        .btn-primary {
          width: 100%;
          padding: 13px;
          background: linear-gradient(135deg, var(--navy) 0%, var(--blue) 100%);
          color: white;
          border: none;
          border-radius: var(--radius);
          font-size: 0.95rem;
          font-weight: 700;
          cursor: pointer;
          margin-top: 0.8rem;
          transition: all 0.22s;
          box-shadow: 0 4px 16px rgba(37,99,235,0.35);
          font-family: 'Plus Jakarta Sans', sans-serif;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .btn-primary:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 24px rgba(37,99,235,0.45);
        }

        .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

        .fp-spinner {
          width: 16px; height: 16px;
          border-radius: 50%;
          border: 2.5px solid rgba(255,255,255,0.3);
          border-top-color: white;
          animation: fpSpin 0.75s linear infinite;
        }
        @keyframes fpSpin { to { transform: rotate(360deg); } }

        /* ── Success ── */
        .success-screen {
          text-align: center;
          padding: 32px 16px 16px;
        }

        .success-icon {
          font-size: 4.5rem;
          margin-bottom: 1.2rem;
          display: block;
        }

        .back-to-login {
          display: inline-block;
          margin-top: 1.5rem;
          padding: 13px 32px;
          background: linear-gradient(135deg, var(--navy), var(--blue));
          color: white;
          border-radius: var(--radius);
          text-decoration: none;
          font-weight: 700;
          font-size: 0.95rem;
          transition: all 0.22s;
          box-shadow: 0 4px 16px rgba(37,99,235,0.35);
        }

        .back-to-login:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 24px rgba(37,99,235,0.45);
        }

        .link {
          color: #60a5fa;
          font-weight: 700;
          cursor: pointer;
        }
        .link:hover { text-decoration: underline; }

        @media (max-width: 480px) {
          .form-content { padding: 24px; }
          .otp-input { width: 52px; height: 60px; font-size: 1.6rem; }
        }
      `}</style>

      <div className="forgot-page">
        <div className="forgot-card">

          {/* ── Header ── */}
          <div className="header">
            <div className="logo">
              <span></span>
              <span>Tawsila</span>
            </div>
            <div className="steps">
              {[1, 2, 3].map((s) => (
                <div key={s} style={{ display: "flex", alignItems: "center" }}>
                  <div className={`step ${step === s ? "active" : ""} ${step > s ? "completed" : ""}`}>
                    {step > s ? "✓" : s}
                  </div>
                  {s < 3 && <div className={`step-line ${step > s ? "active" : ""}`} />}
                </div>
              ))}
            </div>
          </div>

          {/* ── Progress bar ── */}
          <div className="fp-progress">
            <div className="fp-progress-bar" style={{ width: `${((step - 1) / 2) * 100}%` }} />
          </div>

          <div className="form-content">

            {/* STEP 1 — Email */}
            {step === 1 && (
              <form onSubmit={handleSendOtp}>
                <span className="step-icon">🔐</span>
                <h2 className="title">Mot de passe oublié ?</h2>
                <p className="subtitle">Entrez l'adresse email associée à votre compte</p>

                <div className="field">
                  <label className="label">Adresse email</label>
                  <div className="input-group">
                    <span className="input-icon">📧</span>
                    <input
                      type="email"
                      placeholder="votre@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      readOnly={!!searchParams.get("email")}
                      style={{ opacity: searchParams.get("email") ? 0.75 : 1 }}
                      required
                    />
                  </div>
                </div>

                {error && <div className="error-message">{error}</div>}

                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? <><div className="fp-spinner" /> Envoi en cours…</> : "Recevoir le code"}
                </button>

                <p style={{ textAlign: "center", marginTop: "1.4rem", fontSize: "0.88rem" }}>
                  <Link to="/login" style={{ color: "#93c5fd", fontWeight: 600, textDecoration: "none" }}>
                    ← Retour à la connexion
                  </Link>
                </p>
              </form>
            )}

            {/* STEP 2 — OTP */}
            {step === 2 && (
              <form onSubmit={handleVerifyOtp}>
                <span className="step-icon">📧</span>
                <h2 className="title">Vérifiez votre email</h2>
                <p className="subtitle">
                  Nous avons envoyé un code à 4 chiffres à<br />
                  <strong>{email}</strong>
                </p>

                <div className="otp-container">
                  {[0, 1, 2, 3].map((i) => (
                    <input
                      key={i}
                      type="text"
                      maxLength={1}
                      inputMode="numeric"
                      className="otp-input"
                      value={otp[i] || ""}
                      onChange={(e) => handleOtpChange(e, i)}
                      autoFocus={i === 0}
                    />
                  ))}
                </div>

                {error && <div className="error-message">{error}</div>}

                <button type="submit" className="btn-primary" disabled={loading || otp.replace(/\s/g, "").length < 4}>
                  {loading ? <><div className="fp-spinner" /> Vérification…</> : "Confirmer le code"}
                </button>

                <p style={{ textAlign: "center", marginTop: "1.2rem", fontSize: "0.88rem", color: "var(--text-muted)" }}>
                  Pas reçu ?{" "}
                  <span className="link" onClick={() => setStep(1)}>Renvoyer le code</span>
                </p>
              </form>
            )}

            {/* STEP 3 — Nouveau mot de passe */}
            {step === 3 && !success && (
              <form onSubmit={handleResetPassword}>
                <span className="step-icon">🔑</span>
                <h2 className="title">Nouveau mot de passe</h2>
                <p className="subtitle">Choisissez un mot de passe sécurisé</p>

                <div className="field">
                  <label className="label">Nouveau mot de passe</label>
                  <div className="input-group">
                    <span className="input-icon">🔒</span>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="field">
                  <label className="label">Confirmer le mot de passe</label>
                  <div className="input-group">
                    <span className="input-icon">🔒</span>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {newPassword && (
                  <div className="strength-bars">
                    {[
                      newPassword.length >= 6,
                      /[A-Z]/.test(newPassword),
                      /[0-9]/.test(newPassword),
                      /[^A-Za-z0-9]/.test(newPassword),
                    ].map((valid, i) => (
                      <div key={i} className={`strength-bar ${valid ? "active" : ""}`} />
                    ))}
                  </div>
                )}

                {error && <div className="error-message">{error}</div>}

                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? <><div className="fp-spinner" /> Modification…</> : "Réinitialiser le mot de passe"}
                </button>
              </form>
            )}

            {/* SUCCESS */}
            {success && (
              <div className="success-screen">
                <span className="success-icon">🎉</span>
                <h2 className="title" style={{ color: "#4ade80" }}>Succès !</h2>
                <p className="subtitle">Votre mot de passe a été réinitialisé avec succès.</p>
                <Link to="/login" className="back-to-login">Se connecter maintenant</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ForgotPassword;