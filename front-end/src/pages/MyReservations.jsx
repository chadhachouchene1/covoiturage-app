import { useContext, useEffect } from "react";
import { TripContext } from "../context/TripContext";
import "./MyReservations.css";

const statusConfig = {
  pending:   { label: "En attente", color: "#F59E0B", bg: "#FEF3C7", icon: "⏳" },
  accepted:  { label: "Acceptée",   color: "#16A34A", bg: "#DCFCE7", icon: "✅" },
  rejected:  { label: "Refusée",    color: "#DC2626", bg: "#FEE2E2", icon: "❌" },
  cancelled: { label: "Annulée",    color: "#64748B", bg: "#F1F5F9", icon: "🚫" },
};

export default function MyReservations() {
  const {
    passengerReservations,
    driverReservations,
    fetchPassengerReservations,
    fetchDriverReservations,
    updateReservation,
    cancelReservation,
    payWithStripe,
  } = useContext(TripContext);

  useEffect(() => {
    fetchPassengerReservations();
    fetchDriverReservations();
  }, []);

  const handleDriverAction = async (id, status) => {
    await updateReservation(id, status);
  };

  const handleCancel = async (id) => {
    if (!window.confirm("Annuler cette réservation ?")) return;
    await cancelReservation(id);
  };

  return (
    <div className="reservations-page">
      <div className="res-header">
        <h1 className="res-title">Mes réservations</h1>
        <p className="res-sub">Gérez vos trajets et les demandes reçues</p>
      </div>

      <div className="res-content">

        {/* ───────── PASSAGER ───────── */}
        <section className="res-section">
          <h2 className="section-title">
            <span className="section-icon">🎫</span>
            Mes réservations
            <span className="section-count">{passengerReservations.length}</span>
          </h2>

          {passengerReservations.length === 0 ? (
            <div className="empty-state">
              <span>🎫</span>
              <p>Aucune réservation pour le moment</p>
            </div>
          ) : (
            <div className="res-list">
              {passengerReservations.map((res) => {
                const cfg   = statusConfig[res.status] || statusConfig.pending;
                const trip  = res.trip;
                const isPaid = res.paymentStatus === "paid";

                return (
                  <div key={res._id} className="res-card">

                    {/* Car placeholder */}
                    <div className="res-card-left">
                      <div className="res-car-placeholder">🚗</div>
                    </div>

                    <div className="res-card-body">
                      <div className="res-route">
                        <span>{trip?.departure}</span>
                        <span className="res-arrow">→</span>
                        <span>{trip?.destination}</span>
                      </div>

                      <div className="res-meta">
                        <span>📅 {trip?.date?.slice(0, 10)}</span>
                        <span>⏰ {trip?.time}</span>
                        <span>🪑 {res.seatsRequested} place(s)</span>
                        <span>💰 {trip?.price} DT / place</span>
                      </div>

                      {res.message && (
                        <div className="res-message">"{res.message}"</div>
                      )}
                    </div>

                    <div className="res-card-right">
                      <span
                        className="res-status"
                        style={{ background: cfg.bg, color: cfg.color }}
                      >
                        {cfg.icon} {cfg.label}
                      </span>

                      {/* Stripe payment button */}
                      {res.status === "accepted" && (
                        isPaid ? (
                          <span className="badge-paid">💳 Payé</span>
                        ) : (
                          <button
                            className="btn-paypal-trigger"
                            onClick={() => payWithStripe(res._id)}
                          >
                            <span>💳 Payer</span>
                            <small>
                              {(res.seatsRequested ?? 1) * (trip?.price ?? 0)} DT
                            </small>
                          </button>
                        )
                      )}

                      {res.status === "pending" && (
                        <button
                          className="btn-cancel-res"
                          onClick={() => handleCancel(res._id)}
                        >
                          Annuler
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* ───────── CONDUCTEUR ───────── */}
        <section className="res-section">
          <h2 className="section-title">
            <span className="section-icon">📥</span>
            Demandes reçues
            <span className="section-count">{driverReservations.length}</span>
            {driverReservations.some(r => r.status === "pending") && (
              <span className="section-badge">
                {driverReservations.filter(r => r.status === "pending").length} en attente
              </span>
            )}
          </h2>

          {driverReservations.length === 0 ? (
            <div className="empty-state">
              <span>📥</span>
              <p>Aucune demande reçue pour le moment</p>
            </div>
          ) : (
            <div className="res-list">
              {driverReservations.map((res) => {
                const cfg       = statusConfig[res.status] || statusConfig.pending;
                const trip      = res.trip;
                const passenger = res.passenger;

                return (
                  <div
                    key={res._id}
                    className={`res-card ${res.status === "pending" && !res.driverRead ? "res-card-unread" : ""}`}
                  >
                    {/* Passenger avatar */}
                    <div className="res-card-left">
                      {passenger?.image ? (
                        <img
                          src={`http://localhost:5000${passenger.image}`}
                          alt="passenger"
                          className="res-car-img res-passenger-img"
                        />
                      ) : (
                        <div className="res-avatar-init res-avatar-lg">
                          {passenger?.firstName?.[0]}{passenger?.lastName?.[0]}
                        </div>
                      )}
                    </div>

                    <div className="res-card-body">
                      <div className="res-passenger-name">
                        <strong>{passenger?.firstName} {passenger?.lastName}</strong>
                        {passenger?.phone && (
                          <span className="res-phone">📞 {passenger.phone}</span>
                        )}
                      </div>

                      <div className="res-route">
                        <span>{trip?.departure}</span>
                        <span className="res-arrow">→</span>
                        <span>{trip?.destination}</span>
                      </div>

                      <div className="res-meta">
                        <span>📅 {trip?.date?.slice(0, 10)}</span>
                        <span>⏰ {trip?.time}</span>
                        <span>🪑 {res.seatsRequested} place(s)</span>
                      </div>

                      {res.message && (
                        <div className="res-message">"{res.message}"</div>
                      )}
                    </div>

                    <div className="res-card-right">
                      <span
                        className="res-status"
                        style={{ background: cfg.bg, color: cfg.color }}
                      >
                        {cfg.icon} {cfg.label}
                      </span>

                      {res.status === "pending" && (
                        <div className="driver-actions">
                          <button
                            className="btn-accept"
                            onClick={() => handleDriverAction(res._id, "accepted")}
                          >
                            ✅ Accepter
                          </button>
                          <button
                            className="btn-reject"
                            onClick={() => handleDriverAction(res._id, "rejected")}
                          >
                            ❌ Refuser
                          </button>
                        </div>
                      )}

                      {res.paymentStatus === "paid" && (
                        <span className="badge-paid">💳 Payé</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

      </div>
    </div>
  );
}
