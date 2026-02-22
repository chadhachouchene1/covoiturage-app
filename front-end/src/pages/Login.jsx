import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link } from "react-router-dom";

const Login = () => {
  const { loginUser, loginInfo, updateLoginInfo, loginError, isLoginLoading } = useContext(AuthContext);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div style={styles.page}>
      {/* Background decoration */}
      <div style={styles.bgOrb1} />
      <div style={styles.bgOrb2} />

      <div style={styles.card}>
        {/* Left panel */}
        <div style={styles.leftPanel}>
          <div style={styles.leftContent}>
            <div style={styles.logoRow}>
              <span style={{ fontSize: 32 }}>🚗</span>
            </div>
            <h1 style={styles.brandName}>Tawsila</h1>
            <p style={styles.brandTagline}>Partagez la route,<br />partagez les coûts.</p>

            <div style={styles.stats}>
              {[["2 400+", "Trajets/mois"], ["1 800+", "Membres actifs"], ["60%", "Économies"]].map(([n, l]) => (
                <div key={l} style={styles.statItem}>
                  <span style={styles.statNum}>{n}</span>
                  <span style={styles.statLabel}>{l}</span>
                </div>
              ))}
            </div>

            <div style={styles.testimonial}>
              <p style={styles.testimonialText}>"J'économise 4 000 DA par mois grâce à CoVoiturage !"</p>
              <div style={styles.testimonialAuthor}>
                <div style={styles.testimonialAvatar}>A</div>
                <div>
                  <div style={{ color: "#e9d5ff", fontSize: 13, fontWeight: 600 }}>Amira B.</div>
                  <div style={{ color: "#a78bfa", fontSize: 12 }}>Étudiante, Alger</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right panel - Login form */}
        <div style={styles.rightPanel}>
          <div style={styles.formHeader}>
            <h2 style={styles.title}>Bon retour 👋</h2>
            <p style={styles.subtitle}>Connectez-vous à votre compte</p>
          </div>

          <form onSubmit={loginUser} style={styles.form}>
            <div style={styles.field}>
              <label style={styles.label}>Adresse email</label>
              <div style={styles.inputWrapper}>
                <span style={styles.inputIcon}>📧</span>
                <input
                  style={styles.input}
                  type="email"
                  placeholder="exemple@email.com"
                  value={loginInfo.email}
                  onChange={(e) => updateLoginInfo({ ...loginInfo, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div style={styles.field}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <label style={styles.label}>Mot de passe</label>
                <Link to={'/forgot-password?email=' + encodeURIComponent(loginInfo.email)} style={{ ...styles.forgotLink, textDecoration: 'none' }}>Mot de passe oublié ?</Link>
              </div>
              <div style={styles.inputWrapper}>
                <span style={styles.inputIcon}>🔒</span>
                <input
                  style={styles.input}
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={loginInfo.password}
                  onChange={(e) => updateLoginInfo({ ...loginInfo, password: e.target.value })}
                  required
                />
                <span style={styles.eyeIcon} onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? "🙈" : "👁️"}
                </span>
              </div>
            </div>

            <label style={styles.rememberRow}>
              <input type="checkbox" style={{ accentColor: "#7c3aed" }} />
              <span style={{ color: "#9ca3af", fontSize: 14 }}>Se souvenir de moi</span>
            </label>

            {loginError && (
              <div style={styles.error}>
                <span>⚠️</span> {loginError}
              </div>
            )}

            <button type="submit" style={styles.btn} disabled={isLoginLoading}>
              {isLoginLoading ? (
                <span style={styles.loadingRow}>
                  <span style={styles.spinner} /> Connexion...
                </span>
              ) : (
                "Se connecter →"
              )}
            </button>

            

            

            <p style={styles.registerLink}>
              Pas encore de compte ?{" "}
              <Link to="/register" style={{ color: "#a78bfa", fontWeight: 700, textDecoration: "none" }}>
                S'inscrire gratuitement
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0f0a1e 0%, #1a0f3a 50%, #0d1b2a 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    fontFamily: "'Segoe UI', sans-serif",
    position: "relative",
    overflow: "hidden",
  },
  bgOrb1: {
    position: "fixed", top: "-100px", left: "-100px",
    width: 400, height: 400, borderRadius: "50%",
    background: "radial-gradient(circle, rgba(124,58,237,0.15), transparent 70%)",
    pointerEvents: "none",
  },
  bgOrb2: {
    position: "fixed", bottom: "-100px", right: "-100px",
    width: 350, height: 350, borderRadius: "50%",
    background: "radial-gradient(circle, rgba(79,70,229,0.12), transparent 70%)",
    pointerEvents: "none",
  },
  card: {
    display: "flex",
    width: "100%",
    maxWidth: 860,
    minHeight: 540,
    borderRadius: 24,
    overflow: "hidden",
    boxShadow: "0 30px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(167,139,250,0.15)",
    position: "relative",
    zIndex: 1,
  },
  leftPanel: {
    flex: "0 0 320px",
    background: "linear-gradient(160deg, #7c3aed 0%, #4f46e5 60%, #1e1b4b 100%)",
    padding: "40px 32px",
    display: "flex",
    alignItems: "center",
  },
  leftContent: { width: "100%" },
  logoRow: { marginBottom: 4 },
  brandName: { color: "#fff", fontSize: 28, fontWeight: 800, margin: "0 0 8px", letterSpacing: "-1px" },
  brandTagline: { color: "rgba(255,255,255,0.75)", fontSize: 16, lineHeight: 1.5, margin: "0 0 32px" },
  stats: { display: "flex", gap: 20, marginBottom: 32 },
  statItem: { display: "flex", flexDirection: "column" },
  statNum: { color: "#fff", fontSize: 20, fontWeight: 800 },
  statLabel: { color: "rgba(255,255,255,0.6)", fontSize: 11, marginTop: 2 },
  testimonial: {
    background: "rgba(255,255,255,0.1)", backdropFilter: "blur(10px)",
    borderRadius: 14, padding: "16px", border: "1px solid rgba(255,255,255,0.15)",
  },
  testimonialText: { color: "#e9d5ff", fontSize: 13, fontStyle: "italic", lineHeight: 1.5, margin: "0 0 12px" },
  testimonialAuthor: { display: "flex", alignItems: "center", gap: 10 },
  testimonialAvatar: {
    width: 32, height: 32, borderRadius: "50%",
    background: "rgba(255,255,255,0.2)", color: "#fff",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontWeight: 700, fontSize: 14,
  },
  rightPanel: {
    flex: 1,
    background: "rgba(15,10,30,0.95)",
    backdropFilter: "blur(20px)",
    padding: "48px 40px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },
  formHeader: { marginBottom: 32 },
  title: { color: "#f3f4f6", fontSize: 26, fontWeight: 700, margin: "0 0 6px", letterSpacing: "-0.5px" },
  subtitle: { color: "#6b7280", fontSize: 14, margin: 0 },
  form: { display: "flex", flexDirection: "column", gap: 4 },
  field: { marginBottom: 16 },
  label: { display: "block", color: "#c4b5fd", fontSize: 13, fontWeight: 600, marginBottom: 8 },
  inputWrapper: {
    display: "flex", alignItems: "center",
    background: "rgba(255,255,255,0.05)", border: "1px solid rgba(167,139,250,0.25)",
    borderRadius: 12, overflow: "hidden",
  },
  inputIcon: { padding: "0 12px", fontSize: 16, flexShrink: 0 },
  input: {
    flex: 1, padding: "12px 0", background: "transparent",
    border: "none", color: "#f3f4f6", fontSize: 14, outline: "none",
  },
  eyeIcon: { padding: "0 12px", cursor: "pointer", fontSize: 16 },
  forgotLink: { color: "#a78bfa", fontSize: 13, cursor: "pointer", fontWeight: 500 },
  rememberRow: { display: "flex", alignItems: "center", gap: 8, cursor: "pointer", marginBottom: 4 },
  error: {
    background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
    color: "#fca5a5", borderRadius: 8, padding: "10px 14px", fontSize: 13,
    display: "flex", gap: 8, alignItems: "center",
  },
  btn: {
    width: "100%", padding: 14, borderRadius: 12,
    background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
    color: "#fff", border: "none", fontWeight: 700, fontSize: 15,
    cursor: "pointer", letterSpacing: "0.3px",
    boxShadow: "0 4px 20px rgba(124,58,237,0.4)",
    marginTop: 4,
  },
  loadingRow: { display: "flex", alignItems: "center", justifyContent: "center", gap: 8 },
  spinner: {
    width: 16, height: 16, borderRadius: "50%",
    border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff",
    animation: "spin 0.7s linear infinite",
    display: "inline-block",
  },
  divider: { display: "flex", alignItems: "center", gap: 12, margin: "16px 0" },
  dividerLine: { flex: 1, height: 1, background: "rgba(167,139,250,0.15)" },
  dividerText: { color: "#6b7280", fontSize: 13 },
  googleBtn: {
    width: "100%", padding: 12, borderRadius: 12,
    background: "rgba(255,255,255,0.05)", border: "1px solid rgba(167,139,250,0.2)",
    color: "#d1d5db", fontWeight: 600, fontSize: 14, cursor: "pointer",
    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
  },
  registerLink: { textAlign: "center", color: "#6b7280", fontSize: 14, marginTop: 12 },
};

export default Login;
