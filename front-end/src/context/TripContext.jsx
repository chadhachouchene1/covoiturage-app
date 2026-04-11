import { createContext, useCallback, useContext, useState } from "react";
import { AuthContext } from "./AuthContext";
import { baseUrl } from "../utils/services";

export const TripContext = createContext();

export const TripContextProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [trips, setTrips] = useState([]);
  const [myTrips, setMyTrips] = useState([]);
  const [driverReservations, setDriverReservations] = useState([]);
  const [passengerReservations, setPassengerReservations] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getToken = () => localStorage.getItem("Token");

  // ── Fetch all trips (home page) ──────────────────────────────────────
  const fetchTrips = useCallback(async (filters = {}) => {
    setLoading(true);
    try {
      const params = new URLSearchParams(filters).toString();
      const res = await fetch(`${baseUrl}/trips${params ? `?${params}` : ""}`);
      const data = await res.json();
      setTrips(Array.isArray(data) ? data : []);
    } catch {
      setError("Erreur chargement trajets");
    }
    setLoading(false);
  }, []);

  // ── Create trip ──────────────────────────────────────────────────────
  const createTrip = useCallback(async (formData) => {
    try {
      const res = await fetch(`${baseUrl}/trips`, {
        method: "POST",
        headers: { Authorization: `Bearer ${getToken()}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) return { error: true, message: data.message };
      setMyTrips((prev) => [data.trip, ...prev]);
      return { error: false, trip: data.trip };
    } catch {
      return { error: true, message: "Erreur réseau" };
    }
  }, []);

  // ── Fetch my trips (driver) ──────────────────────────────────────────
  const fetchMyTrips = useCallback(async () => {
    try {
      const res = await fetch(`${baseUrl}/trips/my-trips`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      setMyTrips(Array.isArray(data) ? data : []);
    } catch {
      setError("Erreur chargement mes trajets");
    }
  }, []);

  // ── Cancel trip ──────────────────────────────────────────────────────
  const cancelTrip = useCallback(async (tripId) => {
    try {
      const res = await fetch(`${baseUrl}/trips/${tripId}/cancel`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (!res.ok) return { error: true, message: data.message };
      setMyTrips((prev) =>
        prev.map((t) => t._id === tripId ? { ...t, status: "cancelled" } : t)
      );
      return { error: false };
    } catch {
      return { error: true, message: "Erreur réseau" };
    }
  }, []);

  // ── Create reservation ───────────────────────────────────────────────
  const createReservation = useCallback(async (tripId, seatsRequested, message) => {
    try {
      const res = await fetch(`${baseUrl}/reservations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ tripId, seatsRequested, message }),
      });
      const data = await res.json();
      if (!res.ok) return { error: true, message: data.message };
      return { error: false, reservation: data.reservation };
    } catch {
      return { error: true, message: "Erreur réseau" };
    }
  }, []);

  // ── Fetch driver reservations ────────────────────────────────────────
  const fetchDriverReservations = useCallback(async () => {
    try {
      const res = await fetch(`${baseUrl}/reservations/driver`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      setDriverReservations(Array.isArray(data) ? data : []);
    } catch {
      setError("Erreur chargement réservations");
    }
  }, []);

  // ── Fetch passenger reservations ─────────────────────────────────────
  const fetchPassengerReservations = useCallback(async () => {
    try {
      const res = await fetch(`${baseUrl}/reservations/passenger`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      setPassengerReservations(Array.isArray(data) ? data : []);
    } catch {
      setError("Erreur chargement mes réservations");
    }
  }, []);

  // ── Accept / Reject reservation (driver) ────────────────────────────
  const updateReservation = useCallback(async (reservationId, status) => {
    try {
      const res = await fetch(`${baseUrl}/reservations/${reservationId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) return { error: true, message: data.message };
      setDriverReservations((prev) =>
        prev.map((r) => r._id === reservationId ? { ...r, status } : r)
      );
      return { error: false };
    } catch {
      return { error: true, message: "Erreur réseau" };
    }
  }, []);

  // ── Cancel reservation (passenger) ──────────────────────────────────
  const cancelReservation = useCallback(async (reservationId) => {
    try {
      const res = await fetch(`${baseUrl}/reservations/${reservationId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (!res.ok) return { error: true, message: data.message };
      setPassengerReservations((prev) =>
        prev.map((r) => r._id === reservationId ? { ...r, status: "cancelled" } : r)
      );
      return { error: false };
    } catch {
      return { error: true, message: "Erreur réseau" };
    }
  }, []);

  // ── Fetch unread notifications count ────────────────────────────────
  const fetchUnreadCount = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch(`${baseUrl}/reservations/unread-count`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      setUnreadCount(data.count || 0);
    } catch {}
  }, [user]);

  // ── Pay with Stripe ──────────────────────────────────────────────────
  // FIX: Added Authorization header (was missing — caused 401 errors)
  const payWithStripe = useCallback(async (reservationId) => {
    try {
      const res = await fetch(`${baseUrl}/reservations/${reservationId}/stripe`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();

      if (!res.ok) {
        return { error: true, message: data.message || "Erreur paiement" };
      }

      if (data.url) {
        window.location.href = data.url; // Redirect to Stripe checkout
      } else {
        return { error: true, message: "URL Stripe manquante" };
      }
    } catch {
      return { error: true, message: "Erreur réseau" };
    }
  }, []);

  return (
    <TripContext.Provider value={{
      trips, myTrips, driverReservations, passengerReservations,
      unreadCount, loading, error,
      fetchTrips, createTrip, fetchMyTrips, cancelTrip,
      createReservation, fetchDriverReservations,
      fetchPassengerReservations, updateReservation,
      cancelReservation, fetchUnreadCount,
      payWithStripe,
    }}>
      {children}
    </TripContext.Provider>
  );
};
