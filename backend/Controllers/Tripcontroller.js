const tripModel        = require("../Models/Tripmodel");
const reservationModel = require("../Models/Reservationmodel");
const userModel        = require("../Models/userModel");
const multer           = require("multer");
const path             = require("path");
const fs               = require("fs");
const { sendTripEmail } = require("../Emailservice");

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

const uploadCar = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

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

const createTrip = async (req, res) => {
  try {
    const { departure, destination, date, time, licensePlate, price, seats, luggage, description } = req.body;
    if (!departure || !destination || !date || !time || !licensePlate || !price || !seats)
      return res.status(400).json({ message: "Tous les champs obligatoires sont requis" });
    if (new Date(date) < new Date())
      return res.status(400).json({ message: "La date du trajet ne peut pas être dans le passé" });

    const carImage = req.file ? `/uploads/${req.file.filename}` : "";
    const trip = await tripModel.create({
      driver: req.userId, departure: departure.trim(), destination: destination.trim(),
      date, time, carImage, licensePlate, price: Number(price), seats: Number(seats),
      availableSeats: Number(seats), luggage: luggage === "true" || luggage === true,
      description: description || "", status: "active",
    });
    const populated = await tripModel.findById(trip._id).populate("driver", "firstName lastName image");
    res.status(201).json({ message: "Trajet publié ✅", trip: populated });
  } catch (error) {
    console.error("CreateTrip Error:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

const getAllTrips = async (req, res) => {
  try {
    const { departure, destination, date, minPrice, maxPrice, driver, includeAllStatuses } = req.query;
    const filter = {};

    // Home page should only show active trips with seats.
    // Driver profile can opt in to see all publications (including completed/cancelled).
    if (includeAllStatuses !== "true") {
      filter.status = "active";
      filter.availableSeats = { $gt: 0 };
    }

    if (driver)      filter.driver      = driver;
    if (departure)   filter.departure   = { $regex: departure,   $options: "i" };
    if (destination) filter.destination = { $regex: destination, $options: "i" };
    if (date)        filter.date        = { $gte: new Date(date), $lt: new Date(new Date(date).getTime() + 86400000) };
    if (minPrice)    filter.price       = { ...filter.price, $gte: Number(minPrice) };
    if (maxPrice)    filter.price       = { ...filter.price, $lte: Number(maxPrice) };

    const trips = await tripModel.find(filter).populate("driver", "firstName lastName image").sort({ date: 1, time: 1 });
    res.status(200).json(trips);
  } catch (error) {
    console.error("GetAllTrips Error:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

const getTripById = async (req, res) => {
  try {
    const trip = await tripModel.findById(req.params.id).populate("driver", "firstName lastName image phone email");
    if (!trip) return res.status(404).json({ message: "Trajet introuvable" });
    const reservations = await reservationModel.find({ trip: req.params.id }).populate("passenger", "firstName lastName image phone");
    res.status(200).json({ trip, reservations });
  } catch (error) {
    console.error("GetTripById Error:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

const getMyTrips = async (req, res) => {
  try {
    const trips = await tripModel.find({ driver: req.userId }).sort({ date: -1 });
    const tripsWithCount = await Promise.all(trips.map(async (trip) => {
      const pendingCount = await reservationModel.countDocuments({ trip: trip._id, status: "pending", driverRead: false });
      return { ...trip.toObject(), pendingReservations: pendingCount };
    }));
    res.status(200).json(tripsWithCount);
  } catch (error) {
    console.error("GetMyTrips Error:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// FIX: Block cancellation if any passenger has paid
const cancelTrip = async (req, res) => {
  try {
    const trip = await tripModel.findById(req.params.id);
    if (!trip) return res.status(404).json({ message: "Trajet introuvable" });
    if (trip.driver.toString() !== req.userId) return res.status(403).json({ message: "Non autorisé" });
    if (trip.status === "cancelled") return res.status(400).json({ message: "Ce trajet est déjà annulé" });

    // Block if any paid reservations exist
    const paidCount = await reservationModel.countDocuments({
      trip: trip._id, paymentStatus: "paid", status: { $nin: ["cancelled"] },
    });
    if (paidCount > 0) {
      return res.status(400).json({
        message: `Impossible d'annuler : ${paidCount} passager(s) ont déjà payé pour ce trajet. Contactez-les directement.`,
      });
    }

    trip.status = "cancelled";
    await trip.save();

    const reservations = await reservationModel
      .find({ trip: trip._id, status: { $in: ["pending", "accepted"] } })
      .populate("passenger", "email firstName");

    for (const reservation of reservations) {
      reservation.status = "cancelled";
      await reservation.save();
      if (reservation.passenger?.email) {
        await sendTripEmail(reservation.passenger.email, reservation.passenger.firstName, "trip_cancelled", {
          departure: trip.departure, destination: trip.destination, date: trip.date,
        });
      }
    }

    res.status(200).json({ message: "Trajet annulé ✅. Les passagers ont été notifiés par email." });
  } catch (error) {
    console.error("CancelTrip Error:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

module.exports = { uploadCar, protect, createTrip, getAllTrips, getTripById, getMyTrips, cancelTrip };