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

      {/* ════════ BACKGROUND SVG PLEINE PAGE ════════ */}
      <div className="login-bg" aria-hidden="true">
        <svg
          className="bg-scene"
          viewBox="0 0 1440 700"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMid slice"
        >
          {/* ── Dégradé de fond ── */}
          <defs>
            <radialGradient id="gBlue" cx="20%" cy="25%" r="55%">
              <stop offset="0%" stopColor="#1e4fa8" stopOpacity="0.55"/>
              <stop offset="100%" stopColor="#0d1a35" stopOpacity="0"/>
            </radialGradient>
            <radialGradient id="gBlue2" cx="80%" cy="75%" r="45%">
              <stop offset="0%" stopColor="#1a3a8a" stopOpacity="0.4"/>
              <stop offset="100%" stopColor="#0d1a35" stopOpacity="0"/>
            </radialGradient>
            <radialGradient id="gAmber" cx="70%" cy="30%" r="35%">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.09"/>
              <stop offset="100%" stopColor="#0d1a35" stopOpacity="0"/>
            </radialGradient>
          </defs>

          <rect width="1440" height="700" fill="#0d1a35"/>
          <rect width="1440" height="700" fill="url(#gBlue)"/>
          <rect width="1440" height="700" fill="url(#gBlue2)"/>
          <rect width="1440" height="700" fill="url(#gAmber)"/>

          {/* Grille de points */}
          {Array.from({length: 22}).map((_,row) =>
            Array.from({length: 46}).map((_,col) =>
              <circle key={`${row}-${col}`} cx={col*32+16} cy={row*32+16} r="1.1" fill="white" opacity="0.055"/>
            )
          )}

          {/* ── SKYLINE GAUCHE ── */}
          <rect x="0"   y="340" width="55"  height="360" rx="4" fill="#1c3468" opacity=".7"/>
          <rect x="8"   y="310" width="35"  height="35"  rx="3" fill="#1c3468" opacity=".7"/>
          <rect x="60"  y="295" width="72"  height="405" rx="4" fill="#162d5c" opacity=".65"/>
          <rect x="70"  y="268" width="48"  height="32"  rx="3" fill="#162d5c" opacity=".65"/>
          <rect x="137" y="315" width="54"  height="385" rx="4" fill="#1a3165" opacity=".6"/>
          <rect x="196" y="300" width="42"  height="400" rx="4" fill="#152856" opacity=".58"/>
          <rect x="206" y="272" width="20"  height="32"  rx="3" fill="#152856" opacity=".58"/>
          <rect x="243" y="325" width="60"  height="375" rx="4" fill="#1b3368" opacity=".55"/>
          <rect x="255" y="298" width="28"  height="30"  rx="3" fill="#1b3368" opacity=".55"/>
          <rect x="308" y="340" width="48"  height="360" rx="4" fill="#19305e" opacity=".5"/>

          {/* Fenêtres bâtiments gauche */}
          {[0,1,2,3,4,5,6].map(row =>
            [65,82,99].map(x =>
              <rect key={`wl-${row}-${x}`} x={x} y={308+row*28} width="9" height="12" rx="1.5"
                fill="#4a7ab5" opacity={Math.random() > 0.4 ? ".4" : ".1"}/>
            )
          )}
          {[0,1,2,3,4,5].map(row =>
            [200,218].map(x =>
              <rect key={`wl2-${row}-${x}`} x={x} y={310+row*28} width="9" height="12" rx="1.5"
                fill="#4a7ab5" opacity={Math.random() > 0.35 ? ".35" : ".08"}/>
            )
          )}

          {/* ── SKYLINE DROITE ── */}
          <rect x="1032" y="325" width="60"  height="375" rx="4" fill="#1c3468" opacity=".58"/>
          <rect x="1042" y="298" width="38"  height="30"  rx="3" fill="#1c3468" opacity=".58"/>
          <rect x="1097" y="300" width="54"  height="400" rx="4" fill="#162d5c" opacity=".62"/>
          <rect x="1107" y="270" width="32"  height="33"  rx="3" fill="#162d5c" opacity=".62"/>
          <rect x="1156" y="290" width="68"  height="410" rx="4" fill="#1a3165" opacity=".6"/>
          <rect x="1168" y="265" width="42"  height="28"  rx="3" fill="#1a3165" opacity=".6"/>
          <rect x="1229" y="310" width="50"  height="390" rx="4" fill="#152856" opacity=".55"/>
          <rect x="1284" y="330" width="60"  height="370" rx="4" fill="#1b3368" opacity=".52"/>
          <rect x="1349" y="318" width="91"  height="382" rx="4" fill="#19305e" opacity=".5"/>
          <rect x="1365" y="290" width="55"  height="30"  rx="3" fill="#19305e" opacity=".5"/>

          {/* Fenêtres bâtiments droite */}
          {[0,1,2,3,4,5,6].map(row =>
            [1100,1118,1136].map(x =>
              <rect key={`wr-${row}-${x}`} x={x} y={308+row*28} width="9" height="12" rx="1.5"
                fill="#4a7ab5" opacity={Math.random() > 0.4 ? ".38" : ".08"}/>
            )
          )}

          {/* ── SOL / ROUTE ── */}
          <rect x="0" y="620" width="1440" height="80" fill="#0a1428" opacity=".95"/>
          <rect x="350" y="608" width="740" height="40" rx="6" fill="#13243e" opacity=".95"/>
          {/* Marquage central */}
          {[0,1,2,3,4,5,6,7,8].map(i =>
            <rect key={`road${i}`} x={420+i*70} y="624" width="38" height="6" rx="3"
              fill="#f59e0b" opacity=".35"/>
          )}
          {/* Ombre route */}
          <ellipse cx="720" cy="650" rx="340" ry="18" fill="#000" opacity=".3"/>

          {/* ── TRACÉ ROUTE POINTILLÉ ── */}
          <path
            d="M 220 590 C 300 520, 380 560, 480 490 S 620 410, 760 420 S 920 450, 1060 390 S 1180 340, 1240 310"
            stroke="#f59e0b" strokeWidth="4" strokeDasharray="16 10"
            strokeLinecap="round" fill="none" opacity=".65"
          />

          {/* ── SMARTPHONE ── */}
          <rect x="185" y="260" width="145" height="238" rx="20" fill="#1e3a5f" opacity=".92"/>
          <rect x="191" y="266" width="133" height="226" rx="16" fill="#fff" opacity=".97"/>
          <rect x="237" y="260" width="52" height="10" rx="5" fill="#1e3a5f"/>
          {/* Carte */}
          <rect x="193" y="268" width="129" height="222" rx="14" fill="#d8eaf6"/>
          {[0,1,2,3,4,5,6,7].map(i =>
            <line key={`hm${i}`} x1="193" y1={295+i*28} x2="322" y2={295+i*28} stroke="#b4cfe0" strokeWidth="1"/>
          )}
          {[0,1,2,3].map(i =>
            <line key={`vm${i}`} x1={222+i*34} y1="268" x2={222+i*34} y2="490" stroke="#b4cfe0" strokeWidth="1"/>
          )}
          {/* Route carte */}
          <path d="M 200 455 C 220 415, 245 430, 262 390 S 288 350, 312 332"
            stroke="#1e3a5f" strokeWidth="3.5" strokeLinecap="round" fill="none" opacity=".7"/>
          {/* Pin carte */}
          <path d="M276 308 C276 299,267 292,258 292 C249 292,240 299,240 308 C240 319,258 333,258 333 C258 333,276 320,276 308Z"
            fill="#f59e0b"/>
          <circle cx="258" cy="307" r="6" fill="white"/>
          <circle cx="258" cy="307" r="2.5" fill="#f59e0b"/>

          {/* ── VOITURE (grande, centrée) ── */}
          {/* Ombre */}
          <ellipse cx="720" cy="612" rx="195" ry="14" fill="#000" opacity=".3"/>
          {/* Carrosserie */}
          <rect x="515" y="490" width="410" height="118" rx="18" fill="#1a3564"/>
          {/* Toit */}
          <path d="M562 490 C569 448,590 432,624 428 L 816 428 C 847 428,866 444,875 490 Z"
            fill="#1e3a5f"/>
          {/* Vitre arrière */}
          <path d="M582 488 C587 453,604 440,628 437 L 812 437 C 836 439,854 454,860 488 Z"
            fill="#4a7ab5" opacity=".72"/>
          {/* Reflet vitre */}
          <path d="M590 485 C594 460,608 449,630 447 L 690 447"
            stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity=".22"/>
          {/* Pare-choc bas */}
          <rect x="522" y="596" width="396" height="18" rx="9" fill="#142d55"/>
          {/* Bande latérale */}
          <rect x="515" y="534" width="410" height="4" rx="2" fill="#2a4d8a" opacity=".6"/>
          {/* Feux arrière G */}
          <rect x="519" y="505" width="30" height="46" rx="7" fill="#c53030" opacity=".92"/>
          <rect x="522" y="508" width="24" height="40" rx="5" fill="#fc8181" opacity=".5"/>
          {/* Feux arrière D */}
          <rect x="891" y="505" width="30" height="46" rx="7" fill="#c53030" opacity=".92"/>
          <rect x="894" y="508" width="24" height="40" rx="5" fill="#fc8181" opacity=".5"/>
          {/* Texte TAWSILA */}
          <text x="628" y="545" fontFamily="'DM Sans',sans-serif" fontWeight="900"
            fontSize="30" fill="white" opacity=".82" letterSpacing="3">TAWSILA</text>

          {/* Roue gauche */}
          <ellipse cx="578" cy="607" rx="44" ry="44" fill="#0d1f3c"/>
          <ellipse cx="578" cy="607" rx="33" ry="33" fill="#1a2e4a"/>
          <ellipse cx="578" cy="607" rx="18" ry="18" fill="#c8d4e8"/>
          <ellipse cx="578" cy="607" rx="7"  ry="7"  fill="#8fa8c8"/>
          <line x1="578" y1="589" x2="578" y2="625" stroke="#8fa8c8" strokeWidth="3.5"/>
          <line x1="560" y1="607" x2="596" y2="607" stroke="#8fa8c8" strokeWidth="3.5"/>
          <line x1="565" y1="594" x2="591" y2="620" stroke="#8fa8c8" strokeWidth="2.5"/>
          <line x1="591" y1="594" x2="565" y2="620" stroke="#8fa8c8" strokeWidth="2.5"/>

          {/* Roue droite */}
          <ellipse cx="862" cy="607" rx="44" ry="44" fill="#0d1f3c"/>
          <ellipse cx="862" cy="607" rx="33" ry="33" fill="#1a2e4a"/>
          <ellipse cx="862" cy="607" rx="18" ry="18" fill="#c8d4e8"/>
          <ellipse cx="862" cy="607" rx="7"  ry="7"  fill="#8fa8c8"/>
          <line x1="862" y1="589" x2="862" y2="625" stroke="#8fa8c8" strokeWidth="3.5"/>
          <line x1="844" y1="607" x2="880" y2="607" stroke="#8fa8c8" strokeWidth="3.5"/>
          <line x1="849" y1="594" x2="875" y2="620" stroke="#8fa8c8" strokeWidth="2.5"/>
          <line x1="875" y1="594" x2="849" y2="620" stroke="#8fa8c8" strokeWidth="2.5"/>

          {/* ── PIN GAUCHE ── */}
          <path d="M226 175 C226 150,204 132,196 132 C176 132,162 148,162 165 C162 186,196 216,196 216 C196 216,226 193,226 175Z"
            fill="#f59e0b"/>
          <circle cx="196" cy="164" r="14" fill="white"/>
          <circle cx="196" cy="164" r="6" fill="#f59e0b"/>
          <ellipse cx="196" cy="219" rx="16" ry="5" fill="#f59e0b" opacity=".22"/>

          {/* ── PIN DROIT ── */}
          <path d="M1268 155 C1268 128,1244 108,1236 108 C1214 108,1198 126,1198 144 C1198 167,1236 200,1236 200 C1236 200,1268 174,1268 155Z"
            fill="#f59e0b"/>
          <circle cx="1236" cy="143" r="17" fill="white"/>
          <circle cx="1236" cy="143" r="7" fill="#f59e0b"/>
          <ellipse cx="1236" cy="203" rx="20" ry="6" fill="#f59e0b" opacity=".22"/>
        </svg>
      </div>

      {/* Overlay léger pour lisibilité card */}
      <div className="login-overlay" />

      {/* ════════ CARD ════════ */}
      <div className="login-card">
        <div className="login-tagline">
        
        </div>

        <img src={tawsilaLogo} alt="Tawsila" className="form-logo" />
        <h2 className="form-title">Ravi de te revoir ! 👋</h2>
        <p className="form-subtitle">Connecte-toi pour continuer ton trajet</p>

        <form onSubmit={loginUser} noValidate>
          <div className="field">
            <div className="field-label-row">
              <label className="label">Email</label>
            </div>
            <div className={`input-wrapper ${loginError?.toLowerCase().includes("email") ? "error" : ""}`}>
              <span className="input-icon">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="4" width="20" height="16" rx="2"/>
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                </svg>
              </span>
              <input
                className="input" type="email" placeholder="toi@exemple.tn"
                autoComplete="email" value={loginInfo.email}
                onChange={(e) => updateLoginInfo({ ...loginInfo, email: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="field">
            <div className="field-label-row">
              <label className="label">Mot de passe</label>
              <Link to={`/forgot-password?email=${encodeURIComponent(loginInfo.email || "")}`} className="forgot-link">
                Mot de passe oublié ?
              </Link>
            </div>
            <div className={`input-wrapper ${
              loginError?.toLowerCase().includes("mot de passe") ||
              loginError?.toLowerCase().includes("password") ? "error" : ""
            }`}>
              <span className="input-icon">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                </svg>
              </span>
              <input
                className="input" type={showPassword ? "text" : "password"}
                placeholder="••••••••" autoComplete="current-password"
                value={loginInfo.password}
                onChange={(e) => updateLoginInfo({ ...loginInfo, password: e.target.value })}
                required
              />
              <button type="button" className="eye-btn" onClick={() => setShowPassword(!showPassword)}>
                {showPassword
                  ? <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                  : <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8.5 4.8A9 9 0 0 1 12 4c7 0 10 7 10 7a18.4 18.4 0 0 1-3.1 4.4m-5.7-.8a3 3 0 1 1-4.24-4.24"/><path d="m2 2 20 20"/></svg>
                }
              </button>
            </div>
          </div>

          <label className="remember-row">
            <input type="checkbox" />
            <span className="remember-text">Rester connecté</span>
          </label>

          {loginError && (
            <div className="error-box">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{flexShrink:0}}>
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {loginError}
            </div>
          )}

          <button type="submit" className="btn-primary" disabled={isLoginLoading}>
            {isLoginLoading ? <><div className="spinner"/> Connexion…</> : "Se connecter →"}
          </button>
        </form>

        <p className="signup-link">
          Pas encore inscrit ?{" "}
          <Link to="/register">Créer un compte gratuit</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
