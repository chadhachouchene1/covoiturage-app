import { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const NavBar = () => {
  const { user, logoutUser } = useContext(AuthContext);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutUser();
    setMenuOpen(false);
    navigate('/login');
  };

  const avatarSrc = user?.image
    ? `http://localhost:5000${user.image}`
    : null;

  const initials = user
    ? `${user.name?.split(' ')[0]?.[0] || ''}${user.name?.split(' ')[1]?.[0] || ''}`.toUpperCase()
    : '';

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

        .nav-root {
          position: sticky;
          top: 0;
          z-index: 100;
          background: rgba(10, 6, 25, 0.85);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(167, 139, 250, 0.15);
          font-family: 'DM Sans', sans-serif;
        }

        .nav-inner {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 24px;
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .nav-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
        }

        .nav-brand-icon {
          width: 36px;
          height: 36px;
          background: linear-gradient(135deg, #7c3aed, #4f46e5);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          box-shadow: 0 0 16px rgba(124, 58, 237, 0.4);
        }

        .nav-brand-text {
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          font-size: 1.2rem;
          background: linear-gradient(135deg, #c4b5fd, #818cf8);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          letter-spacing: -0.5px;
        }

        .nav-links {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .nav-link {
          padding: 8px 16px;
          border-radius: 8px;
          color: #9ca3af;
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .nav-link:hover {
          color: #c4b5fd;
          background: rgba(167, 139, 250, 0.1);
        }

        .nav-link-primary {
          background: linear-gradient(135deg, #7c3aed, #4f46e5);
          color: #fff !important;
          padding: 8px 18px;
          border-radius: 8px;
          font-weight: 600;
          box-shadow: 0 4px 12px rgba(124, 58, 237, 0.3);
        }

        .nav-link-primary:hover {
          background: linear-gradient(135deg, #6d28d9, #4338ca) !important;
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(124, 58, 237, 0.4) !important;
        }

        .nav-divider {
          width: 1px;
          height: 20px;
          background: rgba(167, 139, 250, 0.2);
          margin: 0 8px;
        }

        /* User avatar dropdown */
        .user-area {
          position: relative;
        }

        .user-trigger {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 6px 12px 6px 6px;
          border-radius: 50px;
          border: 1px solid rgba(167, 139, 250, 0.2);
          background: rgba(255, 255, 255, 0.04);
          cursor: pointer;
          transition: all 0.2s;
        }

        .user-trigger:hover {
          border-color: rgba(167, 139, 250, 0.4);
          background: rgba(167, 139, 250, 0.08);
        }

        .user-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid rgba(167, 139, 250, 0.4);
        }

        .user-avatar-placeholder {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: linear-gradient(135deg, #7c3aed, #4f46e5);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 700;
          color: white;
          border: 2px solid rgba(167, 139, 250, 0.4);
          flex-shrink: 0;
        }

        .user-name {
          font-size: 14px;
          font-weight: 500;
          color: #e9d5ff;
          max-width: 120px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .user-chevron {
          color: #9ca3af;
          font-size: 10px;
          transition: transform 0.2s;
        }

        .user-chevron.open {
          transform: rotate(180deg);
        }

        .dropdown {
          position: absolute;
          top: calc(100% + 10px);
          right: 0;
          width: 220px;
          background: rgba(15, 10, 30, 0.98);
          border: 1px solid rgba(167, 139, 250, 0.2);
          border-radius: 14px;
          padding: 8px;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(20px);
          animation: dropIn 0.15s ease;
        }

        @keyframes dropIn {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .dropdown-header {
          padding: 10px 12px 14px;
          border-bottom: 1px solid rgba(167, 139, 250, 0.1);
          margin-bottom: 6px;
        }

        .dropdown-fullname {
          color: #f3f4f6;
          font-weight: 600;
          font-size: 14px;
        }

        .dropdown-email {
          color: #6b7280;
          font-size: 12px;
          margin-top: 2px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .dropdown-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 9px 12px;
          border-radius: 8px;
          color: #9ca3af;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.15s;
          text-decoration: none;
          border: none;
          background: none;
          width: 100%;
          text-align: left;
          font-family: 'DM Sans', sans-serif;
        }

        .dropdown-item:hover {
          color: #c4b5fd;
          background: rgba(167, 139, 250, 0.1);
        }

        .dropdown-item.danger {
          color: #f87171;
        }

        .dropdown-item.danger:hover {
          color: #fca5a5;
          background: rgba(239, 68, 68, 0.1);
        }

        .dropdown-sep {
          height: 1px;
          background: rgba(167, 139, 250, 0.1);
          margin: 6px 0;
        }

        .online-dot {
          width: 8px;
          height: 8px;
          background: #22c55e;
          border-radius: 50%;
          border: 2px solid rgba(15, 10, 30, 0.98);
          position: absolute;
          bottom: 0;
          right: 0;
        }

        .avatar-wrap {
          position: relative;
          flex-shrink: 0;
        }
      `}</style>

      <nav className="nav-root">
        <div className="nav-inner">
          {/* Brand */}
          <Link to="/" className="nav-brand">
            <div className="nav-brand-icon">🚗</div>
            <span className="nav-brand-text">Tawsila</span>
          </Link>

          {/* Right side */}
          <div className="nav-links">
            {!user ? (
              <>
                <Link to="/chat" className="nav-link">💬 Chat</Link>
                <div className="nav-divider" />
                <Link to="/register" className="nav-link">S'inscrire</Link>
                <Link to="/login" className="nav-link nav-link-primary">Connexion</Link>
              </>
            ) : (
              <>
                <Link to="/" className="nav-link">🏠 Accueil</Link>
                <Link to="/trips" className="nav-link">🗺️ Trajets</Link>
                <Link to="/chat" className="nav-link">💬 Chat</Link>
                <div className="nav-divider" />

                {/* User dropdown */}
                <div className="user-area">
                  <div className="user-trigger" onClick={() => setMenuOpen(!menuOpen)}>
                    <div className="avatar-wrap">
                      {avatarSrc ? (
                        <img src={avatarSrc} alt="avatar" className="user-avatar" />
                      ) : (
                        <div className="user-avatar-placeholder">{initials || '?'}</div>
                      )}
                      <div className="online-dot" />
                    </div>
                    <span className="user-name">{user.name}</span>
                    <span className={`user-chevron ${menuOpen ? 'open' : ''}`}>▼</span>
                  </div>

                  {menuOpen && (
                    <div className="dropdown">
                      <div className="dropdown-header">
                        <div className="dropdown-fullname">{user.name}</div>
                        <div className="dropdown-email">{user.email}</div>
                      </div>

                      <Link to="/profile" className="dropdown-item" onClick={() => setMenuOpen(false)}>
                        👤 Mon profil
                      </Link>
                      <Link to="/my-trips" className="dropdown-item" onClick={() => setMenuOpen(false)}>
                        🚗 Mes trajets
                      </Link>
                      <Link to="/reservations" className="dropdown-item" onClick={() => setMenuOpen(false)}>
                        🎫 Mes réservations
                      </Link>
                      <Link to="/settings" className="dropdown-item" onClick={() => setMenuOpen(false)}>
                        ⚙️ Paramètres
                      </Link>

                      <div className="dropdown-sep" />

                      <button className="dropdown-item danger" onClick={handleLogout}>
                        🚪 Se déconnecter
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </nav>
    </>
  );
};

export default NavBar;
