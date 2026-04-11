import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { TripContext } from "../context/TripContext";
import { AuthContext } from "../context/AuthContext";
import "./Home.css";

const baseImgUrl = "http://localhost:5000";

const TripCard = ({ trip, onReserve }) => {
  const { user } = useContext(AuthContext);
  const isDriver = user?.id === trip.driver?._id;
  const driverAvatar = trip.driver?.image
    ? `${baseImgUrl}${trip.driver.image}`
    : null;
  const carImg = trip.carImage ? `${baseImgUrl}${trip.carImage}` : null;
  const formattedDate = new Date(trip.date).toLocaleDateString("fr-FR", {
    weekday: "short", day: "numeric", month: "short",
  });

  return (
    <div className="trip-card">
      {/* Car image header */}
      <div className="trip-card-img">
        {carImg
          ? <img src={carImg} alt="voiture" />
          : <div className="trip-card-img-placeholder">🚗</div>}
        <div className="trip-card-badge">
          {trip.availableSeats > 0
            ? <span className="badge-green">{trip.availableSeats} place{trip.availableSeats > 1 ? "s" : ""}</span>
            : <span className="badge-red">Complet</span>}
        </div>
      </div>

      <div className="trip-card-body">
        {/* Route */}
        <div className="trip-route">
          <div className="trip-route-point">
            <span className="route-dot dot-blue" />
            <span className="route-city">{trip.departure}</span>
          </div>
          <div className="route-line" />
          <div className="trip-route-point">
            <span className="route-dot dot-amber" />
            <span className="route-city">{trip.destination}</span>
          </div>
        </div>

        {/* Info row */}
        <div className="trip-info-row">
          <span className="trip-info-item">📅 {formattedDate}</span>
          <span className="trip-info-item">⏰ {trip.time}</span>
          <span className="trip-info-item">{trip.luggage ? "🧳 Bagages OK" : "🚫 Sans bagages"}</span>
        </div>

        {trip.description && (
          <p className="trip-description">"{trip.description}"</p>
        )}

        {/* Footer */}
        <div className="trip-card-footer">
          <div className="trip-driver">
            {driverAvatar
              ? <img src={driverAvatar} alt="driver" className="driver-avatar" />
              : <div className="driver-avatar-init">
                  {trip.driver?.firstName?.[0]}{trip.driver?.lastName?.[0]}
                </div>}
            <span className="driver-name">
              {trip.driver?.firstName} {trip.driver?.lastName}
            </span>
          </div>
          <div className="trip-price-action">
            <span className="trip-price">{trip.price} <small>DT</small></span>
            {!isDriver && trip.availableSeats > 0 && user && (
              <button className="btn-reserve" onClick={() => onReserve(trip)}>
                Réserver
              </button>
            )}
            {!user && (
              <span className="trip-login-hint">Connectez-vous pour réserver</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Modal réservation ────────────────────────────────────────────────────────
const ReserveModal = ({ trip, onClose, onConfirm }) => {
  const [seats, setSeats] = useState(1);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleConfirm = async () => {
    setLoading(true);
    setError(null);
    const result = await onConfirm(trip._id, seats, message);
    setLoading(false);
    if (result.error) setError(result.message);
    else onClose(true);
  };

  return (
    <div className="modal-overlay" onClick={() => onClose(false)}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={() => onClose(false)}>✕</button>
        <h2 className="modal-title">Réserver ce trajet</h2>

        <div className="modal-route">
          <span className="modal-city">{trip.departure}</span>
          <span className="modal-arrow">→</span>
          <span className="modal-city">{trip.destination}</span>
        </div>

        <div className="modal-details">
          <span>📅 {new Date(trip.date).toLocaleDateString("fr-FR", { weekday:"long", day:"numeric", month:"long" })}</span>
          <span>⏰ {trip.time}</span>
          <span>💰 {trip.price} DT / place</span>
        </div>

        <div className="modal-field">
          <label>Nombre de places</label>
          <div className="seats-selector">
            <button onClick={() => setSeats(Math.max(1, seats - 1))}>−</button>
            <span>{seats}</span>
            <button onClick={() => setSeats(Math.min(trip.availableSeats, seats + 1))}>+</button>
          </div>
          <p className="seats-total">Total : <strong>{seats * trip.price} DT</strong></p>
        </div>

        <div className="modal-field">
          <label>Message au conducteur <span style={{ color: "#94a3b8" }}>(facultatif)</span></label>
          <textarea
            className="modal-textarea"
            placeholder="Ex: Je serai au point de départ à l'heure, j'ai un petit sac..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
          />
        </div>

        {error && <div className="modal-error">⚠️ {error}</div>}

        <button className="btn-confirm" onClick={handleConfirm} disabled={loading}>
          {loading ? "Envoi en cours..." : `Confirmer la réservation — ${seats * trip.price} DT`}
        </button>
      </div>
    </div>
  );
};

// ── Page principale ──────────────────────────────────────────────────────────
export default function Home() {
  const { trips, loading, fetchTrips, createReservation } = useContext(TripContext);
  const navigate = useNavigate();

  const [filters, setFilters] = useState({ departure: "", destination: "", date: "" });
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  useEffect(() => { fetchTrips(); }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const clean = Object.fromEntries(Object.entries(filters).filter(([, v]) => v));
    fetchTrips(clean);
  };

  const handleReserve = (trip) => setSelectedTrip(trip);

  const handleModalClose = (success) => {
    setSelectedTrip(null);
    if (success) {
      setSuccessMsg("Réservation envoyée ! Le conducteur va vous répondre par email. ✅");
      setTimeout(() => setSuccessMsg(null), 5000);
    }
  };

  return (
    <div className="home-page">

      {/* ── Hero / Search ─────────────────────────────────────────────── */}
      <div className="home-hero">
        <div className="hero-bg" />
        <div className="hero-overlay" />
        <div className="hero-content">
          <h1 className="hero-title">
            Où allez-vous <span>aujourd'hui</span> ?
          </h1>
          <p className="hero-sub">Des centaines de trajets disponibles en Tunisie</p>

          <form className="search-bar" onSubmit={handleSearch}>
            <div className="search-field">
              <span className="search-icon">📍</span>
              <input
                placeholder="Départ (ex: Tunis)"
                value={filters.departure}
                onChange={(e) => setFilters({ ...filters, departure: e.target.value })}
              />
            </div>
            <div className="search-divider" />
            <div className="search-field">
              <span className="search-icon">🎯</span>
              <input
                placeholder="Destination (ex: Sfax)"
                value={filters.destination}
                onChange={(e) => setFilters({ ...filters, destination: e.target.value })}
              />
            </div>
            <div className="search-divider" />
            <div className="search-field">
              <span className="search-icon">📅</span>
              <input
                type="date"
                value={filters.date}
                onChange={(e) => setFilters({ ...filters, date: e.target.value })}
              />
            </div>
            <button type="submit" className="search-btn">Rechercher</button>
          </form>
        </div>
      </div>

      {/* ── Stats bar ─────────────────────────────────────────────────── */}
      <div className="stats-bar">
        {[["🚗", trips.length, "Trajets disponibles"],
          ["👥", "1 900+", "Membres actifs"],
          ["📍", "24+", "Villes couvertes"]].map(([e, n, l]) => (
          <div className="stat-item" key={l}>
            <span className="stat-emoji">{e}</span>
            <strong className="stat-num">{n}</strong>
            <span className="stat-label">{l}</span>
          </div>
        ))}
        <button className="btn-post-trip" onClick={() => navigate("/publish-trip")}>
          + Publier un trajet
        </button>
      </div>

      {/* ── Success toast ─────────────────────────────────────────────── */}
      {successMsg && (
        <div className="success-toast">{successMsg}</div>
      )}

      {/* ── Trips grid ────────────────────────────────────────────────── */}
      <div className="trips-section">
        <div className="trips-header">
          <h2>{trips.length > 0 ? `${trips.length} trajet${trips.length > 1 ? "s" : ""} disponible${trips.length > 1 ? "s" : ""}` : "Aucun trajet trouvé"}</h2>
          <button className="btn-reset" onClick={() => { setFilters({ departure: "", destination: "", date: "" }); fetchTrips(); }}>
            Réinitialiser
          </button>
        </div>

        {loading ? (
          <div className="loading-grid">
            {[1,2,3,4,5,6].map(i => <div key={i} className="trip-card-skeleton" />)}
          </div>
        ) : (
          <div className="trips-grid">
            {trips.map((trip) => (
              <TripCard key={trip._id} trip={trip} onReserve={handleReserve} />
            ))}
          </div>
        )}
      </div>

      {/* ── Reserve modal ─────────────────────────────────────────────── */}
      {selectedTrip && (
        <ReserveModal
          trip={selectedTrip}
          onClose={handleModalClose}
          onConfirm={createReservation}
        />
      )}
    </div>
  );
}
