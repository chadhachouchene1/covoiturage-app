import { useContext, useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import tawsilaLogo from '../assets/tawsilalogo.png';

// Tawsila SVG Logo (inlined from the uploaded logo)
const TawsilaLogo = ({ size = 38 }) => (
  <svg width={size} height={size} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="100" cy="100" r="96" stroke="#1a2e5a" strokeWidth="7" fill="white"/>
    {/* Car body */}
    <rect x="38" y="105" width="124" height="52" rx="10" fill="#1a2e5a"/>
    {/* Car roof */}
    <path d="M60 105 L72 75 H128 L140 105 Z" fill="#1a2e5a"/>
    {/* Windshield */}
    <path d="M73 103 L82 80 H118 L127 103 Z" fill="white" opacity="0.9"/>
    {/* Left wheel */}
    <circle cx="65" cy="157" r="16" fill="#1a2e5a" stroke="white" strokeWidth="4"/>
    <circle cx="65" cy="157" r="7" fill="white"/>
    {/* Right wheel */}
    <circle cx="135" cy="157" r="16" fill="#1a2e5a" stroke="white" strokeWidth="4"/>
    <circle cx="135" cy="157" r="7" fill="white"/>
    {/* People in car */}
    <circle cx="82" cy="92" r="7" fill="white"/>
    <circle cx="100" cy="90" r="7" fill="white"/>
    <circle cx="118" cy="92" r="7" fill="white"/>
    {/* Location pin */}
    <path d="M100 30 C88 30 78 40 78 52 C78 67 100 82 100 82 C100 82 122 67 122 52 C122 40 112 30 100 30Z" fill="#1a2e5a"/>
    <circle cx="100" cy="52" r="8" fill="white"/>
  </svg>
);

const NavBar = () => {
  const { user, logoutUser } = useContext(AuthContext);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  const avatarSrc = user?.image ? `http://localhost:5000${user.image}` : null;
  const initials = user
    ? `${user.name?.split(' ')[0]?.[0] || ''}${user.name?.split(' ')[1]?.[0] || ''}`.toUpperCase()
    : '';

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --navy: #0d1f4e;
          --navy-mid: #1a3474;
          --accent: #2563eb;
          --accent-light: #3b82f6;
          --sky: #e0eaff;
          --white: #ffffff;
          --muted: #64748b;
          --danger: #ef4444;
          --shadow: 0 8px 32px rgba(13,31,78,0.14);
        }

        .taw-nav {
          position: sticky;
          top: 0;
          z-index: 999;
          font-family: 'Plus Jakarta Sans', sans-serif;
          transition: all 0.3s ease;
          background: ${scrolled ? 'rgba(255,255,255,0.97)' : 'rgba(255,255,255,1)'};
          border-bottom: 1px solid ${scrolled ? 'rgba(13,31,78,0.08)' : 'rgba(13,31,78,0.06)'};
          box-shadow: ${scrolled ? 'var(--shadow)' : 'none'};
          backdrop-filter: blur(16px);
        }

        .taw-nav-inner {
          max-width: 1500px;
          margin: 0 auto;
          padding: 0 28px;
          height: 90px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
        }

        /* ── Brand ── */
        .taw-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
          flex-shrink: 0;
        }

        .taw-brand-logo {
          display: flex;
          align-items: center;
          filter: drop-shadow(0 2px 6px rgba(13,31,78,0.18));
          transition: transform 0.3s ease;
        }
        .taw-brand:hover .taw-brand-logo { transform: scale(1.06) rotate(-3deg); }

        .taw-brand-text {
          font-family: 'Nunito', sans-serif;
          font-weight: 900;
          font-size: 1.35rem;
          color: var(--navy);
          letter-spacing: -0.5px;
          line-height: 1;
        }

        .taw-brand-sub {
          font-size: 10px;
          font-weight: 600;
          color: var(--accent);
          letter-spacing: 1.2px;
          text-transform: uppercase;
          display: block;
          margin-top: 1px;
        }

        /* ── Nav links ── */
        .taw-links {
          display: flex;
          align-items: center;
          gap: 2px;
          flex: 1;
          justify-content: center;
        }

        .taw-link {
          position: relative;
          padding: 7px 14px;
          border-radius: 10px;
          color: var(--muted);
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 6px;
          white-space: nowrap;
        }

        .taw-link svg { width: 15px; height: 15px; }

        .taw-link:hover {
          color: var(--navy);
          background: var(--sky);
        }

        .taw-link.active {
          color: var(--accent);
          background: rgba(37,99,235,0.09);
          font-weight: 600;
        }

        .taw-link.active::after {
          content: '';
          position: absolute;
          bottom: -1px;
          left: 16px;
          right: 16px;
          height: 2px;
          background: var(--accent);
          border-radius: 2px 2px 0 0;
        }

        /* ── Right actions ── */
        .taw-actions {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-shrink: 0;
        }

        .taw-btn-ghost {
          padding: 8px 16px;
          border-radius: 10px;
          color: var(--navy);
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          text-decoration: none;
          border: 1.5px solid rgba(13,31,78,0.15);
          background: transparent;
          transition: all 0.2s;
          font-family: inherit;
        }
        .taw-btn-ghost:hover {
          border-color: var(--accent);
          color: var(--accent);
          background: rgba(37,99,235,0.05);
        }

        .taw-btn-primary {
          padding: 9px 20px;
          border-radius: 10px;
          color: white;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          text-decoration: none;
          background: linear-gradient(135deg, var(--navy) 0%, var(--accent) 100%);
          border: none;
          transition: all 0.25s;
          box-shadow: 0 3px 10px rgba(37,99,235,0.25);
          font-family: inherit;
        }
        .taw-btn-primary:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 18px rgba(37,99,235,0.35);
          background: linear-gradient(135deg, var(--navy-mid) 0%, var(--accent-light) 100%);
        }

        /* ── User dropdown ── */
        .taw-user { position: relative; }

        .taw-user-trigger {
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 5px 12px 5px 5px;
          border-radius: 50px;
          border: 1.5px solid rgba(13,31,78,0.12);
          background: var(--white);
          cursor: pointer;
          transition: all 0.2s;
          font-family: inherit;
        }
        .taw-user-trigger:hover {
          border-color: var(--accent);
          box-shadow: 0 0 0 3px rgba(37,99,235,0.08);
        }

        .taw-avatar-wrap { position: relative; }

        .taw-avatar {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid var(--sky);
          display: block;
        }

        .taw-avatar-init {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--navy) 0%, var(--accent) 100%);
          color: white;
          font-weight: 800;
          font-size: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Nunito', sans-serif;
          border: 2px solid var(--sky);
        }

        .taw-online {
          width: 9px;
          height: 9px;
          background: #22c55e;
          border-radius: 50%;
          border: 2px solid white;
          position: absolute;
          bottom: 0;
          right: 0;
        }

        .taw-uname {
          font-size: 13.5px;
          font-weight: 600;
          color: var(--navy);
          max-width: 110px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .taw-chevron {
          color: var(--muted);
          font-size: 9px;
          transition: transform 0.2s;
          line-height: 1;
        }
        .taw-chevron.open { transform: rotate(180deg); }

        /* ── Dropdown menu ── */
        .taw-dropdown {
          position: absolute;
          top: calc(100% + 12px);
          right: 0;
          width: 230px;
          background: white;
          border: 1px solid rgba(13,31,78,0.08);
          border-radius: 16px;
          padding: 8px;
          box-shadow: 0 20px 60px rgba(13,31,78,0.15), 0 4px 12px rgba(13,31,78,0.06);
          animation: tawDrop 0.18s cubic-bezier(0.16,1,0.3,1);
          transform-origin: top right;
        }

        @keyframes tawDrop {
          from { opacity: 0; transform: scale(0.94) translateY(-6px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }

        .taw-dd-header {
          padding: 10px 12px 12px;
          border-bottom: 1px solid rgba(13,31,78,0.07);
          margin-bottom: 6px;
        }

        .taw-dd-name {
          font-weight: 700;
          font-size: 14px;
          color: var(--navy);
        }

        .taw-dd-email {
          font-size: 11.5px;
          color: var(--muted);
          margin-top: 2px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .taw-dd-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 9px 12px;
          border-radius: 9px;
          color: #374151;
          font-size: 13.5px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s;
          text-decoration: none;
          background: none;
          border: none;
          width: 100%;
          text-align: left;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }

        .taw-dd-item svg { width: 15px; height: 15px; color: var(--muted); flex-shrink: 0; }

        .taw-dd-item:hover {
          background: var(--sky);
          color: var(--navy);
        }
        .taw-dd-item:hover svg { color: var(--accent); }

        .taw-dd-item.danger { color: var(--danger); }
        .taw-dd-item.danger:hover { background: rgba(239,68,68,0.07); }
        .taw-dd-item.danger svg { color: var(--danger); }

        .taw-dd-sep {
          height: 1px;
          background: rgba(13,31,78,0.07);
          margin: 6px 4px;
        }
      `}</style>

      <nav className="taw-nav">
        <div className="taw-nav-inner">

          {/* Brand */}
          <Link to="/" className="taw-brand">
            <div className="taw-brand-logo">
               <img src={tawsilaLogo} alt="Tawsila" style={{ width: 90, height: 90, objectFit: 'contain' }} />
            </div>
            <div>
              <span className="taw-brand-text">TAWSILA</span>
              <span className="taw-brand-sub">Your Ride, Our Pride</span>
            </div>
          </Link>

          {/* Center links (only when logged in) */}
          {user && (
            <div className="taw-links">
              <Link to="/" className={`taw-link${isActive('/') ? ' active' : ''}`}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
                Accueil
              </Link>
              <Link to="/trips" className={`taw-link${isActive('/trips') ? ' active' : ''}`}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
                  <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/>
                </svg>
                Trajets
              </Link>
              
            </div>
          )}

          {/* Right actions */}
          <div className="taw-actions">
            {!user ? (
              <>
               
                <Link to="/register" className="taw-btn-ghost">S'inscrire</Link>
                <Link to="/login" className="taw-btn-primary">Connexion</Link>
              </>
            ) : (
              <div className="taw-user" ref={dropdownRef}>
                <button className="taw-user-trigger" onClick={() => setMenuOpen(!menuOpen)}>
                  <div className="taw-avatar-wrap">
                    {avatarSrc
                      ? <img src={avatarSrc} alt="avatar" className="taw-avatar" />
                      : <div className="taw-avatar-init">{initials || '?'}</div>
                    }
                    <div className="taw-online" />
                  </div>
                  <span className="taw-uname">{user.name}</span>
                  <span className={`taw-chevron${menuOpen ? ' open' : ''}`}>▼</span>
                </button>

                {menuOpen && (
                  <div className="taw-dropdown">
                    <div className="taw-dd-header">
                      <div className="taw-dd-name">{user.name}</div>
                      <div className="taw-dd-email">{user.email}</div>
                    </div>

                    <Link to="/profile" className="taw-dd-item">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
                      </svg>
                      Mon profil
                    </Link>
                    <Link to="/my-trips" className="taw-dd-item">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h3l3 3v5h-6V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
                      </svg>
                      Mes trajets
                    </Link>
                    <Link to="/reservations" className="taw-dd-item">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M15 3H9a2 2 0 00-2 2v14a2 2 0 002 2h6a2 2 0 002-2V5a2 2 0 00-2-2z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                      </svg>
                      Mes réservations
                    </Link>
                    <Link to="/settings" className="taw-dd-item">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
                      </svg>
                      Paramètres
                    </Link>

                    <div className="taw-dd-sep" />

                    <button className="taw-dd-item danger" onClick={handleLogout}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
                      </svg>
                      Se déconnecter
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

        </div>
      </nav>
    </>
  );
};

export default NavBar;
