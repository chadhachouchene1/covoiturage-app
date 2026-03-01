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

      {/* ── SVG illustration (remplace la photo Unsplash) ── */}
      <div className="rg-bg">
        <svg
          viewBox="0 0 1440 700"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMid slice"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
        >
          <defs>
            <radialGradient id="rg1" cx="20%" cy="25%" r="55%">
              <stop offset="0%" stopColor="#1e4fa8" stopOpacity="0.55"/>
              <stop offset="100%" stopColor="#0d1a35" stopOpacity="0"/>
            </radialGradient>
            <radialGradient id="rg2" cx="80%" cy="75%" r="45%">
              <stop offset="0%" stopColor="#1a3a8a" stopOpacity="0.40"/>
              <stop offset="100%" stopColor="#0d1a35" stopOpacity="0"/>
            </radialGradient>
            <radialGradient id="rg3" cx="70%" cy="30%" r="35%">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.09"/>
              <stop offset="100%" stopColor="#0d1a35" stopOpacity="0"/>
            </radialGradient>
          </defs>

          {/* Fond */}
          <rect width="1440" height="700" fill="#0d1a35"/>
          <rect width="1440" height="700" fill="url(#rg1)"/>
          <rect width="1440" height="700" fill="url(#rg2)"/>
          <rect width="1440" height="700" fill="url(#rg3)"/>

          {/* Grille de points */}
          {Array.from({length:22}).map((_,row) =>
            Array.from({length:46}).map((_,col) =>
              <circle key={`d${row}-${col}`} cx={col*32+16} cy={row*32+16} r="1.1" fill="white" opacity="0.055"/>
            )
          )}

          {/* ── SKYLINE GAUCHE ── */}
          <rect x="0"   y="340" width="55"  height="360" rx="4" fill="#1c3468" opacity=".70"/>
          <rect x="8"   y="310" width="35"  height="35"  rx="3" fill="#1c3468" opacity=".70"/>
          <rect x="60"  y="295" width="72"  height="405" rx="4" fill="#162d5c" opacity=".65"/>
          <rect x="70"  y="268" width="48"  height="32"  rx="3" fill="#162d5c" opacity=".65"/>
          <rect x="137" y="315" width="54"  height="385" rx="4" fill="#1a3165" opacity=".60"/>
          <rect x="196" y="300" width="42"  height="400" rx="4" fill="#152856" opacity=".58"/>
          <rect x="206" y="272" width="20"  height="32"  rx="3" fill="#152856" opacity=".58"/>
          <rect x="243" y="325" width="60"  height="375" rx="4" fill="#1b3368" opacity=".55"/>
          <rect x="255" y="298" width="28"  height="30"  rx="3" fill="#1b3368" opacity=".55"/>
          <rect x="308" y="340" width="48"  height="360" rx="4" fill="#19305e" opacity=".50"/>
          {[0,1,2,3,4,5,6].map(r=>[65,82,99].map(x=><rect key={`wl${r}${x}`} x={x} y={308+r*28} width="9" height="12" rx="1.5" fill="#4a7ab5" opacity=".35"/>))}
          {[0,1,2,3,4,5].map(r=>[200,218].map(x=><rect key={`wl2${r}${x}`} x={x} y={310+r*28} width="9" height="12" rx="1.5" fill="#4a7ab5" opacity=".30"/>))}

          {/* ── SKYLINE DROITE ── */}
          <rect x="1032" y="325" width="60"  height="375" rx="4" fill="#1c3468" opacity=".58"/>
          <rect x="1042" y="298" width="38"  height="30"  rx="3" fill="#1c3468" opacity=".58"/>
          <rect x="1097" y="300" width="54"  height="400" rx="4" fill="#162d5c" opacity=".62"/>
          <rect x="1107" y="270" width="32"  height="33"  rx="3" fill="#162d5c" opacity=".62"/>
          <rect x="1156" y="290" width="68"  height="410" rx="4" fill="#1a3165" opacity=".60"/>
          <rect x="1168" y="265" width="42"  height="28"  rx="3" fill="#1a3165" opacity=".60"/>
          <rect x="1229" y="310" width="50"  height="390" rx="4" fill="#152856" opacity=".55"/>
          <rect x="1284" y="330" width="60"  height="370" rx="4" fill="#1b3368" opacity=".52"/>
          <rect x="1349" y="318" width="91"  height="382" rx="4" fill="#19305e" opacity=".50"/>
          <rect x="1365" y="290" width="55"  height="30"  rx="3" fill="#19305e" opacity=".50"/>
          {[0,1,2,3,4,5,6].map(r=>[1100,1118,1136].map(x=><rect key={`wr${r}${x}`} x={x} y={308+r*28} width="9" height="12" rx="1.5" fill="#4a7ab5" opacity=".35"/>))}

          {/* ── SOL / ROUTE ── */}
          <rect x="0"   y="620" width="1440" height="80" fill="#0a1428" opacity=".95"/>
          <rect x="350" y="608" width="740"  height="40" rx="6" fill="#13243e" opacity=".95"/>
          {[0,1,2,3,4,5,6,7,8].map(i=><rect key={`rm${i}`} x={420+i*70} y="624" width="38" height="6" rx="3" fill="#f59e0b" opacity=".35"/>)}
          <ellipse cx="720" cy="650" rx="340" ry="18" fill="#000" opacity=".30"/>

          {/* ── TRACÉ ROUTE ── */}
          <path d="M 220 590 C 300 520,380 560,480 490 S 620 410,760 420 S 920 450,1060 390 S 1180 340,1240 310"
            stroke="#f59e0b" strokeWidth="4" strokeDasharray="16 10" strokeLinecap="round" fill="none" opacity=".65"/>

          {/* ── SMARTPHONE ── */}
          <rect x="185" y="260" width="145" height="238" rx="20" fill="#1e3a5f" opacity=".92"/>
          <rect x="191" y="266" width="133" height="226" rx="16" fill="#fff"    opacity=".97"/>
          <rect x="237" y="260" width="52"  height="10"  rx="5"  fill="#1e3a5f"/>
          <rect x="193" y="268" width="129" height="222" rx="14" fill="#d8eaf6"/>
          {[0,1,2,3,4,5,6,7].map(i=><line key={`hm${i}`} x1="193" y1={295+i*28} x2="322" y2={295+i*28} stroke="#b4cfe0" strokeWidth="1"/>)}
          {[0,1,2,3].map(i=><line key={`vm${i}`} x1={222+i*34} y1="268" x2={222+i*34} y2="490" stroke="#b4cfe0" strokeWidth="1"/>)}
          <path d="M 200 455 C 220 415,245 430,262 390 S 288 350,312 332" stroke="#1e3a5f" strokeWidth="3.5" strokeLinecap="round" fill="none" opacity=".7"/>
          <path d="M276 308 C276 299,267 292,258 292 C249 292,240 299,240 308 C240 319,258 333,258 333 C258 333,276 320,276 308Z" fill="#f59e0b"/>
          <circle cx="258" cy="307" r="6"   fill="white"/>
          <circle cx="258" cy="307" r="2.5" fill="#f59e0b"/>

          {/* ── VOITURE ── */}
          <ellipse cx="720" cy="612" rx="195" ry="14" fill="#000" opacity=".30"/>
          <rect x="515" y="490" width="410" height="118" rx="18" fill="#1a3564"/>
          <path d="M562 490 C569 448,590 432,624 428 L 816 428 C 847 428,866 444,875 490 Z" fill="#1e3a5f"/>
          <path d="M582 488 C587 453,604 440,628 437 L 812 437 C 836 439,854 454,860 488 Z" fill="#4a7ab5" opacity=".72"/>
          <path d="M590 485 C594 460,608 449,630 447 L 690 447" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity=".22"/>
          <rect x="522" y="596" width="396" height="18" rx="9" fill="#142d55"/>
          <rect x="515" y="534" width="410" height="4"  rx="2" fill="#2a4d8a" opacity=".60"/>
          <rect x="519" y="505" width="30" height="46" rx="7" fill="#c53030" opacity=".92"/>
          <rect x="522" y="508" width="24" height="40" rx="5" fill="#fc8181" opacity=".50"/>
          <rect x="891" y="505" width="30" height="46" rx="7" fill="#c53030" opacity=".92"/>
          <rect x="894" y="508" width="24" height="40" rx="5" fill="#fc8181" opacity=".50"/>
          <text x="628" y="545" fontFamily="'DM Sans',sans-serif" fontWeight="900" fontSize="30" fill="white" opacity=".82" letterSpacing="3">TAWSILA</text>
          {/* Roue G */}
          <ellipse cx="578" cy="607" rx="44" ry="44" fill="#0d1f3c"/>
          <ellipse cx="578" cy="607" rx="33" ry="33" fill="#1a2e4a"/>
          <ellipse cx="578" cy="607" rx="18" ry="18" fill="#c8d4e8"/>
          <ellipse cx="578" cy="607" rx="7"  ry="7"  fill="#8fa8c8"/>
          <line x1="578" y1="589" x2="578" y2="625" stroke="#8fa8c8" strokeWidth="3.5"/>
          <line x1="560" y1="607" x2="596" y2="607" stroke="#8fa8c8" strokeWidth="3.5"/>
          <line x1="565" y1="594" x2="591" y2="620" stroke="#8fa8c8" strokeWidth="2.5"/>
          <line x1="591" y1="594" x2="565" y2="620" stroke="#8fa8c8" strokeWidth="2.5"/>
          {/* Roue D */}
          <ellipse cx="862" cy="607" rx="44" ry="44" fill="#0d1f3c"/>
          <ellipse cx="862" cy="607" rx="33" ry="33" fill="#1a2e4a"/>
          <ellipse cx="862" cy="607" rx="18" ry="18" fill="#c8d4e8"/>
          <ellipse cx="862" cy="607" rx="7"  ry="7"  fill="#8fa8c8"/>
          <line x1="862" y1="589" x2="862" y2="625" stroke="#8fa8c8" strokeWidth="3.5"/>
          <line x1="844" y1="607" x2="880" y2="607" stroke="#8fa8c8" strokeWidth="3.5"/>
          <line x1="849" y1="594" x2="875" y2="620" stroke="#8fa8c8" strokeWidth="2.5"/>
          <line x1="875" y1="594" x2="849" y2="620" stroke="#8fa8c8" strokeWidth="2.5"/>

          {/* ── PIN GAUCHE ── */}
          <path d="M226 175 C226 150,204 132,196 132 C176 132,162 148,162 165 C162 186,196 216,196 216 C196 216,226 193,226 175Z" fill="#f59e0b"/>
          <circle cx="196" cy="164" r="14" fill="white"/>
          <circle cx="196" cy="164" r="6"  fill="#f59e0b"/>
          <ellipse cx="196" cy="219" rx="16" ry="5" fill="#f59e0b" opacity=".22"/>

          {/* ── PIN DROIT ── */}
          <path d="M1268 155 C1268 128,1244 108,1236 108 C1214 108,1198 126,1198 144 C1198 167,1236 200,1236 200 C1236 200,1268 174,1268 155Z" fill="#f59e0b"/>
          <circle cx="1236" cy="143" r="17" fill="white"/>
          <circle cx="1236" cy="143" r="7"  fill="#f59e0b"/>
          <ellipse cx="1236" cy="203" rx="20" ry="6" fill="#f59e0b" opacity=".22"/>
        </svg>
      </div>

      <div className="rg-overlay" />

      <div className="rg-card">
        {/* Header */}
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

        {/* Progress */}
        <div className="rg-progress">
          <div className="rg-progress-bar" style={{ width: `${((step - 1) / 2) * 100}%` }} />
        </div>

        {/* STEP 1 */}
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

            <p className="rg-login-link">Déjà un compte ? <Link to="/login">Se connecter</Link></p>
          </form>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <form onSubmit={handleVerification} className="rg-body" style={{ textAlign: "center" }}>
            <div className="rg-otp-icon">📧</div>
            <h2 className="rg-title" style={{ textAlign: "center" }}>Vérification email</h2>
            <p className="rg-subtitle" style={{ textAlign: "center" }}>
              Code envoyé à <strong style={{ color: "#1a56db" }}>{formData.email}</strong>
            </p>
            <div className="rg-otp-wrap">
              {[0, 1, 2, 3].map((i) => (
                <input key={i} type="text" inputMode="numeric" maxLength={1} className="rg-otp-box"
                  value={verificationCode[i] || ""} onChange={(e) => handleOtpInput(e, i)} />
              ))}
            </div>
            {otpError  && <div className="rg-error">{otpError}</div>}
            {resendMsg && <div className="rg-success">{resendMsg}</div>}
            <button type="submit" className="rg-btn" disabled={otpLoading || verificationCode.replace(/\s/g, "").length < 4}>
              {otpLoading ? <><div className="rg-spinner" /> Vérification…</> : "Vérifier le code"}
            </button>
            <p style={{ fontSize: "0.83rem", color: "#94a3b8", marginTop: "0.9rem" }}>
              Code non reçu ? <button type="button" className="rg-link-btn" onClick={handleResend}>Renvoyer</button>
            </p>
            <p style={{ fontSize: "0.83rem", color: "#94a3b8", marginTop: "6px" }}>
              <button type="button" className="rg-link-btn" onClick={() => setStep(1)}>← Modifier l'email</button>
            </p>
          </form>
        )}

        {/* STEP 3 */}
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
              <span className="rg-agree-text">J'accepte les <span>conditions d'utilisation</span> de Tawsila</span>
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
