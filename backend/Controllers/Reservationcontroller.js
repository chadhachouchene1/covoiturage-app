const reservationModel = require("../Models/Reservationmodel");
const tripModel        = require("../Models/Tripmodel");
const { protect }      = require("./Tripcontroller");
const { sendTripEmail } = require("../Emailservice");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// ─── CRÉER UNE RÉSERVATION ────────────────────────────────────────────────────
const createReservation = async (req, res) => {
  try {
    const { tripId, seatsRequested, message } = req.body;

    if (!tripId || !seatsRequested) {
      return res.status(400).json({ message: "tripId et seatsRequested requis" });
    }

    const trip = await tripModel.findById(tripId).populate("driver", "email firstName lastName");
    if (!trip) return res.status(404).json({ message: "Trajet introuvable" });

    if (trip.driver._id.toString() === req.userId) {
      return res.status(400).json({ message: "Vous ne pouvez pas réserver votre propre trajet" });
    }

    if (trip.status !== "active") {
      return res.status(400).json({ message: "Ce trajet n'est plus disponible" });
    }

    if (Number(seatsRequested) > trip.availableSeats) {
      return res.status(400).json({
        message: `Seulement ${trip.availableSeats} place(s) disponible(s)`,
      });
    }

    const existing = await reservationModel.findOne({
      trip: tripId,
      passenger: req.userId,
      status: { $in: ["pending", "accepted"] },
    });
    if (existing) {
      return res.status(409).json({ message: "Vous avez déjà une réservation pour ce trajet" });
    }

    const reservation = await reservationModel.create({
      trip:           tripId,
      passenger:      req.userId,
      seatsRequested: Number(seatsRequested),
      message:        message || "",
      status:         "pending",
      driverRead:     false,
    });

    const passenger = await require("../Models/userModel").findById(req.userId).select("firstName lastName");
    if (trip.driver?.email) {
      await sendTripEmail(
        trip.driver.email,
        trip.driver.firstName,
        "new_reservation",
        {
          passengerName: `${passenger.firstName} ${passenger.lastName}`,
          departure:     trip.departure,
          destination:   trip.destination,
          date:          trip.date,
          seats:         seatsRequested,
        }
      );
    }

    const populated = await reservationModel
      .findById(reservation._id)
      .populate("passenger", "firstName lastName image phone")
      .populate("trip", "departure destination date time price");

    res.status(201).json({ message: "Réservation envoyée ✅", reservation: populated });
  } catch (error) {
    console.error("CreateReservation Error:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// ─── DEMANDES REÇUES PAR LE CONDUCTEUR ───────────────────────────────────────
const getDriverReservations = async (req, res) => {
  try {
    const myTrips = await tripModel.find({ driver: req.userId }).select("_id");
    const tripIds = myTrips.map((t) => t._id);

    const reservations = await reservationModel
      .find({ trip: { $in: tripIds } })
      .populate("passenger", "firstName lastName image phone email")
      .populate("trip", "departure destination date time price seats")
      .sort({ createdAt: -1 });

    res.status(200).json(reservations);
  } catch (error) {
    console.error("GetDriverReservations Error:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// ─── CRÉER SESSION STRIPE ─────────────────────────────────────────────────────
// FIX 1: Added Authorization (handled by router.use(protect))
// FIX 2: Stripe doesn't support TND (DT) — using EUR as equivalent (1 DT ≈ 0.30 EUR)
//        OR multiply by 100 and use USD if you want 1:1 numeric value
// FIX 3: success_url uses env variable for flexibility
const createStripeSession = async (req, res) => {
  try {
    const reservation = await reservationModel
      .findById(req.params.id)
      .populate("trip");

    if (!reservation) {
      return res.status(404).json({ message: "Réservation introuvable" });
    }

    if (reservation.status !== "accepted") {
      return res.status(400).json({ message: "Réservation non acceptée" });
    }

    if (reservation.paymentStatus === "paid") {
      return res.status(400).json({ message: "Déjà payé" });
    }

    const total = reservation.seatsRequested * reservation.trip.price;

    // NOTE: Stripe does NOT support TND (Tunisian Dinar).
    // We use USD and treat 1 DT = 1 USD for demo purposes.
    // In production, apply the real exchange rate or use a supported currency.
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd", // TND not supported by Stripe — use USD as proxy
            product_data: {
              name: `Trajet ${reservation.trip.departure} → ${reservation.trip.destination}`,
              description: `${reservation.seatsRequested} place(s) · ${reservation.trip.date?.toString().slice(0,10)}`,
            },
            unit_amount: total * 100, // Stripe expects cents
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.FRONTEND_URL || "http://localhost:5173"}/payment-success/${reservation._id}`,
      cancel_url:  `${process.env.FRONTEND_URL || "http://localhost:5173"}/my-reservations`,
    });

    res.json({ url: session.url });

  } catch (error) {
    console.error("Stripe Error:", error);
    res.status(500).json({ message: "Erreur Stripe: " + error.message });
  }
};

// ─── MES RÉSERVATIONS (passager) ─────────────────────────────────────────────
const getPassengerReservations = async (req, res) => {
  try {
    const reservations = await reservationModel
      .find({ passenger: req.userId })
      .populate({
        path: "trip",
        select: "departure destination date time price carImage licensePlate status",
        populate: { path: "driver", select: "firstName lastName image phone" },
      })
      .sort({ createdAt: -1 });

    res.status(200).json(reservations);
  } catch (error) {
    console.error("GetPassengerReservations Error:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// ─── CONDUCTEUR ACCEPTE OU REFUSE ────────────────────────────────────────────
const updateReservationStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["accepted", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Statut invalide" });
    }

    const reservation = await reservationModel
      .findById(req.params.id)
      .populate("trip")
      .populate("passenger", "email firstName lastName");

    if (!reservation) return res.status(404).json({ message: "Réservation introuvable" });

    if (reservation.trip.driver.toString() !== req.userId) {
      return res.status(403).json({ message: "Non autorisé" });
    }

    if (reservation.status !== "pending") {
      return res.status(400).json({ message: "Cette réservation a déjà été traitée" });
    }

    if (status === "accepted") {
      const trip = reservation.trip;
      if (reservation.seatsRequested > trip.availableSeats) {
        return res.status(400).json({ message: "Plus assez de places disponibles" });
      }
      trip.availableSeats -= reservation.seatsRequested;
      if (trip.availableSeats === 0) trip.status = "completed";
      await trip.save();
    }

    reservation.status     = status;
    reservation.driverRead = true;
    await reservation.save();

    if (reservation.passenger?.email) {
      await sendTripEmail(
        reservation.passenger.email,
        reservation.passenger.firstName,
        status === "accepted" ? "reservation_accepted" : "reservation_rejected",
        {
          departure:   reservation.trip.departure,
          destination: reservation.trip.destination,
          date:        reservation.trip.date,
          time:        reservation.trip.time,
        }
      );
    }

    res.status(200).json({ message: `Réservation ${status === "accepted" ? "acceptée" : "refusée"} ✅` });
  } catch (error) {
    console.error("UpdateReservation Error:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// ─── PASSAGER ANNULE SA RÉSERVATION ──────────────────────────────────────────
const cancelReservation = async (req, res) => {
  try {
    const reservation = await reservationModel
      .findById(req.params.id)
      .populate("trip")
      .populate("passenger", "firstName lastName");

    if (!reservation) return res.status(404).json({ message: "Réservation introuvable" });

    if (reservation.passenger._id.toString() !== req.userId) {
      return res.status(403).json({ message: "Non autorisé" });
    }

    if (reservation.status === "cancelled") {
      return res.status(400).json({ message: "Réservation déjà annulée" });
    }

    if (reservation.status === "accepted") {
      const trip = await tripModel.findById(reservation.trip._id);
      trip.availableSeats += reservation.seatsRequested;
      if (trip.status === "completed") trip.status = "active";
      await trip.save();
    }

    reservation.status = "cancelled";
    await reservation.save();

    res.status(200).json({ message: "Réservation annulée ✅" });
  } catch (error) {
    console.error("CancelReservation Error:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// ─── NOTIFICATIONS NON LUES (badge conducteur) ───────────────────────────────
const getUnreadCount = async (req, res) => {
  try {
    const myTrips = await tripModel.find({ driver: req.userId }).select("_id");
    const tripIds = myTrips.map((t) => t._id);

    const count = await reservationModel.countDocuments({
      trip:       { $in: tripIds },
      status:     "pending",
      driverRead: false,
    });

    res.status(200).json({ count });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// ─── MARQUER COMME LU ────────────────────────────────────────────────────────
const markAsRead = async (req, res) => {
  try {
    await reservationModel.findByIdAndUpdate(req.params.id, { driverRead: true });
    res.status(200).json({ message: "Marqué comme lu" });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// ─── CONFIRMER LE PAIEMENT (appelé par PaymentSuccess.jsx après redirect Stripe) ──
// FIX: Added .populate("trip") so the response includes trip details for the UI
const confirmPayment = async (req, res) => {
  try {
    const { paymentId } = req.body;

    const reservation = await reservationModel
      .findById(req.params.id)
      .populate("trip", "departure destination date time price")
      .populate("passenger", "email firstName lastName");

    if (!reservation) return res.status(404).json({ message: "Réservation introuvable" });

    if (reservation.passenger._id.toString() !== req.userId) {
      return res.status(403).json({ message: "Non autorisé" });
    }

    if (reservation.status !== "accepted") {
      return res.status(400).json({ message: "La réservation doit être acceptée avant le paiement" });
    }

    if (reservation.paymentStatus === "paid") {
      return res.status(400).json({ message: "Cette réservation est déjà payée" });
    }

    reservation.paymentStatus = "paid";
    reservation.paymentId     = paymentId || `STRIPE-${Date.now()}`;
    await reservation.save();

    res.status(200).json({ message: "Paiement confirmé ✅", reservation });
  } catch (error) {
    console.error("ConfirmPayment Error:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

module.exports = {
  protect,
  createReservation,
  getDriverReservations,
  getPassengerReservations,
  updateReservationStatus,
  cancelReservation,
  getUnreadCount,
  markAsRead,
  confirmPayment,
  createStripeSession,
};