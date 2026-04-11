const express  = require("express");
const router   = express.Router();
const {
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
} = require("../Controllers/Reservationcontroller");

// All reservation routes require authentication
router.use(protect);

router.post("/", createReservation);                  // POST   /api/reservations
router.get("/driver", getDriverReservations);         // GET    /api/reservations/driver
router.get("/passenger", getPassengerReservations);   // GET    /api/reservations/passenger
router.get("/unread-count", getUnreadCount);          // GET    /api/reservations/unread-count

// IMPORTANT: specific named routes (/driver, /passenger, /unread-count) MUST come
// before parameterized routes (/:id) to avoid Express matching them as an :id param.
// The routes below all use /:id — they are correctly placed after the named routes above.

router.get("/:id/stripe", createStripeSession);       // GET    /api/reservations/:id/stripe
router.patch("/:id/pay", confirmPayment);             // PATCH  /api/reservations/:id/pay
router.patch("/:id/read", markAsRead);                // PATCH  /api/reservations/:id/read
router.patch("/:id", updateReservationStatus);        // PATCH  /api/reservations/:id  (accept/reject)
router.delete("/:id", cancelReservation);             // DELETE /api/reservations/:id

module.exports = router;