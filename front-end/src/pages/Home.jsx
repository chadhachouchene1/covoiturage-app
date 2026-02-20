import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Home = () => {
  const { user } = useContext(AuthContext);

  const avatarSrc = user?.image
    ? `http://localhost:5000${user.image}`
    : null;

  const initials = user
    ? `${user.name?.split(' ')[0]?.[0] || ''}${user.name?.split(' ')[1]?.[0] || ''}`.toUpperCase()
    : '';

  const stats = [
    { icon: '🚗', value: '2 400+', label: 'Trajets par mois' },
    { icon: '👥', value: '1 800+', label: 'Membres actifs' },
    { icon: '💰', value: '60%', label: "d'économies" },
    { icon: '🌱', value: '12T', label: 'CO₂ économisé' },
  ];

  const quickActions = [
    { icon: '➕', label: 'Proposer un trajet', to: '/trips/new', color: '#7c3aed' },
    { icon: '🔍', label: 'Chercher un trajet', to: '/trips', color: '#4f46e5' },
    { icon: '🎫', label: 'Mes réservations', to: '/reservations', color: '#6d28d9' },
    { icon: '💬', label: 'Messages', to: '/chat', color: '#5b21b6' },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

        .home-root {
          min-height: 100vh;
          background: linear-gradient(135deg, #0f0a1e 0%, #1a0f3a 50%, #0d1b2a 100%);
          font-family: 'DM Sans', sans-serif;
          color: #f3f4f6;
        }

        .home-content {
          max-width: 1100px;
          margin: 0 auto;
          padding: 40px 24px 80px;
        }

        /* ── Welcome banner ── */
        .welcome-banner {
          background: linear-gradient(135deg, rgba(124,58,237,0.2), rgba(79,70,229,0.15));
          border: 1px solid rgba(167,139,250,0.2);
          border-radius: 24px;
          padding: 36px 40px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 40px;
          position: relative;
          overflow: hidden;
        }

        .welcome-banner::before {
          content: '';
          position: absolute;
          top: -60px; right: -60px;
          width: 200px; height: 200px;
          background: radial-gradient(circle, rgba(124,58,237,0.3), transparent 70%);
          pointer-events: none;
        }

        .welcome-left { display: flex; align-items: center; gap: 20px; }

        .welcome-avatar {
          width: 72px; height: 72px;
          border-radius: 50%;
          object-fit: cover;
          border: 3px solid rgba(167,139,250,0.5);
          box-shadow: 0 0 20px rgba(124,58,237,0.3);
        }

        .welcome-avatar-placeholder {
          width: 72px; height: 72px;
          border-radius: 50%;
          background: linear-gradient(135deg, #7c3aed, #4f46e5);
          display: flex; align-items: center; justify-content: center;
          font-size: 26px; font-weight: 800; color: white;
          border: 3px solid rgba(167,139,250,0.5);
          box-shadow: 0 0 20px rgba(124,58,237,0.3);
          flex-shrink: 0;
        }

        .welcome-text h1 {
          font-family: 'Syne', sans-serif;
          font-size: 1.8rem;
          font-weight: 800;
          margin: 0 0 6px;
          background: linear-gradient(135deg, #f3f4f6, #c4b5fd);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .welcome-text p {
          color: #9ca3af;
          margin: 0;
          font-size: 15px;
        }

        .welcome-badge {
          background: rgba(34,197,94,0.15);
          border: 1px solid rgba(34,197,94,0.3);
          border-radius: 50px;
          padding: 6px 16px;
          color: #86efac;
          font-size: 13px;
          font-weight: 600;
          display: flex; align-items: center; gap: 6px;
          flex-shrink: 0;
        }

        /* ── Stats row ── */
        .stats-row {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 40px;
        }

        .stat-card {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(167,139,250,0.15);
          border-radius: 16px;
          padding: 20px;
          text-align: center;
          transition: border-color 0.2s, transform 0.2s;
        }

        .stat-card:hover {
          border-color: rgba(167,139,250,0.35);
          transform: translateY(-2px);
        }

        .stat-icon { font-size: 24px; margin-bottom: 8px; }
        .stat-value {
          font-family: 'Syne', sans-serif;
          font-size: 1.6rem;
          font-weight: 800;
          color: #c4b5fd;
        }
        .stat-label { color: #6b7280; font-size: 12px; margin-top: 2px; }

        /* ── Section title ── */
        .section-title {
          font-family: 'Syne', sans-serif;
          font-size: 1.1rem;
          font-weight: 700;
          color: #e9d5ff;
          margin: 0 0 16px;
          display: flex; align-items: center; gap: 8px;
        }

        .section-title::after {
          content: '';
          flex: 1;
          height: 1px;
          background: rgba(167,139,250,0.15);
        }

        /* ── Quick actions ── */
        .actions-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 40px;
        }

        .action-card {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(167,139,250,0.15);
          border-radius: 16px;
          padding: 24px 16px;
          text-align: center;
          text-decoration: none;
          cursor: pointer;
          transition: all 0.25s;
          display: flex; flex-direction: column; align-items: center; gap: 12px;
        }

        .action-card:hover {
          background: rgba(124,58,237,0.12);
          border-color: rgba(167,139,250,0.4);
          transform: translateY(-3px);
          box-shadow: 0 12px 30px rgba(0,0,0,0.3);
        }

        .action-icon {
          width: 52px; height: 52px;
          border-radius: 14px;
          display: flex; align-items: center; justify-content: center;
          font-size: 22px;
        }

        .action-label {
          color: #d1d5db;
          font-size: 13px;
          font-weight: 500;
          line-height: 1.3;
        }

        /* ── Recent trips placeholder ── */
        .trips-empty {
          background: rgba(255,255,255,0.03);
          border: 1px dashed rgba(167,139,250,0.2);
          border-radius: 20px;
          padding: 60px 24px;
          text-align: center;
        }

        .trips-empty-icon { font-size: 48px; margin-bottom: 16px; }
        .trips-empty h3 { color: #9ca3af; font-size: 16px; margin: 0 0 8px; font-weight: 500; }
        .trips-empty p { color: #6b7280; font-size: 14px; margin: 0 0 24px; }

        .btn-primary {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 12px 24px;
          background: linear-gradient(135deg, #7c3aed, #4f46e5);
          color: white;
          border-radius: 12px;
          text-decoration: none;
          font-weight: 600;
          font-size: 14px;
          box-shadow: 0 4px 16px rgba(124,58,237,0.35);
          transition: all 0.2s;
        }

        .btn-primary:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(124,58,237,0.5);
        }

        @media (max-width: 768px) {
          .stats-row, .actions-grid { grid-template-columns: repeat(2, 1fr); }
          .welcome-banner { flex-direction: column; gap: 20px; text-align: center; }
          .welcome-left { flex-direction: column; }
        }
      `}</style>

      <div className="home-root">
        <div className="home-content">

          {/* ── Welcome Banner ── */}
          <div className="welcome-banner">
            <div className="welcome-left">
              {avatarSrc ? (
                <img src={avatarSrc} alt="avatar" className="welcome-avatar" />
              ) : (
                <div className="welcome-avatar-placeholder">{initials || '?'}</div>
              )}
              <div className="welcome-text">
                <h1>Bonjour, {user?.name?.split(' ')[0]} 👋</h1>
                <p>Prêt à partager la route aujourd'hui ?</p>
              </div>
            </div>
            <div className="welcome-badge">
              <span>🟢</span> En ligne
            </div>
          </div>

          {/* ── Stats ── */}
          <p className="section-title">📊 La plateforme en chiffres</p>
          <div className="stats-row">
            {stats.map((s) => (
              <div key={s.label} className="stat-card">
                <div className="stat-icon">{s.icon}</div>
                <div className="stat-value">{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>

          {/* ── Quick Actions ── */}
          <p className="section-title">⚡ Actions rapides</p>
          <div className="actions-grid">
            {quickActions.map((a) => (
              <Link key={a.label} to={a.to} className="action-card">
                <div className="action-icon" style={{ background: `${a.color}25` }}>
                  {a.icon}
                </div>
                <span className="action-label">{a.label}</span>
              </Link>
            ))}
          </div>

          {/* ── Recent trips ── */}
          <p className="section-title">🕐 Trajets récents</p>
          <div className="trips-empty">
            <div className="trips-empty-icon">🗺️</div>
            <h3>Aucun trajet pour le moment</h3>
            <p>Proposez votre premier trajet ou trouvez-en un près de chez vous</p>
            <Link to="/trips/new" className="btn-primary">
              ➕ Proposer un trajet
            </Link>
          </div>

        </div>
      </div>
    </>
  );
};

export default Home;
