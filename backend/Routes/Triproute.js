const express  = require("express");
const router   = express.Router();
const {
  uploadCar,
  protect,
  createTrip,
  getAllTrips,
  getTripById,
  getMyTrips,
  cancelTrip,
} = require("../Controllers/Tripcontroller");

// ── Routes publiques ──────────────────────────────────────────────────────────
router.get("/",getAllTrips);   // GET  /api/trips
router.get("/my-trips",protect, getMyTrips);                              // GET    /api/trips/my-trips

router.get("/:id",getTripById);  // GET  /api/trips/:id

// ── Routes protégées (JWT requis) ─────────────────────────────────────────────
router.post("/",protect, uploadCar.single("carImage"), createTrip); // POST   /api/trips
router.patch("/:id/cancel",protect, cancelTrip);                              // PATCH  /api/trips/:id/cancel

module.exports = router;