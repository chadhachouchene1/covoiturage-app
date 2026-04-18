const express = require("express");
const router  = express.Router();
const { protect, addRating, getUserRatings } = require("../Controllers/Ratingcontroller");

router.post("/",          protect, addRating);      // POST  /api/ratings
router.get("/:userId",             getUserRatings);  // GET   /api/ratings/:userId  (public)

module.exports = router;
