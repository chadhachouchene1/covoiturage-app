const express = require("express");
const router = express.Router();
const Groq = require("groq-sdk");
const userModel = require("../Models/userModel");
const tripModel = require("../Models/Tripmodel");
const ratingModel = require("../Models/Ratingmodel");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

router.post("/", async (req, res) => {
  try {
    const { message, history = [] } = req.body;
    if (!message) return res.status(400).json({ message: "Message requis" });

    const [users, trips, ratings] = await Promise.all([
      userModel.find().select("firstName lastName image role").limit(20),
      tripModel.find({ status: "active" })
        .populate("driver", "firstName lastName")
        .select("departure destination date time price availableSeats driver")
        .sort({ date: 1 })
        .limit(15),
      ratingModel.aggregate([
        { $group: { _id: "$reviewedId", avgRating: { $avg: "$stars" }, count: { $sum: 1 } } },
        { $sort: { avgRating: -1 } },
        { $limit: 5 }
      ])
    ]);

    const popularRoutes = await tripModel.aggregate([
      { $group: {
        _id: { departure: "$departure", destination: "$destination" },
        avgPrice: { $avg: "$price" },
        minPrice: { $min: "$price" },
        maxPrice: { $max: "$price" },
        count: { $sum: 1 }
      }},
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    const topDrivers = await Promise.all(
      ratings.map(async (r) => {
        const user = await userModel.findById(r._id).select("firstName lastName");
        return user ? {
          name: `${user.firstName} ${user.lastName}`,
          rating: r.avgRating.toFixed(1),
          reviews: r.count
        } : null;
      })
    );

    const context = `
DONNÉES TAWSILA EN TEMPS RÉEL :

👥 Membres inscrits : ${users.length}+

🚗 Trajets actifs disponibles (direction exacte) :
${trips.map(t => `- DÉPART: ${t.departure} | ARRIVÉE: ${t.destination} | Date: ${new Date(t.date).toLocaleDateString("fr-FR")} à ${t.time} | Prix: ${t.price} DT | Places dispo: ${t.availableSeats} | Conducteur: ${t.driver?.firstName} ${t.driver?.lastName}`).join("\n")}

💰 Prix moyens par trajet (données réelles) :
${popularRoutes.map(r => `- ${r._id.departure} → ${r._id.destination} : moyenne ${r.avgPrice.toFixed(1)} DT (min ${r.minPrice} DT, max ${r.maxPrice} DT) - ${r.count} trajet(s)`).join("\n")}

⭐ Conducteurs les mieux notés :
${topDrivers.filter(Boolean).map((d, i) => `${i+1}. ${d.name} - ${d.rating}/5 (${d.reviews} avis)`).join("\n")}
    `;

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: `Tu es Tawsila Assistant 🚗, chatbot intelligent de la plateforme de covoiturage Tawsila en Tunisie.

${context}

LANGUE : Détecte la langue et réponds dans la même langue.
- Français → réponds en français
- Darija tunisienne → réponds en darija (ex: "ahlen", "kifech", "bech", "mrigel")
- Arabe classique → réponds en arabe
- Anglais → réponds en anglais

Tu peux répondre aux questions sur :
- Les conducteurs les mieux notés avec leurs vraies notes
- Les trajets disponibles en temps réel
- Estimation du coût basée sur les VRAIES données de prix
- Comment réserver un trajet
- Comment publier un trajet
- Comment contacter un conducteur via le chat

IMPORTANT SUR LES TRAJETS :
- Le trajet "Sousse → Mahdia" est DIFFÉRENT de "Mahdia → Sousse"
- Ne confonds JAMAIS la direction d'un trajet
- Si un trajet n'existe pas dans cette direction exacte, dis-le clairement
- Ne propose pas le trajet inverse sans le préciser explicitement
- Utilise TOUJOURS les données réelles. Ne donne jamais de prix inventés.

Sois court (max 4 phrases), amical et précis.`,
        },
        ...history,
        { role: "user", content: message },
      ],
      max_tokens: 400,
      temperature: 0.5,
    });

    const reply = completion.choices[0].message.content;
    res.json({ reply });
  } catch (error) {
    console.error("Chatbot error:", error);
    res.status(500).json({ message: "Erreur chatbot" });
  }
});

module.exports = router;