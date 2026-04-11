const tripModel        = require("../Models/Tripmodel");
const reservationModel = require("../Models/reservationModel");
const userModel        = require("../Models/userModel");
const multer           = require("multer");
const path             = require("path");
const fs               = require("fs");
const { sendTripEmail } = require("../emailService");

// ─── Multer pour les images de voiture ───────────────────────────────────────
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename:    (req, file, cb) =>
    cb(null, `${Date.now()}-${file.originalname.replace(/\s/g, "_")}`),
});

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|webp/;
  const ok = allowed.test(path.extname(file.originalname).toLowerCase())
           && allowed.test(file.mimetype);
  cb(ok ? null : new Error("Images only"), ok);
};

const uploadCar = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

// ─── AUTH MIDDLEWARE (vérifier JWT) ──────────────────────────────────────────
const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Non authentifié" });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.userId = decoded._id;
    next();
  } catch {
    res.status(401).json({ message: "Token invalide" });
  }
};

// ─── CRÉER UN TRAJET ─────────────────────────────────────────────────────────
// POST /api/trips
const createTrip = async (req, res) => {
  try {
    const {
      departure, destination, date, time,
      licensePlate, price, seats, luggage, description,
    } = req.body;

    // Validation
    if (!departure || !destination || !date || !time || !licensePlate || !price || !seats) {
      return res.status(400).json({ message: "Tous les champs obligatoires sont requis" });
    }

    // Date ne peut pas être dans le passé
    if (new Date(date) < new Date()) {
      return res.status(400).json({ message: "La date du trajet ne peut pas être dans le passé" });
    }

    const carImage = req.file ? `/uploads/${req.file.filename}` : "";

    const trip = await tripModel.create({
      driver:         req.userId,
      departure:      departure.trim(),
      destination:    destination.trim(),
      date,
      time,
      carImage,
      licensePlate,
      price:          Number(price),
      seats:          Number(seats),
      availableSeats: Number(seats), // au départ = seats total
      luggage:        luggage === "true" || luggage === true,
      description:    description || "",
      status:         "active",
    });

    // Populate conducteur pour la réponse
    const populated = await tripModel.findById(trip._id).populate("driver", "firstName lastName image");

    res.status(201).json({ message: "Trajet publié ✅", trip: populated });
  } catch (error) {
    console.error("CreateTrip Error:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// ─── OBTENIR TOUS LES TRAJETS (page accueil) ─────────────────────────────────
// GET /api/trips
const getAllTrips = async (req, res) => {
  try {
    const { departure, destination, date, minPrice, maxPrice } = req.query;

    // Filtre dynamique
    const filter = { status: "active", availableSeats: { $gt: 0 } };

    if (departure)    filter.departure    = { $regex: departure,    $options: "i" };
    if (destination)  filter.destination  = { $regex: destination,  $options: "i" };
    if (date)         filter.date         = { $gte: new Date(date), $lt: new Date(new Date(date).getTime() + 86400000) };
    if (minPrice)     filter.price        = { ...filter.price, $gte: Number(minPrice) };
    if (maxPrice)     filter.price        = { ...filter.price, $lte: Number(maxPrice) };

    const trips = await tripModel
      .find(filter)
      .populate("driver", "firstName lastName image")
      .sort({ date: 1, time: 1 }); // plus proche en premier

    res.status(200).json(trips);
  } catch (error) {
    console.error("GetAllTrips Error:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// ─── OBTENIR UN TRAJET PAR ID ─────────────────────────────────────────────────
// GET /api/trips/:id
const getTripById = async (req, res) => {
  try {
    const trip = await tripModel
      .findById(req.params.id)
      .populate("driver", "firstName lastName image phone email");

    if (!trip) return res.status(404).json({ message: "Trajet introuvable" });

    // Récupérer les réservations de ce trajet (pour le conducteur)
    const reservations = await reservationModel
      .find({ trip: req.params.id })
      .populate("passenger", "firstName lastName image phone");

    res.status(200).json({ trip, reservations });
  } catch (error) {
    console.error("GetTripById Error:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// ─── MES TRAJETS (conducteur) ─────────────────────────────────────────────────
// GET /api/trips/my-trips
const getMyTrips = async (req, res) => {
  try {
    const trips = await tripModel
      .find({ driver: req.userId })
      .sort({ date: -1 });

    // Pour chaque trajet, compter les réservations en attente
    const tripsWithCount = await Promise.all(
      trips.map(async (trip) => {
        const pendingCount = await reservationModel.countDocuments({
          trip: trip._id,
          status: "pending",
          driverRead: false,
        });
        return { ...trip.toObject(), pendingReservations: pendingCount };
      })
    );

    res.status(200).json(tripsWithCount);
  } catch (error) {
    console.error("GetMyTrips Error:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// ─── ANNULER UN TRAJET ────────────────────────────────────────────────────────
// PATCH /api/trips/:id/cancel
const cancelTrip = async (req, res) => {
  try {
    const trip = await tripModel.findById(req.params.id);
    if (!trip) return res.status(404).json({ message: "Trajet introuvable" });

    // Seul le conducteur peut annuler
    if (trip.driver.toString() !== req.userId) {
      return res.status(403).json({ message: "Non autorisé" });
    }

    trip.status = "cancelled";
    await trip.save();

    // Notifier tous les passagers avec réservation acceptée/en attente
    const reservations = await reservationModel
      .find({ trip: trip._id, status: { $in: ["pending", "accepted"] } })
      .populate("passenger", "email firstName");

    for (const reservation of reservations) {
      reservation.status = "cancelled";
      await reservation.save();

      // Envoyer email d'annulation au passager
      if (reservation.passenger?.email) {
        await sendTripEmail(
          reservation.passenger.email,
          reservation.passenger.firstName,
          "trip_cancelled",
          { departure: trip.departure, destination: trip.destination, date: trip.date }
        );
      }
    }

    res.status(200).json({ message: "Trajet annulé ✅" });
  } catch (error) {
    console.error("CancelTrip Error:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

module.exports = {
  uploadCar,
  protect,
  createTrip,
  getAllTrips,
  getTripById,
  getMyTrips,
  cancelTrip,
};