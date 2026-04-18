const Rating = require("../Models/Ratingmodel");
const { protect } = require("./Tripcontroller");

// POST /api/ratings  — donner une note
const addRating = async (req, res) => {
  try {
    const { reviewedId, stars, comment, tripId } = req.body;
    const reviewerId = req.userId;

    if (!reviewedId || !stars) {
      return res.status(400).json({ message: "reviewedId et stars requis" });
    }
    if (reviewerId === reviewedId) {
      return res.status(400).json({ message: "Vous ne pouvez pas vous noter vous-même" });
    }

    // Upsert : si déjà noté pour ce trajet, met à jour
    const rating = await Rating.findOneAndUpdate(
      { reviewer: reviewerId, reviewed: reviewedId, tripId: tripId || null },
      { stars: Number(stars), comment: comment || "" },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Recalcul moyenne
    const stats = await Rating.aggregate([
      { $match: { reviewed: rating.reviewed } },
      { $group: { _id: "$reviewed", avg: { $avg: "$stars" }, count: { $sum: 1 } } },
    ]);

    res.status(201).json({
      message: "Note enregistrée ✅",
      rating,
      avg:   stats[0]?.avg   || 0,
      count: stats[0]?.count || 0,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "Vous avez déjà noté cet utilisateur pour ce trajet" });
    }
    console.error("AddRating Error:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// GET /api/ratings/:userId  — récupérer les notes d'un utilisateur
const getUserRatings = async (req, res) => {
  try {
    const { userId } = req.params;

    const ratings = await Rating.find({ reviewed: userId })
      .populate("reviewer", "firstName lastName image")
      .sort({ createdAt: -1 });

    const stats = await Rating.aggregate([
      { $match: { reviewed: require("mongoose").Types.ObjectId.createFromHexString(userId) } },
      { $group: { _id: "$reviewed", avg: { $avg: "$stars" }, count: { $sum: 1 } } },
    ]);

    // Distribution par étoile
    const dist = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    ratings.forEach(r => { dist[r.stars] = (dist[r.stars] || 0) + 1; });

    res.status(200).json({
      ratings,
      avg:          stats[0]?.avg   || 0,
      count:        stats[0]?.count || 0,
      distribution: dist,
    });
  } catch (error) {
    console.error("GetUserRatings Error:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

module.exports = { protect, addRating, getUserRatings };
