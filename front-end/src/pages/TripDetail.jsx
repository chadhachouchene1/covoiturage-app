import { useContext, useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { TripContext } from "../context/TripContext";
import { baseUrl } from "../utils/services";
import "./TripDetail.css";

const baseImgUrl = import.meta.env.VITE_IMG_URL;

export default function TripDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { createReservation } = useContext(TripContext);

  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [seats, setSeats] = useState(1);
  const [message, setMessage] = useState("");
  const [reserveLoading, setReserveLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${baseUrl}/trips/${id}`);
        const data = await res.json();
        if (!res.ok) { navigate("/"); return; }
        setTrip(data.trip);
      } catch { navigate("/"); }
      setLoading(false);
    };
    load();
  }, [id]);

  const handleReserve = async (e) => {
    e.preventDefault();
    if (!user) return navigate("/login");
    setError(null);
    setReserveLoading(true);
    const result = await createReservation(trip._id, seats, message);
    setReserveLoading(false);
    if (result.error) return setError(result.message);
    setSuccess(true);
  };

  if (loading) return (
    <div className="td-loading">
      <div className="td-spinner" />
      <p>Chargement du trajet...</p>
    </div>
  );

  if (!trip) return null;

  const isDriver   = user?.id === trip.driver?._id;
  const driverImg  = trip.driver?.image ? `${baseImgUrl}${trip.driver.image}` : null;
  const driverInit = `${trip.driver?.firstName?.[0] || ""}${trip.driver?.lastName?.[0] || ""}`.toUpperCase();
  const formattedDate = new Date(trip.date).toLocaleDateString("fr-FR", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
  const total = seats * trip.price;

  return (
    <div className="td-page">

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <div className="td-hero">
        {trip.carImage
          ? <img src={`${baseImgUrl}${trip.carImage}`} alt="voiture" className="td-hero-img" />
          : <div className="td-hero-placeholder">🚗</div>}
        <div className="td-hero-overlay" />
        <div className="td-hero-content">
          <button className="td-back-btn" onClick={() => navigate(-1)}>← Retour</button>
          <div className="td-hero-route">
            <div className="td-hero-city">
              <span className="td-dot td-dot-blue" />
              <span>{trip.departure}</span>
            </div>
            <div className="td-hero-arrow">→</div>
            <div className="td-hero-city">
              <span className="td-dot td-dot-amber" />
              <span>{trip.destination}</span>
            </div>
          </div>
          <div className="td-hero-meta">
            <span>📅 {formattedDate}</span>
            <span>⏰ {trip.time}</span>
            <span className={trip.availableSeats > 0 ? "td-badge-green" : "td-badge-red"}>
              {trip.availableSeats > 0 ? `${trip.availableSeats} place(s) dispo` : "Complet"}
            </span>
          </div>
        </div>
      </div>

      <div className="td-body">

        {/* ── Left: trip info ──────────────────────────────────────── */}
        <div className="td-left">

          {/* Main info card */}
          <div className="td-card">
            <h2 className="td-card-title">Détails du trajet</h2>
            <div className="td-info-grid">
              {[
                { icon: "📍", label: "Départ",      value: trip.departure },
                { icon: "🎯", label: "Destination",  value: trip.destination },
                { icon: "📅", label: "Date",         value: formattedDate },
                { icon: "⏰", label: "Heure",        value: trip.time },
                { icon: "💰", label: "Prix/place",   value: `${trip.price} DT` },
                { icon: "🪑", label: "Places dispo", value: `${trip.availableSeats} / ${trip.seats}` },
                { icon: "🚗", label: "Immatriculation", value: trip.licensePlate },
                { icon: "🧳", label: "Bagages",      value: trip.luggage ? "Acceptés ✅" : "Non acceptés ❌" },
              ].map(({ icon, label, value }) => (
                <div key={label} className="td-info-row">
                  <span className="td-info-icon">{icon}</span>
                  <span className="td-info-label">{label}</span>
                  <span className="td-info-value">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Description */}
          {trip.description && (
            <div className="td-card">
              <h2 className="td-card-title">📝 Description</h2>
              <p className="td-description">"{trip.description}"</p>
            </div>
          )}

          {/* Driver card */}
          <div className="td-card td-driver-card">
            <h2 className="td-card-title">🧑‍✈️ Conducteur</h2>
            <Link to={`/profile/${trip.driver?._id}`} className="td-driver-link">
              <div className="td-driver-avatar">
                {driverImg
                  ? <img src={driverImg} alt="driver" />
                  : <div className="td-driver-init">{driverInit}</div>}
              </div>
              <div className="td-driver-info">
                <strong>{trip.driver?.firstName} {trip.driver?.lastName}</strong>
                <span>Voir le profil →</span>
              </div>
            </Link>
          </div>
        </div>

        {/* ── Right: reservation form ───────────────────────────────── */}
        <div className="td-right">
          <div className="td-reserve-card">

            {success ? (
              <div className="td-success">
                <div className="td-success-icon">✅</div>
                <h3>Réservation envoyée !</h3>
                <p>Le conducteur va répondre par email sous peu.</p>
                <button className="td-btn-primary" onClick={() => navigate("/my-reservations")}>
                  Voir mes réservations
                </button>
                <button className="td-btn-secondary" onClick={() => navigate("/")}>
                  Retour à l'accueil
                </button>
              </div>
            ) : (
              <>
                <div className="td-price-display">
                  <span className="td-price-label">Prix par place</span>
                  <span className="td-price-amount">{trip.price} <small>DT</small></span>
                </div>

                {!isDriver && trip.availableSeats > 0 && (
                  <form onSubmit={handleReserve} className="td-reserve-form">

                    <div className="td-form-field">
                      <label>Nombre de places</label>
                      <div className="td-seats-row">
                        <button type="button" onClick={() => setSeats(Math.max(1, seats - 1))}>−</button>
                        <span>{seats}</span>
                        <button type="button" onClick={() => setSeats(Math.min(trip.availableSeats, seats + 1))}>+</button>
                      </div>
                    </div>

                    <div className="td-total-line">
                      <span>Total</span>
                      <span className="td-total-amount">{total} DT</span>
                    </div>

                    <div className="td-form-field">
                      <label>Message <small>(facultatif)</small></label>
                      <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Ex: Je serai au point de départ, j'ai un petit bagage..."
                        rows={3}
                        className="td-textarea"
                      />
                    </div>

                    {error && <div className="td-error">⚠️ {error}</div>}

                    {user ? (
                      <button type="submit" className="td-btn-primary" disabled={reserveLoading}>
                        {reserveLoading ? "Envoi..." : `Réserver — ${total} DT`}
                      </button>
                    ) : (
                      <Link to="/login" className="td-btn-primary td-btn-login">
                        Se connecter pour réserver
                      </Link>
                    )}
                  </form>
                )}

                {isDriver && (
                  <div className="td-own-trip">
                    <span>🚗</span>
                    <p>C'est votre trajet</p>
                    <button className="td-btn-secondary" onClick={() => navigate(`/profile/${user.id}`)}>
                      Voir mon profil
                    </button>
                  </div>
                )}

                {trip.availableSeats === 0 && !isDriver && (
                  <div className="td-complet">
                    <span>😔</span>
                    <p>Ce trajet est complet</p>
                    <button className="td-btn-secondary" onClick={() => navigate("/")}>
                      Chercher un autre trajet
                    </button>
                  </div>
                )}

                <div className="td-trust">
                  <div className="td-trust-item">🔒 Paiement sécurisé via Stripe</div>
                  <div className="td-trust-item">📧 Confirmation par email</div>
                  <div className="td-trust-item">✅ Annulation gratuite</div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
