import { useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { TripContext } from "../context/TripContext";
import { baseUrl } from "../utils/services";
import "./Profile.css";
import ImageLightbox from "../components/ImageLightbox";



const statusConfig = {
  active:    { label: "Actif",   color: "#16A34A", bg: "#DCFCE7" },
  cancelled: { label: "Annulé",  color: "#DC2626", bg: "#FEE2E2" },
  completed: { label: "Complet", color: "#1A56DB", bg: "#DBEAFE" },
};

const StarRating = ({ value, onChange, readonly = false, size = 22 }) => {
  const [hovered, setHovered] = useState(0);
  return (
    <div style={{ display: "flex", gap: 2 }}>
      {[1,2,3,4,5].map(s => (
        <span key={s}
          style={{ fontSize: size, cursor: readonly ? "default" : "pointer",
            color: s <= (hovered || value) ? "#F59E0B" : "#E2E8F0",
            transition: "color 0.1s, transform 0.1s",
            transform: !readonly && s <= (hovered || value) ? "scale(1.15)" : "scale(1)",
            display: "inline-block" }}
          onMouseEnter={() => !readonly && setHovered(s)}
          onMouseLeave={() => !readonly && setHovered(0)}
          onClick={() => !readonly && onChange && onChange(s)}
        >★</span>
      ))}
    </div>
  );
};

const RatingBar = ({ star, count, total }) => {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
      <span style={{ fontSize: 12, color: "#64748B", width: 10 }}>{star}</span>
      <span style={{ fontSize: 13, color: "#F59E0B" }}>★</span>
      <div style={{ flex: 1, height: 7, background: "#E2E8F0", borderRadius: 4, overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: "#F59E0B", borderRadius: 4, transition: "width 0.5s" }} />
      </div>
      <span style={{ fontSize: 12, color: "#94A3B8", width: 20 }}>{count}</span>
    </div>
  );
};

const RatingsSection = ({ targetUserId, currentUserId, isOwnProfile }) => {
  const [ratings, setRatings]   = useState([]);
  const [avg, setAvg]           = useState(0);
  const [count, setCount]       = useState(0);
  const [dist, setDist]         = useState({ 1:0,2:0,3:0,4:0,5:0 });
  const [myStars, setMyStars]   = useState(0);
  const [myComment, setMyComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted]   = useState(false);
  const [showForm, setShowForm]     = useState(false);

  const load = async () => {
    try {
      const res  = await fetch(`${baseUrl}/ratings/${targetUserId}`);
      const data = await res.json();
      setRatings(data.ratings || []);
      setAvg(data.avg || 0);
      setCount(data.count || 0);
      setDist(data.distribution || { 1:0,2:0,3:0,4:0,5:0 });
    } catch {}
  };

  useEffect(() => { if (targetUserId) load(); }, [targetUserId, submitted]);

  const handleSubmit = async () => {
    if (!myStars) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${baseUrl}/ratings`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("Token")}` },
        body: JSON.stringify({ reviewedId: targetUserId, stars: myStars, comment: myComment }),
      });
      if (res.ok) { setSubmitted(true); setShowForm(false); setMyStars(0); setMyComment(""); }
    } catch {}
    setSubmitting(false);
  };

  return (
    <div className="ratings-section">
      <div className="ratings-summary">
        <div className="ratings-score-block">
          <div className="ratings-big-score">{avg > 0 ? avg.toFixed(1) : "—"}</div>
          <StarRating value={Math.round(avg)} readonly size={20} />
          <div className="ratings-count-label">{count} avis</div>
        </div>
        <div className="ratings-bars">
          {[5,4,3,2,1].map(s => (
            <RatingBar key={s} star={s} count={dist[s] || 0} total={count} />
          ))}
        </div>
      </div>

      {!isOwnProfile && currentUserId && (
        <div className="ratings-leave">
          {submitted ? (
            <div className="ratings-thanks">✅ Merci pour votre avis !</div>
          ) : showForm ? (
            <div className="ratings-form">
              <p style={{ fontSize: 13, fontWeight: 600, color: "#0C1220", marginBottom: 8 }}>Votre note</p>
              <StarRating value={myStars} onChange={setMyStars} size={28} />
              <textarea placeholder="Commentaire (facultatif)..." value={myComment}
                onChange={e => setMyComment(e.target.value)}
                className="ratings-textarea" rows={2} maxLength={200} />
              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                <button className="ratings-submit-btn" onClick={handleSubmit} disabled={!myStars || submitting}>
                  {submitting ? "Envoi..." : "Envoyer"}
                </button>
                <button className="ratings-cancel-btn" onClick={() => setShowForm(false)}>Annuler</button>
              </div>
            </div>
          ) : (
            <button className="ratings-open-btn" onClick={() => setShowForm(true)}>⭐ Donner un avis</button>
          )}
        </div>
      )}

      {ratings.length > 0 ? (
        <div className="ratings-list">
          {ratings.map(r => (
            <div key={r._id} className="rating-item">
              <div className="rating-item-header">
                <div className="rating-item-avatar">
                  {r.reviewer?.image
                    ?<img src={r.reviewer.image} alt="" style={{ width:"100%",height:"100%",objectFit:"cover" }} />
                    : <div className="rating-item-init">{r.reviewer?.firstName?.[0]}{r.reviewer?.lastName?.[0]}</div>}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: "#0C1220" }}>
                    {r.reviewer?.firstName} {r.reviewer?.lastName}
                  </div>
                  <StarRating value={r.stars} readonly size={14} />
                </div>
                <span style={{ fontSize: 11, color: "#94A3B8" }}>
                  {new Date(r.createdAt).toLocaleDateString("fr-FR", { day:"numeric", month:"short" })}
                </span>
              </div>
              {r.comment && <p className="rating-item-comment">"{r.comment}"</p>}
            </div>
          ))}
        </div>
      ) : (
        <div className="ratings-empty"><span>⭐</span><p>Aucun avis pour le moment</p></div>
      )}
    </div>
  );
};

export default function Profile() {
  const { userId } = useParams();
  const { user: currentUser } = useContext(AuthContext);
  const { cancelTrip } = useContext(TripContext);
  const navigate = useNavigate();

  const isOwnProfile = !userId || userId === currentUser?.id;
  const [profile, setProfile]     = useState(null);
  const [trips, setTrips]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [cancelMsg, setCancelMsg] = useState(null);
  const [activeTab, setActiveTab] = useState("trips");
  const [lightboxSrc, setLightboxSrc] = useState(null);


  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const token    = localStorage.getItem("Token");
      const targetId = userId || currentUser?.id;
      try {
        const res = await fetch(`${baseUrl}/users/find/${targetId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) { navigate("/"); return; }
        setProfile(await res.json());
        const tRes  = await fetch(`${baseUrl}/trips?driver=${targetId}&includeAllStatuses=true`);
        const tData = await tRes.json();
        setTrips(Array.isArray(tData) ? tData : []);
      } catch { navigate("/"); }
      setLoading(false);
    };
    load();
  }, [userId, currentUser?.id]);

  const handleCancelTrip = async (tripId) => {
    if (!window.confirm("Annuler ce trajet ?")) return;
    const token = localStorage.getItem("Token");
    try {
      const res  = await fetch(`${baseUrl}/trips/${tripId}`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      const paid = (data.reservations || []).filter(r => r.paymentStatus === "paid" && r.status !== "cancelled");
      if (paid.length > 0) {
        setCancelMsg({ type: "error", text: `❌ Impossible : ${paid.length} passager(s) ont déjà payé.` });
        setTimeout(() => setCancelMsg(null), 5000); return;
      }
    } catch {}
    const result = await cancelTrip(tripId);
    if (result?.error) setCancelMsg({ type: "error", text: "❌ " + result.message });
    else {
      setCancelMsg({ type: "success", text: "✅ Trajet annulé. Les passagers ont été notifiés." });
      setTrips(prev => prev.map(t => t._id === tripId ? { ...t, status: "cancelled" } : t));
    }
    setTimeout(() => setCancelMsg(null), 5000);
  };

  if (loading) return <div className="profile-loading"><div className="profile-loading-spinner" /><p>Chargement...</p></div>;
  if (!profile) return <div className="profile-loading"><p>Profil introuvable</p></div>;

  const avatarSrc = profile.image || null;
  const initials       = `${profile.firstName?.[0] || ""}${profile.lastName?.[0] || ""}`.toUpperCase();
  const fullName       = `${profile.firstName || ""} ${profile.lastName || ""}`.trim();
  const activeTrips    = trips.filter(t => t.status === "active").length;
  const completedTrips = trips.filter(t => t.status === "completed").length;
  const targetId       = userId || currentUser?.id;

  return (
    <div className="profile-page">
      <div className="profile-cover">
        <div className="cover-bg" /><div className="cover-overlay" />
        <div className="cover-content">
          <div className="profile-avatar-wrap">
            {avatarSrc ? (
  <img
    src={avatarSrc}
    alt={fullName}
    className="profile-avatar"
    onClick={() => setLightboxSrc(avatarSrc)}
    style={{ cursor: "zoom-in" }}
  />
) : (
  <div className="profile-avatar-init">{initials || "?"}</div>
)}
            {isOwnProfile && <div className="avatar-online-dot" />}
          </div>
          <div className="profile-info">
            <h1 className="profile-name">{fullName}</h1>
            <p className="profile-role">{profile.role === "admin" ? "👑 Administrateur" : "🚗 Membre Tawsila"}</p>
            {isOwnProfile && <p className="profile-email">✉️ {profile.email}</p>}
          </div>
          {!isOwnProfile && currentUser && (
            <button className="btn-contact" onClick={() => navigate(`/chat?with=${targetId}`)}>💬 Contacter</button>
          )}
        </div>
        <div className="profile-stats">
          {[{ icon:"🚗",value:trips.length,label:"Trajets publiés" },{ icon:"✅",value:activeTrips,label:"En cours" },{ icon:"🏁",value:completedTrips,label:"Complétés" }]
            .map(({ icon, value, label }) => (
              <div className="profile-stat" key={label}>
                <span className="stat-icon">{icon}</span>
                <strong className="stat-value">{value}</strong>
                <span className="stat-label">{label}</span>
              </div>
            ))}
        </div>
      </div>

      {cancelMsg && (
        <div className={`profile-toast ${cancelMsg.type === "error" ? "profile-toast-error" : "profile-toast-success"}`}>
          {cancelMsg.text}
        </div>
      )}

      <div className="profile-body">
        <aside className="profile-sidebar">
          <div className="sidebar-card">
            <h3 className="sidebar-title">À propos</h3>
            <div className="sidebar-item"><span>👤</span><span>{fullName || "Non renseigné"}</span></div>
            <div className="sidebar-item"><span>📧</span><span>{profile.email}</span></div>
             <div className="sidebar-item"><span>🎂</span><span>{profile.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString("fr-FR") : "Non renseigné"}</span></div>
                <div className="sidebar-item"><span>📍</span><span>{profile.birthPlace || "Non renseigné"}</span></div>
            {isOwnProfile && (
              <>
                <div className="sidebar-item"><span>📧</span><span>{profile.email}</span></div>
                <div className="sidebar-item"><span>📞</span><span>{profile.phone || "Non renseigné"}</span></div>
                <div className="sidebar-item"><span>🎂</span><span>{profile.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString("fr-FR") : "Non renseigné"}</span></div>
                <div className="sidebar-item"><span>📍</span><span>{profile.birthPlace || "Non renseigné"}</span></div>
              </>
            )}
            <div className="sidebar-item"><span>⭐</span><span>{trips.length} trajet{trips.length !== 1 ? "s" : ""} publiés</span></div>
          </div>
          {isOwnProfile && (
            <div className="sidebar-card">
              <h3 className="sidebar-title">Actions rapides</h3>
              <button className="quick-action" onClick={() => navigate("/publish-trip")}>🚗 Publier un trajet</button>
              <button className="quick-action" onClick={() => navigate("/my-reservations")}>🎫 Mes réservations</button>
              <button className="quick-action" onClick={() => navigate("/")}>🔍 Chercher un trajet</button>
              <button className="quick-action" onClick={() => navigate("/chat")}>💬 Mes messages</button>
            </div>
          )}
          {!isOwnProfile && currentUser && (
            <div className="sidebar-card">
              <button className="quick-action"
                style={{ background:"#1A56DB",color:"#fff",border:"none",borderRadius:"10px",padding:"12px",textAlign:"center",fontWeight:700 }}
                onClick={() => navigate(`/chat?with=${targetId}`)}>
                💬 Envoyer un message
              </button>
            </div>
          )}
        </aside>

        <main className="profile-main">
          <div className="profile-tabs">
            <button className={`tab-btn ${activeTab === "trips" ? "tab-active" : ""}`} onClick={() => setActiveTab("trips")}>
              🚗 Publications ({trips.length})
            </button>
            <button className={`tab-btn ${activeTab === "ratings" ? "tab-active" : ""}`} onClick={() => setActiveTab("ratings")}>
              ⭐ Avis
            </button>
          </div>

          {activeTab === "trips" && (
            trips.length === 0 ? (
              <div className="empty-profile">
                <span>🚗</span>
                <p>{isOwnProfile ? "Vous n'avez pas encore publié de trajet." : "Aucun trajet publié."}</p>
                {isOwnProfile && <button className="btn-publish-first" onClick={() => navigate("/publish-trip")}>Publier mon premier trajet</button>}
              </div>
            ) : (
              <div className="profile-trips-list">
                {trips.map(trip => (
                  <div key={trip._id} className="profile-trip-card">
                    {trip.carImage ? (
  <img
    src={trip.carImage}
    alt="car"
    className="ptc-car-img"
    onClick={() => setLightboxSrc(trip.carImage)}
    style={{ cursor: "zoom-in" }}
  />
) : (
  <div className="ptc-car-placeholder">🚗</div>
)}
                    <div className="ptc-body">
                      <div className="ptc-route">
                        <span className="ptc-city">{trip.departure}</span>
                        <span className="ptc-arrow">→</span>
                        <span className="ptc-city">{trip.destination}</span>
                      </div>
                      <div className="ptc-meta">
                        <span>📅 {new Date(trip.date).toLocaleDateString("fr-FR", { weekday:"short",day:"numeric",month:"short" })}</span>
                        <span>⏰ {trip.time}</span>
                        <span>💰 {trip.price} DT</span>
                        <span>🪑 {trip.availableSeats}/{trip.seats} places</span>
                        {trip.luggage && <span>🧳 Bagages OK</span>}
                      </div>
                      {trip.description && <p className="ptc-desc">"{trip.description}"</p>}
                    </div>
                    <div className="ptc-right">
                      <span className="ptc-status" style={{ background: statusConfig[trip.status]?.bg || "#F1F5F9", color: statusConfig[trip.status]?.color || "#64748B" }}>
                        {statusConfig[trip.status]?.label || trip.status}
                      </span>
                      <button className="ptc-detail-btn" onClick={() => navigate(`/trips/${trip._id}`)}>Voir détails</button>
                      {isOwnProfile && trip.status === "active" && (
                        <button className="ptc-cancel-btn" onClick={() => handleCancelTrip(trip._id)}>Annuler</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {activeTab === "ratings" && (
            <RatingsSection targetUserId={targetId} currentUserId={currentUser?.id} isOwnProfile={isOwnProfile} />
          )}
        </main>
      </div>
       {lightboxSrc && (
        <ImageLightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />
      )}


    </div>
  );
}
