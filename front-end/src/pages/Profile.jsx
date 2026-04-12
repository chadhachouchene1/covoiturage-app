import { useContext, useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { TripContext } from "../context/TripContext";
import { baseUrl } from "../utils/services";
import "./Profile.css";

const baseImgUrl = "http://localhost:5000";

const statusConfig = {
  active:    { label: "Actif",     color: "#16A34A", bg: "#DCFCE7" },
  cancelled: { label: "Annulé",    color: "#DC2626", bg: "#FEE2E2" },
  completed: { label: "Complet",   color: "#1A56DB", bg: "#DBEAFE" },
};

export default function Profile() {
  const { userId } = useParams();
  const { user: currentUser } = useContext(AuthContext);
  const { cancelTrip } = useContext(TripContext);
  const navigate = useNavigate();

  const isOwnProfile = !userId || userId === currentUser?.id;

  const [profile, setProfile]   = useState(null);
  const [trips, setTrips]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [cancelMsg, setCancelMsg] = useState(null); // success or error message

  // Load profile + trips
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const token = localStorage.getItem("Token");
      const targetId = userId || currentUser?.id;

      try {
        // ── Fetch profile info ──────────────────────────────────────
        if (isOwnProfile) {
          setProfile(currentUser);
        } else {
          const res = await fetch(`${baseUrl}/users/find/${targetId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (!res.ok) { navigate("/"); return; }
          const data = await res.json();
          setProfile(data);
        }

        // ── FIX: Fetch ONLY this user's trips using ?driver= filter ──
        // Previously was fetching ALL trips without the driver filter
        const tRes = await fetch(`${baseUrl}/trips?driver=${targetId}`);
        const tData = await tRes.json();
        setTrips(Array.isArray(tData) ? tData : []);

      } catch {
        navigate("/");
      }
      setLoading(false);
    };
    load();
  }, [userId, currentUser?.id]);

  const handleCancelTrip = async (tripId) => {
    if (!window.confirm("Annuler ce trajet ? Tous les passagers seront notifiés.")) return;

    // Check for paid reservations before cancelling
    const token = localStorage.getItem("Token");
    try {
      const res = await fetch(`${baseUrl}/trips/${tripId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      const paidReservations = (data.reservations || []).filter(
        r => r.paymentStatus === "paid" && r.status !== "cancelled"
      );

      if (paidReservations.length > 0) {
        setCancelMsg({
          type: "error",
          text: `❌ Impossible d'annuler : ${paidReservations.length} passager(s) ont déjà payé pour ce trajet.`,
        });
        setTimeout(() => setCancelMsg(null), 5000);
        return;
      }
    } catch {
      // If we can't check, proceed with cancel
    }

    const result = await cancelTrip(tripId);
    if (result?.error) {
      setCancelMsg({ type: "error", text: "❌ " + result.message });
    } else {
      setCancelMsg({ type: "success", text: "✅ Trajet annulé. Les passagers ont été notifiés." });
      // Update local state
      setTrips(prev => prev.map(t => t._id === tripId ? { ...t, status: "cancelled" } : t));
    }
    setTimeout(() => setCancelMsg(null), 5000);
  };

  if (loading) return (
    <div className="profile-loading">
      <div className="profile-loading-spinner" />
      <p>Chargement du profil...</p>
    </div>
  );

  if (!profile) return (
    <div className="profile-loading"><p>Profil introuvable</p></div>
  );

  const avatarSrc      = profile.image ? `${baseImgUrl}${profile.image}` : null;
  const initials       = `${profile.firstName?.[0] || ""}${profile.lastName?.[0] || ""}`.toUpperCase();
  const fullName       = `${profile.firstName || ""} ${profile.lastName || ""}`.trim();
  const activeTrips    = trips.filter(t => t.status === "active").length;
  const completedTrips = trips.filter(t => t.status === "completed").length;

  return (
    <div className="profile-page">

      {/* ── Cover + Avatar ─────────────────────────────────────────── */}
      <div className="profile-cover">
        <div className="cover-bg" />
        <div className="cover-overlay" />
        <div className="cover-content">
          <div className="profile-avatar-wrap">
            {avatarSrc
              ? <img src={avatarSrc} alt={fullName} className="profile-avatar" />
              : <div className="profile-avatar-init">{initials || "?"}</div>}
            {isOwnProfile && <div className="avatar-online-dot" title="En ligne" />}
          </div>

          <div className="profile-info">
            <h1 className="profile-name">{fullName}</h1>
            <p className="profile-role">
              {profile.role === "admin" ? "👑 Administrateur" : "🚗 Membre Tawsila"}
            </p>
            {isOwnProfile && <p className="profile-email">✉️ {profile.email}</p>}
          </div>
        </div>

        {/* Stats bar */}
        <div className="profile-stats">
          {[
            { icon: "🚗", value: trips.length,    label: "Trajets publiés" },
            { icon: "✅", value: activeTrips,      label: "En cours" },
            { icon: "🏁", value: completedTrips,  label: "Complétés" },
          ].map(({ icon, value, label }) => (
            <div className="profile-stat" key={label}>
              <span className="stat-icon">{icon}</span>
              <strong className="stat-value">{value}</strong>
              <span className="stat-label">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Cancel feedback toast ───────────────────────────────────── */}
      {cancelMsg && (
        <div className={`profile-toast ${cancelMsg.type === "error" ? "profile-toast-error" : "profile-toast-success"}`}>
          {cancelMsg.text}
        </div>
      )}

      {/* ── Body ───────────────────────────────────────────────────── */}
      <div className="profile-body">

        {/* Left sidebar */}
        <aside className="profile-sidebar">
          <div className="sidebar-card">
            <h3 className="sidebar-title">À propos</h3>
            <div className="sidebar-item">
              <span>👤</span>
              <span>{fullName}</span>
            </div>
            {isOwnProfile && (
              <>
                <div className="sidebar-item">
                  <span>📧</span>
                  <span>{profile.email}</span>
                </div>
                <div className="sidebar-item">
                  <span>📞</span>
                  <span>{profile.phone || "Non renseigné"}</span>
                </div>
                <div className="sidebar-item">
                  <span>🎂</span>
                  <span>
                    {profile.dateOfBirth
                      ? new Date(profile.dateOfBirth).toLocaleDateString("fr-FR")
                      : "Non renseigné"}
                  </span>
                </div>
                <div className="sidebar-item">
                  <span>📍</span>
                  <span>{profile.birthPlace || "Non renseigné"}</span>
                </div>
              </>
            )}
            <div className="sidebar-item">
              <span>⭐</span>
              <span>{trips.length} trajet{trips.length !== 1 ? "s" : ""} publiés</span>
            </div>
          </div>

          {isOwnProfile && (
            <div className="sidebar-card">
              <h3 className="sidebar-title">Actions rapides</h3>
              <button className="quick-action" onClick={() => navigate("/publish-trip")}>
                🚗 Publier un trajet
              </button>
              <button className="quick-action" onClick={() => navigate("/my-reservations")}>
                🎫 Mes réservations
              </button>
              <button className="quick-action" onClick={() => navigate("/")}>
                🔍 Chercher un trajet
              </button>
            </div>
          )}
        </aside>

        {/* Main content */}
        <main className="profile-main">
          <div className="profile-tabs">
            <button className="tab-btn tab-active">
              🚗 Publications ({trips.length})
            </button>
          </div>

          {trips.length === 0 ? (
            <div className="empty-profile">
              <span>🚗</span>
              <p>{isOwnProfile ? "Vous n'avez pas encore publié de trajet." : "Aucun trajet publié."}</p>
              {isOwnProfile && (
                <button className="btn-publish-first" onClick={() => navigate("/publish-trip")}>
                  Publier mon premier trajet
                </button>
              )}
            </div>
          ) : (
            <div className="profile-trips-list">
              {trips.map((trip) => (
                <div key={trip._id} className="profile-trip-card">
                  {trip.carImage
                    ? <img src={`${baseImgUrl}${trip.carImage}`} alt="car" className="ptc-car-img" />
                    : <div className="ptc-car-placeholder">🚗</div>}

                  <div className="ptc-body">
                    <div className="ptc-route">
                      <span className="ptc-city">{trip.departure}</span>
                      <span className="ptc-arrow">→</span>
                      <span className="ptc-city">{trip.destination}</span>
                    </div>
                    <div className="ptc-meta">
                      <span>📅 {new Date(trip.date).toLocaleDateString("fr-FR", { weekday:"short", day:"numeric", month:"short" })}</span>
                      <span>⏰ {trip.time}</span>
                      <span>💰 {trip.price} DT</span>
                      <span>🪑 {trip.availableSeats}/{trip.seats} places</span>
                      {trip.luggage && <span>🧳 Bagages OK</span>}
                    </div>
                    {trip.description && (
                      <p className="ptc-desc">"{trip.description}"</p>
                    )}
                  </div>

                  <div className="ptc-right">
                    <span
                      className="ptc-status"
                      style={{
                        background: statusConfig[trip.status]?.bg || "#F1F5F9",
                        color: statusConfig[trip.status]?.color || "#64748B",
                      }}
                    >
                      {statusConfig[trip.status]?.label || trip.status}
                    </span>

                    <button
                      className="ptc-detail-btn"
                      onClick={() => navigate(`/trips/${trip._id}`)}
                    >
                      Voir détails
                    </button>

                    {/* FIX: Cancel button only if own profile + active + no paid passengers */}
                    {isOwnProfile && trip.status === "active" && (
                      <button
                        className="ptc-cancel-btn"
                        onClick={() => handleCancelTrip(trip._id)}
                      >
                        Annuler
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
