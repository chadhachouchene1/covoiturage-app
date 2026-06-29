import { useContext, useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import tawsilaLogo from '../assets/tawsilalogo.png';
import { TripContext } from "../context/TripContext";
import { io } from "socket.io-client";

const NavBar = () => {
  const { user, logoutUser } = useContext(AuthContext);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);
  const [notifCount, setNotifCount] = useState(0);
  const [tripNotifCount, setTripNotifCount] = useState(0);
  const socketRef = useRef(null);
  const audioCtxRef = useRef(null);
  const previousUnreadCountRef = useRef(null);
  const { unreadCount, fetchUnreadCount } = useContext(TripContext);

  const ensureAudioContext = async () => {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return null;
    if (!audioCtxRef.current) audioCtxRef.current = new AudioContextClass();
    if (audioCtxRef.current.state === "suspended") await audioCtxRef.current.resume();
    return audioCtxRef.current;
  };

  const playNotifSound = async () => {
    try {
      const ctx = await ensureAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const gain = ctx.createGain();
      gain.connect(ctx.destination);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.15, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);
      const firstTone = ctx.createOscillator();
      firstTone.type = "sine";
      firstTone.frequency.setValueAtTime(880, now);
      firstTone.connect(gain);
      firstTone.start(now);
      firstTone.stop(now + 0.1);
      const secondTone = ctx.createOscillator();
      secondTone.type = "sine";
      secondTone.frequency.setValueAtTime(1174, now + 0.12);
      secondTone.connect(gain);
      secondTone.start(now + 0.12);
      secondTone.stop(now + 0.22);
    } catch {}
  };

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 120000);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    const unlockAudio = async () => await ensureAudioContext();
    window.addEventListener("click", unlockAudio, { once: true });
    window.addEventListener("keydown", unlockAudio, { once: true });
    return () => {
      window.removeEventListener("click", unlockAudio);
      window.removeEventListener("keydown", unlockAudio);
    };
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!user) return;
    const socket = io(import.meta.env.VITE_SOCKET_URL, { transports: ["websocket"] });
    socketRef.current = socket;
    socket.on("connect", () => {
      const userId = user?.id || user?._id;
      if (userId) socket.emit("user:join", userId);
    });
    socket.on("notification:new", (data) => {
      const notifType = data?.type;
      if (notifType === "message") {
        if (location.pathname !== "/chat") setNotifCount(prev => prev + 1);
        playNotifSound();
        return;
      }
      if (location.pathname !== "/my-reservations" && location.pathname !== "/reservations") {
        setTripNotifCount(prev => prev + 1);
      }
      fetchUnreadCount();
      playNotifSound();
    });
    return () => socket.disconnect();
  }, [user, fetchUnreadCount, location.pathname]);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => { setMenuOpen(false); setMobileOpen(false); }, [location.pathname]);

  useEffect(() => {
    if (location.pathname === "/chat") setNotifCount(0);
  }, [location.pathname]);

  useEffect(() => {
    if (location.pathname === "/my-reservations" || location.pathname === "/reservations") {
      setTripNotifCount(0);
      fetchUnreadCount();
    }
  }, [location.pathname, fetchUnreadCount]);

  useEffect(() => {
    if (!user) { previousUnreadCountRef.current = null; return; }
    if (previousUnreadCountRef.current === null) { previousUnreadCountRef.current = unreadCount; return; }
    if (unreadCount > previousUnreadCountRef.current) playNotifSound();
    previousUnreadCountRef.current = unreadCount;
  }, [unreadCount, user]);

  const handleLogout = () => { logoutUser(); navigate('/login'); };
  const avatarSrc = user?.image || null;
  const initials = user ? `${user.name?.split(' ')[0]?.[0] || ''}${user.name?.split(' ')[1]?.[0] || ''}`.toUpperCase() : '';
  const isActive = (path) => location.pathname === path;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --navy: #0d1f4e; --navy-mid: #1a3474; --accent: #2563eb;
          --accent-light: #3b82f6; --sky: #e0eaff; --white: #ffffff;
          --muted: #64748b; --danger: #ef4444;
          --shadow: 0 8px 32px rgba(13,31,78,0.14);
        }
        .taw-nav {
          position: sticky; top: 0; z-index: 999;
          font-family: 'Plus Jakarta Sans', sans-serif;
          transition: all 0.3s ease;
          background: rgba(255,255,255,0.97);
          border-bottom: 1px solid rgba(13,31,78,0.08);
          box-shadow: ${scrolled ? 'var(--shadow)' : 'none'};
          backdrop-filter: blur(16px);
        }
        .taw-nav-inner {
          max-width: 1500px; margin: 0 auto; padding: 0 28px;
          height: 70px; display: flex; align-items: center;
          justify-content: space-between; gap: 16px;
        }
        .taw-brand {
          display: flex; align-items: center; gap: 8px;
          text-decoration: none; flex-shrink: 0;
        }
        .taw-brand-text {
          font-family: 'Nunito', sans-serif; font-weight: 900;
          font-size: 1.2rem; color: var(--navy); letter-spacing: -0.5px; line-height: 1;
        }
        .taw-brand-sub {
          font-size: 9px; font-weight: 600; color: var(--accent);
          letter-spacing: 1px; text-transform: uppercase; display: block; margin-top: 1px;
        }
        .taw-links {
          display: flex; align-items: center; gap: 2px;
          flex: 1; justify-content: center;
        }
        .taw-link {
          position: relative; padding: 7px 14px; border-radius: 10px;
          color: var(--muted); text-decoration: none; font-size: 14px;
          font-weight: 500; transition: all 0.2s;
          display: flex; align-items: center; gap: 6px; white-space: nowrap;
        }
        .taw-link svg { width: 15px; height: 15px; }
        .taw-link:hover { color: var(--navy); background: var(--sky); }
        .taw-link.active { color: var(--accent); background: rgba(37,99,235,0.09); font-weight: 600; }
        .taw-link.active::after {
          content: ''; position: absolute; bottom: -1px; left: 16px; right: 16px;
          height: 2px; background: var(--accent); border-radius: 2px 2px 0 0;
        }
        .taw-actions { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
        .taw-btn-ghost {
          padding: 8px 16px; border-radius: 10px; color: var(--navy);
          font-size: 14px; font-weight: 600; cursor: pointer;
          text-decoration: none; border: 1.5px solid rgba(13,31,78,0.15);
          background: transparent; transition: all 0.2s; font-family: inherit;
        }
        .taw-btn-ghost:hover { border-color: var(--accent); color: var(--accent); background: rgba(37,99,235,0.05); }
        .taw-btn-primary {
          padding: 9px 20px; border-radius: 10px; color: white;
          font-size: 14px; font-weight: 700; cursor: pointer;
          text-decoration: none;
          background: linear-gradient(135deg, var(--navy) 0%, var(--accent) 100%);
          border: none; transition: all 0.25s;
          box-shadow: 0 3px 10px rgba(37,99,235,0.25); font-family: inherit;
        }
        .taw-btn-primary:hover { transform: translateY(-1px); box-shadow: 0 6px 18px rgba(37,99,235,0.35); }
        .taw-user { position: relative; }
        .taw-user-trigger {
          display: flex; align-items: center; gap: 9px;
          padding: 5px 12px 5px 5px; border-radius: 50px;
          border: 1.5px solid rgba(13,31,78,0.12); background: var(--white);
          cursor: pointer; transition: all 0.2s; font-family: inherit;
        }
        .taw-user-trigger:hover { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(37,99,235,0.08); }
        .taw-avatar-wrap { position: relative; }
        .taw-avatar { width: 34px; height: 34px; border-radius: 50%; object-fit: cover; border: 2px solid var(--sky); display: block; }
        .taw-avatar-init {
          width: 34px; height: 34px; border-radius: 50%;
          background: linear-gradient(135deg, var(--navy) 0%, var(--accent) 100%);
          color: white; font-weight: 800; font-size: 12px;
          display: flex; align-items: center; justify-content: center;
          font-family: 'Nunito', sans-serif; border: 2px solid var(--sky);
        }
        .taw-online {
          width: 9px; height: 9px; background: #22c55e; border-radius: 50%;
          border: 2px solid white; position: absolute; bottom: 0; right: 0;
        }
        .taw-uname {
          font-size: 13.5px; font-weight: 600; color: var(--navy);
          max-width: 110px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        }
        .taw-chevron { color: var(--muted); font-size: 9px; transition: transform 0.2s; line-height: 1; }
        .taw-chevron.open { transform: rotate(180deg); }
        .taw-dropdown {
          position: absolute; top: calc(100% + 12px); right: 0; width: 230px;
          background: white; border: 1px solid rgba(13,31,78,0.08); border-radius: 16px;
          padding: 8px; box-shadow: 0 20px 60px rgba(13,31,78,0.15), 0 4px 12px rgba(13,31,78,0.06);
          animation: tawDrop 0.18s cubic-bezier(0.16,1,0.3,1); transform-origin: top right;
        }
        @keyframes tawDrop {
          from { opacity: 0; transform: scale(0.94) translateY(-6px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes pop { from { transform: scale(0); } to { transform: scale(1); } }
        .taw-dd-header { padding: 10px 12px 12px; border-bottom: 1px solid rgba(13,31,78,0.07); margin-bottom: 6px; }
        .taw-dd-name { font-weight: 700; font-size: 14px; color: var(--navy); }
        .taw-dd-email { font-size: 11.5px; color: var(--muted); margin-top: 2px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .taw-dd-item {
          display: flex; align-items: center; gap: 10px; padding: 9px 12px;
          border-radius: 9px; color: #374151; font-size: 13.5px; font-weight: 500;
          cursor: pointer; transition: all 0.15s; text-decoration: none;
          background: none; border: none; width: 100%; text-align: left;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
        .taw-dd-item svg { width: 15px; height: 15px; color: var(--muted); flex-shrink: 0; }
        .taw-dd-item:hover { background: var(--sky); color: var(--navy); }
        .taw-dd-item:hover svg { color: var(--accent); }
        .taw-dd-item.danger { color: var(--danger); }
        .taw-dd-item.danger:hover { background: rgba(239,68,68,0.07); }
        .taw-dd-item.danger svg { color: var(--danger); }
        .taw-dd-sep { height: 1px; background: rgba(13,31,78,0.07); margin: 6px 4px; }

        /* ── Hamburger button ── */
        .taw-hamburger {
          display: none; flex-direction: column; gap: 5px;
          background: none; border: none; cursor: pointer; padding: 4px;
        }
        .taw-hamburger span {
          display: block; width: 24px; height: 2px;
          background: var(--navy); border-radius: 2px; transition: all 0.3s;
        }
        .taw-hamburger.open span:nth-child(1) { transform: rotate(45deg) translate(5px, 5px); }
        .taw-hamburger.open span:nth-child(2) { opacity: 0; }
        .taw-hamburger.open span:nth-child(3) { transform: rotate(-45deg) translate(5px, -5px); }

        /* ── Mobile menu ── */
        .taw-mobile-menu {
          display: none; flex-direction: column; gap: 4px;
          padding: 12px 16px 16px; border-top: 1px solid rgba(13,31,78,0.08);
          background: white;
        }
        .taw-mobile-menu.open { display: flex; }
        .taw-mobile-link {
          display: flex; align-items: center; gap: 10px;
          padding: 12px 14px; border-radius: 12px; color: var(--muted);
          text-decoration: none; font-size: 15px; font-weight: 500;
          transition: all 0.2s;
        }
        .taw-mobile-link svg { width: 18px; height: 18px; }
        .taw-mobile-link:hover, .taw-mobile-link.active {
          color: var(--accent); background: rgba(37,99,235,0.07); font-weight: 600;
        }
        .taw-mobile-user {
          display: flex; align-items: center; gap: 12px;
          padding: 12px 14px; border-top: 1px solid rgba(13,31,78,0.08); margin-top: 4px;
        }
        .taw-mobile-name { font-weight: 700; font-size: 14px; color: var(--navy); }
        .taw-mobile-email { font-size: 12px; color: var(--muted); }
        .taw-mobile-logout {
          display: flex; align-items: center; gap: 10px;
          padding: 12px 14px; border-radius: 12px; color: var(--danger);
          font-size: 15px; font-weight: 500; cursor: pointer;
          background: none; border: none; width: 100%; text-align: left;
          font-family: inherit; transition: all 0.2s;
        }
        .taw-mobile-logout:hover { background: rgba(239,68,68,0.07); }
        .taw-mobile-logout svg { width: 18px; height: 18px; }
        .taw-mobile-auth { display: flex; gap: 10px; padding: 8px 0; }
        .taw-mobile-auth a { flex: 1; text-align: center; }

        /* ── Responsive breakpoints ── */
        @media (max-width: 768px) {
          .taw-links { display: none; }
          .taw-uname { display: none; }
          .taw-chevron { display: none; }
          .taw-hamburger { display: flex; }
          .taw-btn-ghost { display: none; }
          .taw-btn-primary { display: none; }
          .taw-nav-inner { padding: 0 16px; height: 60px; }
        }
        @media (max-width: 480px) {
          .taw-brand-text { font-size: 1rem; }
          .taw-brand-sub { display: none; }
        }
      `}</style>

      <nav className="taw-nav">
        <div className="taw-nav-inner">

          {/* Brand */}
          <Link to="/" className="taw-brand">
            <img src={tawsilaLogo} alt="Tawsila" style={{ width: 50, height: 50, objectFit: 'contain' }} />
            <div>
              <span className="taw-brand-text">TAWSILA</span>
              <span className="taw-brand-sub">Your Ride, Our Pride</span>
            </div>
          </Link>

          {/* Center links desktop */}
          {user && (
            <div className="taw-links">
              <Link to="/" className={`taw-link${isActive('/') ? ' active' : ''}`}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
                Accueil
              </Link>
              <Link to="/chat" className={`taw-link${isActive('/chat') ? ' active' : ''}`}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
                </svg>
                Chat
                {notifCount > 0 && (
                  <span style={{ background:"#EF4444", color:"#fff", borderRadius:"50%", width:"18px", height:"18px", fontSize:"10px", fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center", marginLeft:"4px", animation:"pop 0.3s" }}>
                    {notifCount > 9 ? "9+" : notifCount}
                  </span>
                )}
              </Link>
              <Link to="/my-reservations" className={`taw-link${isActive('/my-reservations') ? ' active' : ''}`}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
                </svg>
                Trajets
                {(unreadCount + tripNotifCount) > 0 && (
                  <span style={{ background:"#EF4444", color:"#fff", borderRadius:"50%", width:"18px", height:"18px", fontSize:"10px", fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center", marginLeft:"4px" }}>
                    {(unreadCount + tripNotifCount) > 9 ? "9+" : (unreadCount + tripNotifCount)}
                  </span>
                )}
              </Link>
            </div>
          )}

          {/* Right actions desktop */}
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
                    {avatarSrc ? <img src={avatarSrc} alt="avatar" className="taw-avatar" /> : <div className="taw-avatar-init">{initials || '?'}</div>}
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
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                      Mon profil
                    </Link>
                    <Link to="/support" className="taw-dd-item">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3H9a2 2 0 00-2 2v14a2 2 0 002 2h6a2 2 0 002-2V5a2 2 0 00-2-2z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                      Support
                    </Link>
                    <Link to="/settings" className="taw-dd-item">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
                      Paramètres
                    </Link>
                    <div className="taw-dd-sep" />
                    <button className="taw-dd-item danger" onClick={handleLogout}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                      Se déconnecter
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Hamburger */}
            <button className={`taw-hamburger${mobileOpen ? ' open' : ''}`} onClick={() => setMobileOpen(!mobileOpen)}>
              <span /><span /><span />
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <div className={`taw-mobile-menu${mobileOpen ? ' open' : ''}`}>
          {user ? (
            <>
              {/* User info */}
              <div className="taw-mobile-user">
                <div className="taw-avatar-wrap">
                  {avatarSrc ? <img src={avatarSrc} alt="avatar" className="taw-avatar" /> : <div className="taw-avatar-init">{initials || '?'}</div>}
                  <div className="taw-online" />
                </div>
                <div>
                  <div className="taw-mobile-name">{user.name}</div>
                  <div className="taw-mobile-email">{user.email}</div>
                </div>
              </div>

              {/* Links */}
              <Link to="/" className={`taw-mobile-link${isActive('/') ? ' active' : ''}`}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                Accueil
              </Link>
              <Link to="/chat" className={`taw-mobile-link${isActive('/chat') ? ' active' : ''}`}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
                Chat {notifCount > 0 && <span style={{ background:"#EF4444", color:"#fff", borderRadius:"50%", width:"18px", height:"18px", fontSize:"10px", fontWeight:700, display:"inline-flex", alignItems:"center", justifyContent:"center", marginLeft:"6px" }}>{notifCount > 9 ? "9+" : notifCount}</span>}
              </Link>
              <Link to="/my-reservations" className={`taw-mobile-link${isActive('/my-reservations') ? ' active' : ''}`}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                Trajets {(unreadCount + tripNotifCount) > 0 && <span style={{ background:"#EF4444", color:"#fff", borderRadius:"50%", width:"18px", height:"18px", fontSize:"10px", fontWeight:700, display:"inline-flex", alignItems:"center", justifyContent:"center", marginLeft:"6px" }}>{(unreadCount + tripNotifCount) > 9 ? "9+" : (unreadCount + tripNotifCount)}</span>}
              </Link>
              <Link to="/profile" className={`taw-mobile-link${isActive('/profile') ? ' active' : ''}`}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                Mon profil
              </Link>
              <Link to="/settings" className={`taw-mobile-link${isActive('/settings') ? ' active' : ''}`}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
                Paramètres
              </Link>
              <Link to="/support" className={`taw-mobile-link${isActive('/support') ? ' active' : ''}`}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                Support
              </Link>
              <button className="taw-mobile-logout" onClick={handleLogout}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                Se déconnecter
              </button>
            </>
          ) : (
            <div className="taw-mobile-auth">
              <Link to="/register" className="taw-btn-ghost" style={{ display:'block', textAlign:'center' }}>S'inscrire</Link>
              <Link to="/login" className="taw-btn-primary" style={{ display:'block', textAlign:'center' }}>Connexion</Link>
            </div>
          )}
        </div>
      </nav>
    </>
  );
};

export default NavBar;
