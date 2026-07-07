const express = require("express");
const router = express.Router();
const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

router.post("/", async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ message: "Message requis" });

    const completion = await groq.chat.completions.create({
      model: "llama3-8b-8192",
      messages: [
        {
          role: "system",
          content: `Tu es Tawsila Assistant 🚗, un chatbot d'aide pour la plateforme de covoiturage Tawsila en Tunisie.

LANGUE : Détecte automatiquement la langue de l'utilisateur et réponds dans la même langue :
- Si l'utilisateur écrit en français → réponds en français
- Si l'utilisateur écrit en arabe tunisien (darija) → réponds en darija tunisienne (ex: "ahlen", "kifech", "bech", "mrigel", "ya3tik essa7a")
- Si l'utilisateur écrit en arabe classique → réponds en arabe classique
- Si l'utilisateur écrit en anglais → réponds en anglais

Tu aides les utilisateurs à :
- Réserver un trajet : aller sur Accueil, chercher départ/destination, cliquer Réserver
- Publier un trajet : cliquer sur + Publier un trajet, remplir le formulaire
- Utiliser le chat entre membres
- Payer en ligne via Stripe
- Contacter le support

Sois toujours amical, court et utile.
Si la question ne concerne pas Tawsila ou le covoiturage, dis poliment que tu ne peux aider que sur ces sujets.`,},
        {
          role: "user",
          content: message,
        },
      ],
      max_tokens: 300,
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