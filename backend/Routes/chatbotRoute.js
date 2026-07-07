const express = require("express");
const router = express.Router();
const Groq = require("groq-sdk");
const userModel = require("../Models/userModel");
const tripModel = require("../Models/Tripmodel");
const ratingModel = require("../Models/Ratingmodel");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

router.post("/", async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ message: "Message requis" });

    // ── Récupère les données depuis MongoDB ──
    const [users, trips, ratings] = await Promise.all([
      userModel.find().select("firstName lastName image role").limit(20),
      tripModel.find({ status: "active" })
        .populate("driver", "firstName lastName")
        .select("departure destination date time price availableSeats driver")
        .limit(20),
      ratingModel.aggregate([
        { $group: {
          _id: "$reviewedId",
          avgRating: { $avg: "$stars" },
          count: { $sum: 1 }
        }},
        { $sort: { avgRating: -1 } },
        { $limit: 5 }
      ])
    ]);

    // ── Trouve les conducteurs les mieux notés ──
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

    // ── Contexte pour le chatbot ──
    const context = `
DONNÉES TAWSILA EN TEMPS RÉEL :

👥 Membres inscrits : ${users.length}+

🚗 Trajets actifs disponibles :
${trips.map(t => `- ${t.departure} → ${t.destination} | ${new Date(t.date).toLocaleDateString("fr-FR")} | ${t.price} DT | ${t.availableSeats} places | Conducteur: ${t.driver?.firstName} ${t.driver?.lastName}`).join("\n")}

⭐ Conducteurs les mieux notés :
${topDrivers.filter(Boolean).map((d, i) => `${i+1}. ${d.name} - ${d.rating}/5 (${d.reviews} avis)`).join("\n")}
    `;

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: `Tu es Tawsila Assistant 🚗, chatbot de la plateforme de covoiturage Tawsila en Tunisie.

${context}

LANGUE : Détecte la langue de l'utilisateur et réponds dans la même langue.
- Français → réponds en français
- Darija tunisienne → réponds en darija (ex: "ahlen", "kifech", "bech", "mrigel")
- Arabe classique → réponds en arabe
- Anglais → réponds en anglais

Tu peux répondre aux questions sur :
- Les conducteurs les mieux notés
- Les trajets disponibles
- Comment réserver, publier un trajet
- Comment contacter un conducteur (via le chat)
- Les prix et villes disponibles

Sois court, amical et utile. Max 3-4 phrases par réponse.`,
        },
        { role: "user", content: message },
      ],
      max_tokens: 400,
      temperature: 0.7,
    });

    const reply = completion.choices[0].message.content;
    res.json({ reply });
  } catch (error) {
    console.error("Chatbot error:", error);
    res.status(500).json({ message: "Erreur chatbot" });
  }
});

module.exports = router;