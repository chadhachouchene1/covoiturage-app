import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { baseUrl } from "../utils/services";

export default function PaymentSuccess() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading"); // loading | success | error
  const [reservation, setReservation] = useState(null);

  useEffect(() => {
    const confirmPayment = async () => {
      try {
        const token = localStorage.getItem("Token");

        // Mark reservation as paid in the database
        const res = await fetch(`${baseUrl}/reservations/${id}/pay`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ paymentId: `STRIPE-${Date.now()}` }),
        });

        const data = await res.json();

        if (!res.ok) {
          // If already paid, still show success
          if (data.message === "Cette réservation est déjà payée") {
            setStatus("success");
          } else {
            setStatus("error");
          }
          return;
        }

        setReservation(data.reservation);
        setStatus("success");
      } catch (err) {
        console.error("Payment confirmation error:", err);
        setStatus("error");
      }
    };

    if (id) confirmPayment();
  }, [id]);

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        {status === "loading" && (
          <>
            <div style={styles.spinner} />
            <p style={styles.loadingText}>Confirmation du paiement...</p>
          </>
        )}

        {status === "success" && (
          <>
            <div style={styles.checkCircle}>✓</div>
            <h1 style={styles.title}>Paiement réussi !</h1>
            <p style={styles.subtitle}>
              Votre réservation a été payée avec succès.
            </p>

            {reservation?.trip && (
              <div style={styles.recap}>
                <div style={styles.recapRow}>
                  <span style={styles.recapLabel}>Trajet</span>
                  <span style={styles.recapValue}>
                    {reservation.trip.departure} → {reservation.trip.destination}
                  </span>
                </div>
                <div style={styles.recapRow}>
                  <span style={styles.recapLabel}>Date</span>
                  <span style={styles.recapValue}>
                    {reservation.trip.date?.slice(0, 10)}
                  </span>
                </div>
                <div style={styles.recapRow}>
                  <span style={styles.recapLabel}>Places</span>
                  <span style={styles.recapValue}>
                    {reservation.seatsRequested}
                  </span>
                </div>
                <div style={{ ...styles.recapRow, borderTop: "1px solid #E2E8F0", paddingTop: 10, marginTop: 4 }}>
                  <span style={{ ...styles.recapLabel, fontWeight: 700, color: "#0C1220" }}>Total payé</span>
                  <span style={styles.totalAmount}>
                    {(reservation.seatsRequested ?? 1) * (reservation.trip.price ?? 0)} DT
                  </span>
                </div>
              </div>
            )}

            <button style={styles.btnPrimary} onClick={() => navigate("/my-reservations")}>
              Voir mes réservations
            </button>
            <button style={styles.btnSecondary} onClick={() => navigate("/")}>
              Retour à l'accueil
            </button>
          </>
        )}

        {status === "error" && (
          <>
            <div style={styles.errorCircle}>✕</div>
            <h1 style={{ ...styles.title, color: "#DC2626" }}>Erreur de paiement</h1>
            <p style={styles.subtitle}>
              Une erreur est survenue lors de la confirmation. Si vous avez été
              débité, contactez le support.
            </p>
            <button style={styles.btnPrimary} onClick={() => navigate("/my-reservations")}>
              Voir mes réservations
            </button>
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "calc(100vh - 64px)",
    background: "#F8FAFC",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "2rem",
    fontFamily: "'DM Sans', sans-serif",
  },
  card: {
    background: "#fff",
    borderRadius: 20,
    padding: "2.5rem 2rem",
    maxWidth: 460,
    width: "100%",
    textAlign: "center",
    boxShadow: "0 8px 40px rgba(0,0,0,0.1)",
    border: "1px solid #E2E8F0",
  },
  spinner: {
    width: 52,
    height: 52,
    border: "4px solid #E2E8F0",
    borderTopColor: "#1A56DB",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
    margin: "0 auto 1.2rem",
  },
  loadingText: {
    color: "#64748B",
    fontSize: 15,
  },
  checkCircle: {
    width: 72,
    height: 72,
    borderRadius: "50%",
    background: "#DCFCE7",
    color: "#16A34A",
    fontSize: 32,
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 1.2rem",
  },
  errorCircle: {
    width: 72,
    height: 72,
    borderRadius: "50%",
    background: "#FEE2E2",
    color: "#DC2626",
    fontSize: 28,
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 1.2rem",
  },
  title: {
    fontFamily: "'Fraunces', serif",
    fontSize: "1.6rem",
    fontWeight: 700,
    color: "#0C1220",
    marginBottom: "0.5rem",
  },
  subtitle: {
    color: "#64748B",
    fontSize: 14,
    lineHeight: 1.6,
    marginBottom: "1.5rem",
  },
  recap: {
    background: "#F8FAFC",
    borderRadius: 12,
    padding: "14px 16px",
    marginBottom: "1.5rem",
    textAlign: "left",
  },
  recapRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "5px 0",
  },
  recapLabel: {
    fontSize: 13,
    color: "#64748B",
  },
  recapValue: {
    fontSize: 13,
    fontWeight: 600,
    color: "#0C1220",
  },
  totalAmount: {
    fontFamily: "'Fraunces', serif",
    fontSize: "1.2rem",
    fontWeight: 700,
    color: "#1A56DB",
  },
  btnPrimary: {
    width: "100%",
    padding: "13px",
    background: "#0D1A35",
    color: "#fff",
    border: "none",
    borderRadius: 12,
    fontWeight: 700,
    fontSize: "0.95rem",
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
    marginBottom: 10,
  },
  btnSecondary: {
    width: "100%",
    padding: "11px",
    background: "none",
    color: "#64748B",
    border: "1.5px solid #E2E8F0",
    borderRadius: 12,
    fontWeight: 600,
    fontSize: "0.9rem",
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
  },
};
