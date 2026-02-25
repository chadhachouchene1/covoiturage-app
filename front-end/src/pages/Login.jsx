import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link } from "react-router-dom";
import tawsilaLogo from "../assets/tawsilalogo.png";

const Login = () => {
  const { loginUser, loginInfo, updateLoginInfo, loginError, isLoginLoading } =
    useContext(AuthContext);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

        :root {
          --color-primary:    #2563eb;
          --color-primary-dark:#1d4ed8;
          --color-bg-dark:    #0f172a;
          --color-bg-darker:  #0a0f1d;
          --color-text:       #f1f5f9;
          --color-text-muted: #94a3b8;
          --radius:           12px;
          --transition:       0.22s cubic-bezier(0.16, 1, 0.3, 1);
        }

        * { box-sizing: border-box; margin:0; padding:0; }

        .login-page {
          min-height: 100dvh;
          display: grid;
          grid-template-columns: 6fr 4fr;           /* 60% / 40% */
          font-family: 'Inter', system-ui, sans-serif;
          background: var(--color-bg-darker);
        }

        /* ── Left visual side (60%) ── */
        .left-panel {
          position: relative;
          overflow: hidden;
          color: var(--color-text);
        }

        .left-gradient {
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse at 20% 30%, rgba(59,130,246,0.32) 0%, transparent 65%),
            radial-gradient(ellipse at 80% 70%, rgba(59,130,246,0.20) 0%, transparent 70%),
            linear-gradient(155deg, #0f172a 0%, #0a0f1d 100%);
          animation: gradientDrift 22s ease infinite alternate;
        }

        @keyframes gradientDrift {
          0%   { background-position: 0% 0%, 100% 100%; }
          100% { background-position: 25% 35%, 75% 65%; }
        }

        .left-grid {
          position: absolute;
          inset: 0;
          background-image: radial-gradient(rgba(248,250,252,0.055) 1px, transparent 1px);
          background-size: 44px 44px;
          pointer-events: none;
        }

        .left-content {
          position: relative;
          z-index: 2;
          height: 100%;
          padding: 2.5rem 5rem 4rem;               /* haut réduit */
          display: flex;
          flex-direction: column;
        }

        .hero {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 2rem 0 3rem;
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background: rgba(255,255,255,0.08);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255,255,255,0.14);
          border-radius: 999px;
          padding: 9px 20px;
          font-size: 0.88rem;
          font-weight: 500;
          margin-bottom: 2rem;
        }

        .badge-dot {
          width: 10px; height: 10px;
          background: #22c55e;
          border-radius: 50%;
          box-shadow: 0 0 16px rgba(34,197,94,0.6);
          animation: pulseSlow 3.2s infinite;
        }

        @keyframes pulseSlow { 0%,100% { transform: scale(1); } 50% { transform: scale(0.78); } }

        .hero-title {
          font-size: clamp(2.6rem, 5.5vw, 4rem);
          font-weight: 700;
          line-height: 1.1;
          letter-spacing: -1.3px;
          margin-bottom: 1.4rem;
        }

        .hero-title span { color: #60a5fa; }

        .hero-text {
          font-size: 1.08rem;
          line-height: 1.65;
          color: var(--color-text-muted);
          max-width: 460px;
        }

        .stats {
          display: flex;
          gap: 3rem;
          padding-top: 3rem;
          border-top: 1px solid rgba(248,250,252,0.09);
        }

        .stat { flex: 1; }

        .stat-number {
          font-size: 2.3rem;
          font-weight: 700;
          letter-spacing: -0.7px;
        }

        .stat-label {
          font-size: 0.88rem;
          color: var(--color-text-muted);
          margin-top: 0.45rem;
          display: block;
        }

        /* ── Right — Form (40%) ── */
        .right-panel {
          background: white;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2.5rem 4rem 4rem;               /* haut réduit */
        }

        .form-container {
          width: 100%;
          max-width: 440px;
        }

        .form-logo {
          width: 150px;                             /* ← ta demande */
          margin: 0 auto 2.2rem;
          display: block;
        }

        .form-title {
          font-size: 2.1rem;
          font-weight: 700;
          color: #0f172a;
          text-align: center;
          margin-bottom: 0.6rem;
        }

        .form-subtitle {
          color: #64748b;
          font-size: 1.05rem;
          text-align: center;
          margin-bottom: 2.8rem;
        }

        .field { margin-bottom: 1.6rem; }

        .field-label-row {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          margin-bottom: 0.6rem;
        }

        .label {
          font-size: 0.95rem;
          font-weight: 600;
          color: #1e293b;
        }

        .forgot-link {
          font-size: 0.89rem;
          color: var(--color-primary);
          font-weight: 500;
          text-decoration: none;
        }
        .forgot-link:hover { text-decoration: underline; }

        .input-wrapper {
          display: flex;
          align-items: center;
          border: 1.5px solid #e2e8f0;
          border-radius: var(--radius);
          background: #fcfcfc;
          transition: var(--transition);
        }

        .input-wrapper:focus-within {
          border-color: var(--color-primary);
          box-shadow: 0 0 0 3.5px rgba(37,99,235,0.14);
          background: white;
        }

        .input-wrapper.error {
          border-color: #ef4444;
        }

        .input-icon {
          padding-left: 1.25rem;
          color: #94a3b8;
          flex-shrink: 0;
        }

        .input {
          flex: 1;
          padding: 1.1rem 1.25rem;
          border: none;
          background: transparent;
          font-size: 1.02rem;
          color: #0f172a;
          outline: none;
        }

        .input::placeholder { color: #cbd5e1; }

        .eye-btn {
          padding: 0 1.25rem;
          background: none;
          border: none;
          color: #94a3b8;
          cursor: pointer;
        }
        .eye-btn:hover { color: #475569; }

        .remember-row {
          display: flex;
          align-items: center;
          gap: 0.8rem;
          margin: 1.4rem 0 2.2rem;
          user-select: none;
        }

        .remember-row input[type="checkbox"] {
          width: 1.25rem;
          height: 1.25rem;
          accent-color: #0f172a;
          border-radius: 5px;
        }

        .remember-text {
          font-size: 0.96rem;
          color: #475569;
        }

        .error-box {
          display: flex;
          gap: 1rem;
          align-items: start;
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #b91c1c;
          padding: 1.15rem 1.35rem;
          border-radius: var(--radius);
          font-size: 0.96rem;
          margin: 1.4rem 0;
        }

        .btn-primary {
          width: 100%;
          padding: 1.25rem;
          background: var(--color-primary);
          color: white;
          border: none;
          border-radius: var(--radius);
          font-weight: 600;
          font-size: 1.08rem;
          cursor: pointer;
          transition: var(--transition);
          box-shadow: 0 4px 16px rgba(37,99,235,0.2);
        }

        .btn-primary:hover:not(:disabled) {
          background: var(--color-primary-dark);
          transform: translateY(-2px);
          box-shadow: 0 10px 28px rgba(37,99,235,0.32);
        }

        .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

        .spinner {
          width: 22px;
          height: 22px;
          border: 4px solid rgba(255,255,255,0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.9s linear infinite;
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        .signup-link {
          text-align: center;
          margin-top: 2.4rem;
          color: #64748b;
          font-size: 1.02rem;
        }

        .signup-link a {
          color: #0f172a;
          font-weight: 600;
          text-decoration: underline;
          text-underline-offset: 3px;
        }

        /* ── Responsive ── */
        @media (max-width: 1100px) {
          .login-page { grid-template-columns: 58% 42%; }
          .left-content  { padding: 2rem 4rem 3.5rem; }
          .right-panel   { padding: 2rem 3rem 3.5rem; }
        }

        @media (max-width: 950px) {
          .login-page { grid-template-columns: 1fr; }
          .left-panel { display: none; }
          .right-panel {
            padding: 3rem 2.5rem 4rem;
            min-height: 100dvh;
          }
          .form-container { max-width: 460px; }
          .form-logo { width: 130px; }
        }

        @media (max-width: 520px) {
          .right-panel { padding: 2.5rem 1.5rem 4rem; }
          .form-logo { width: 110px; }
          .form-title { font-size: 1.9rem; }
          .form-subtitle { font-size: 1rem; }
        }
      `}</style>

      <div className="login-page">

        {/* Left — Visual only (60%) */}
        <div className="left-panel">
          <div className="left-gradient" />
          <div className="left-grid" />
          <div className="left-content">

            <div className="hero">
              <div className="hero-badge">
                <div className="badge-dot" />
                +1 900 membres actifs
              </div>

              <h1 className="hero-title">
                Le covoiturage<br />
                <span>plus simple</span><br />
                en Tunisie
              </h1>

              <p className="hero-text">
                Économisez, voyagez en confiance et réduisez votre empreinte carbone — tous les jours.
              </p>
            </div>

            <div className="stats">
              {[
                ["2 600+", "Trajets/mois"],
                ["1 900+", "Membres"],
                ["jusqu'à 65%", "d'économies"],
              ].map(([num, label]) => (
                <div className="stat" key={label}>
                  <strong className="stat-number">{num}</strong>
                  <span className="stat-label">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right — Form (40%) */}
        <div className="right-panel">
          <div className="form-container">

            <img src={tawsilaLogo} alt="Tawsila" className="form-logo" />
            <h2 className="form-title">Ravi de te revoir ! 👋</h2>
            <p className="form-subtitle">Connecte-toi pour continuer</p>

            <form onSubmit={loginUser} noValidate>
              {/* Email */}
              <div className="field">
                <label className="label">Email</label>
                <div className={`input-wrapper ${focusedField === "email" ? "focused" : ""} ${loginError?.toLowerCase().includes("email") ? "error" : ""}`}>
                  <span className="input-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="2" y="4" width="20" height="16" rx="2" />
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                    </svg>
                  </span>
                  <input
                    className="input"
                    type="email"
                    placeholder="toi@exemple.tn"
                    value={loginInfo.email}
                    onChange={(e) => updateLoginInfo({ ...loginInfo, email: e.target.value })}
                    onFocus={() => setFocusedField("email")}
                    onBlur={() => setFocusedField(null)}
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="field">
                <div className="field-label-row">
                  <label className="label">Mot de passe</label>
                  <Link
                    to={`/forgot-password?email=${encodeURIComponent(loginInfo.email || "")}`}
                    className="forgot-link"
                  >
                    Mot de passe oublié ?
                  </Link>
                </div>

                <div className={`input-wrapper ${focusedField === "password" ? "focused" : ""} ${loginError?.toLowerCase().includes("mot de passe") || loginError?.toLowerCase().includes("password") ? "error" : ""}`}>
                  <span className="input-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    </svg>
                  </span>
                  <input
                    className="input"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={loginInfo.password}
                    onChange={(e) => updateLoginInfo({ ...loginInfo, password: e.target.value })}
                    onFocus={() => setFocusedField("password")}
                    onBlur={() => setFocusedField(null)}
                    required
                  />
                  <button
                    type="button"
                    className="eye-btn"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M8.5 4.8A9 9 0 0 1 12 4c7 0 10 7 10 7a18.4 18.4 0 0 1-3.1 4.4m-5.7-.8a3 3 0 1 1-4.24-4.24" />
                        <path d="m2 2 20 20" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <label className="remember-row">
                <input type="checkbox" id="remember" />
                <span className="remember-text">Rester connecté</span>
              </label>

              {loginError && (
                <div className="error-box">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  {loginError}
                </div>
              )}

              <button type="submit" className="btn-primary" disabled={isLoginLoading}>
                {isLoginLoading ? (
                  <>
                    <div className="spinner" />
                    Connexion…
                  </>
                ) : (
                  "Se connecter"
                )}
              </button>
            </form>

            <p className="signup-link">
              Pas encore inscrit ? <Link to="/register">Créer un compte gratuit</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;