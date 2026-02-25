import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link } from "react-router-dom";
import tawsilaLogo from "../assets/tawsilalogo.png";
import "./Login.css";

const Login = () => {
  const { loginUser, loginInfo, updateLoginInfo, loginError, isLoginLoading } =
    useContext(AuthContext);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="login-page">

      {/* ── Fond voiture animé ── */}
      <div className="login-bg" />
      <div className="login-overlay" />

      {/* ── Card formulaire au premier plan ── */}
      <div className="login-card">

        {/* Badge statut */}
        <div className="login-tagline">
          <span className="login-tagline-badge">
            <span className="badge-dot" />
            +1 900 membres actifs en Tunisie
          </span>
        </div>

        <img src={tawsilaLogo} alt="Tawsila" className="form-logo" />
        <h2 className="form-title">Ravi de te revoir ! 👋</h2>
        <p className="form-subtitle">Connecte-toi pour continuer ton trajet</p>

        <form onSubmit={loginUser} noValidate>

          {/* Email */}
          <div className="field">
            <div className="field-label-row">
              <label className="label">Email</label>
            </div>
            <div className={`input-wrapper ${loginError?.toLowerCase().includes("email") ? "error" : ""}`}>
              <span className="input-icon">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
              </span>
              <input
                className="input"
                type="email"
                placeholder="toi@exemple.tn"
                autoComplete="email"
                value={loginInfo.email}
                onChange={(e) => updateLoginInfo({ ...loginInfo, email: e.target.value })}
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
            <div className={`input-wrapper ${loginError?.toLowerCase().includes("mot de passe") || loginError?.toLowerCase().includes("password") ? "error" : ""}`}>
              <span className="input-icon">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                </svg>
              </span>
              <input
                className="input"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                autoComplete="current-password"
                value={loginInfo.password}
                onChange={(e) => updateLoginInfo({ ...loginInfo, password: e.target.value })}
                required
              />
              <button
                type="button"
                className="eye-btn"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                ) : (
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M8.5 4.8A9 9 0 0 1 12 4c7 0 10 7 10 7a18.4 18.4 0 0 1-3.1 4.4m-5.7-.8a3 3 0 1 1-4.24-4.24" />
                    <path d="m2 2 20 20" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Remember me */}
          <label className="remember-row">
            <input type="checkbox" id="remember" />
            <span className="remember-text">Rester connecté</span>
          </label>

          {/* Error */}
          {loginError && (
            <div className="error-box">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {loginError}
            </div>
          )}

          {/* Submit */}
          <button type="submit" className="btn-primary" disabled={isLoginLoading}>
            {isLoginLoading ? (
              <><div className="spinner" /> Connexion…</>
            ) : (
              "Se connecter →"
            )}
          </button>
        </form>

        <p className="signup-link">
          Pas encore inscrit ? <Link to="/register">Créer un compte gratuit</Link>
        </p>

      </div>
    </div>
  );
};

export default Login;
