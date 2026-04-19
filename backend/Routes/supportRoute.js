const express    = require("express");
const router     = express.Router();
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ── POST /api/support/send ────────────────────────────────────────────────────
router.post("/send", async (req, res) => {
  try {
    const { firstName, lastName, email, category, subject, message, userId } = req.body;

    // Validation
    if (!firstName || !lastName || !email || !category || !subject || !message) {
      return res.status(400).json({ message: "Tous les champs sont obligatoires." });
    }
    if (message.length < 20) {
      return res.status(400).json({ message: "Message trop court (minimum 20 caractères)." });
    }

   

    const categoryLabels = {
      reservation: "Problème de réservation",
      paiement:    "Problème de paiement",
      compte:      "Problème de compte",
      trajet:      "Problème avec un trajet",
      securite:    "Signalement / Sécurité",
      autre:       "Autre",
    };
    const categoryLabel = categoryLabels[category] || category;
    const formattedDate = new Date().toLocaleString("fr-FR", { dateStyle: "full", timeStyle: "short" });

    // ── 1. Email à l'équipe support (admin) ──────────────────────────────────
    await transporter.sendMail({
      from:    `"Tawsila Support 🚗" <${process.env.EMAIL_USER}>`,
      to:      process.env.EMAIL_USER, // reçoit sur le même compte admin
      subject: `[SUPPORT]  ${subject}`,
      html: `
        <div style="font-family:'Segoe UI',sans-serif;max-width:600px;margin:auto;background:#f8fafc;border-radius:14px;overflow:hidden;">
          <div style="background:linear-gradient(135deg,#0D1A35,#1A56DB);padding:24px 28px;">
            <h1 style="color:white;margin:0;font-size:20px;">🚗 Tawsila — Nouvelle demande support</h1>
            
          </div>

          <div style="padding:24px 28px;">

            <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
              
              <tr>
                <td style="padding:10px 14px;font-size:13px;font-weight:700;color:#64748B;">Utilisateur</td>
                <td style="padding:10px 14px;font-size:13px;color:#0C1220;">${firstName} ${lastName}${userId ? ` <span style="color:#94a3b8;font-size:11px;">(ID: ${userId})</span>` : ""}</td>
              </tr>
              <tr style="background:#F8FAFC;">
                <td style="padding:10px 14px;font-size:13px;font-weight:700;color:#64748B;">Email</td>
                <td style="padding:10px 14px;font-size:13px;"><a href="mailto:${email}" style="color:#1A56DB;">${email}</a></td>
              </tr>
              <tr>
                <td style="padding:10px 14px;font-size:13px;font-weight:700;color:#64748B;">Catégorie</td>
                <td style="padding:10px 14px;font-size:13px;color:#0C1220;">
                  <span style="background:#DBEAFE;color:#1E3A5F;padding:3px 10px;border-radius:20px;font-weight:600;font-size:12px;">${categoryLabel}</span>
                </td>
              </tr>
              <tr style="background:#F8FAFC;">
                <td style="padding:10px 14px;font-size:13px;font-weight:700;color:#64748B;">Sujet</td>
                <td style="padding:10px 14px;font-size:13px;font-weight:600;color:#0C1220;">${subject}</td>
              </tr>
              <tr>
                <td style="padding:10px 14px;font-size:13px;font-weight:700;color:#64748B;">Date</td>
                <td style="padding:10px 14px;font-size:13px;color:#64748B;">${formattedDate}</td>
              </tr>
            </table>

            <div style="background:white;border:1px solid #E2E8F0;border-left:4px solid #1A56DB;border-radius:8px;padding:16px 18px;margin-bottom:16px;">
              <p style="margin:0 0 8px;font-size:12px;font-weight:700;color:#1A56DB;text-transform:uppercase;letter-spacing:0.5px;">Message</p>
              <p style="margin:0;font-size:14px;color:#1E293B;line-height:1.7;white-space:pre-wrap;">${message.replace(/</g,"&lt;").replace(/>/g,"&gt;")}</p>
            </div>

            <div style="background:#FEF3C7;border:1px solid #FDE68A;border-radius:8px;padding:12px 16px;">
              <p style="margin:0;font-size:12px;color:#92400E;">
                ⚡ Pour répondre : répondez directement à cet email ou contactez l'utilisateur à <a href="mailto:${email}" style="color:#D97706;">${email}</a>
              </p>
            </div>
          </div>

          
        </div>
      `,
    });

    // ── 2. Email de confirmation à l'utilisateur ──────────────────────────────
    await transporter.sendMail({
      from:    `"Tawsila Support 🚗" <${process.env.EMAIL_USER}>`,
      to:      email,
      subject: `✅ Votre demande a été reçue`,
      html: `
        <div style="font-family:'Segoe UI',sans-serif;max-width:520px;margin:auto;background:#f8fafc;border-radius:14px;overflow:hidden;">
          <div style="background:linear-gradient(135deg,#0D1A35,#1A56DB);padding:24px 28px;text-align:center;">
            <h1 style="color:white;margin:0;font-size:22px;">🚗 Tawsila</h1>
            <p style="color:rgba(255,255,255,0.65);margin:6px 0 0;font-size:13px;">Confirmation de votre demande support</p>
          </div>

          <div style="padding:28px;">
            <h2 style="color:#0C1220;margin:0 0 8px;font-size:18px;">Bonjour ${firstName} 👋</h2>
            <p style="color:#64748B;font-size:14px;line-height:1.6;margin-bottom:20px;">
              Nous avons bien reçu votre demande. Notre équipe support va la traiter dans les plus brefs délais.
            </p>

            <div style="background:white;border:1px solid #E2E8F0;border-radius:12px;padding:16px 18px;margin-bottom:20px;">
              <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;">
              
                <div>
                  <p style="margin:0;font-size:13px;font-weight:700;color:#0C1220;">${subject}</p>
                  <p style="margin:3px 0 0;font-size:12px;color:#94A3B8;">${categoryLabel}</p>
                </div>
              </div>
              <div style="border-top:1px solid #E2E8F0;padding-top:12px;">
                <p style="margin:0;font-size:12px;color:#64748B;">
                  📅 Reçu le ${formattedDate}
                </p>
              </div>
            </div>

            <div style="background:#DCFCE7;border:1px solid #BBF7D0;border-radius:10px;padding:14px 16px;margin-bottom:16px;">
              <p style="margin:0;font-size:13px;color:#166534;font-weight:600;">⏱️ Temps de réponse estimé : 24–48h ouvrées</p>
            </div>

            
          </div>

          <div style="background:#E2E8F0;padding:14px;text-align:center;">
            <p style="margin:0;color:#94A3B8;font-size:12px;">© 2025 Tawsila — Your Ride, Our Pride</p>
          </div>
        </div>
      `,
    });

    res.status(200).json({
      message:  "Votre demande a été envoyée avec succès ✅",
      
    });

  } catch (error) {
    console.error("Support Email Error:", error);
    res.status(500).json({ message: "Erreur lors de l'envoi de l'email. Réessayez." });
  }
});

module.exports = router;
