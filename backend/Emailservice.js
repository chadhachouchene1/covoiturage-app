const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ── Templates email ────────────────────────────────────────────────────────────
const templates = {

  // Conducteur reçoit une nouvelle demande de réservation
  new_reservation: (firstName, data) => ({
    subject: "🚗 Nouvelle demande de réservation — Tawsila",
    html: `
      <div style="font-family:'Segoe UI',sans-serif;max-width:520px;margin:auto;background:#f8fafc;border-radius:14px;overflow:hidden;">
        <div style="background:linear-gradient(135deg,#0D1A35,#1A56DB);padding:28px;text-align:center;">
          <h1 style="color:white;margin:0;font-size:22px;">🚗 Tawsila</h1>
        </div>
        <div style="padding:28px;">
          <h2 style="color:#0D1A35;">Bonjour ${firstName} 👋</h2>
          <p style="color:#64748b;font-size:15px;">
            <strong style="color:#1A56DB;">${data.passengerName}</strong>
            souhaite réserver <strong>${data.seats} place(s)</strong> sur votre trajet :
          </p>
          <div style="background:white;border:1px solid #e2e8f0;border-radius:10px;padding:18px;margin:18px 0;">
            <p style="margin:6px 0;color:#1e293b;">
              📍 <strong>${data.departure}</strong> → <strong>${data.destination}</strong>
            </p>
            <p style="margin:6px 0;color:#64748b;">
              📅 ${new Date(data.date).toLocaleDateString("fr-FR", { weekday:"long", day:"numeric", month:"long" })}
            </p>
          </div>
          <p style="color:#64748b;font-size:14px;">
            Connectez-vous à votre profil pour <strong>accepter ou refuser</strong> cette demande.
          </p>
          <div style="background:#FEF3C7;border:1px solid #F59E0B;border-radius:8px;padding:12px;margin-top:16px;">
            <p style="margin:0;color:#92400E;font-size:13px;">
              ⏳ La demande restera en attente jusqu'à votre réponse.
            </p>
          </div>
        </div>
        <div style="background:#e2e8f0;padding:14px;text-align:center;">
          <p style="margin:0;color:#94a3b8;font-size:12px;">© 2025 Tawsila — Your Ride, Our Pride</p>
        </div>
      </div>
    `,
  }),

  // Passager : réservation acceptée
  reservation_accepted: (firstName, data) => ({
    subject: "✅ Réservation acceptée — Tawsila",
    html: `
      <div style="font-family:'Segoe UI',sans-serif;max-width:520px;margin:auto;background:#f8fafc;border-radius:14px;overflow:hidden;">
        <div style="background:linear-gradient(135deg,#16A34A,#15803d);padding:28px;text-align:center;">
          <h1 style="color:white;margin:0;font-size:22px;">🚗 Tawsila</h1>
        </div>
        <div style="padding:28px;">
          <h2 style="color:#16A34A;">Réservation confirmée ✅</h2>
          <p style="color:#64748b;font-size:15px;">
            Bonne nouvelle <strong>${firstName}</strong> ! Votre réservation a été <strong style="color:#16A34A;">acceptée</strong>.
          </p>
          <div style="background:white;border:1px solid #bbf7d0;border-radius:10px;padding:18px;margin:18px 0;">
            <p style="margin:6px 0;color:#1e293b;">
              📍 <strong>${data.departure}</strong> → <strong>${data.destination}</strong>
            </p>
            <p style="margin:6px 0;color:#64748b;">
              📅 ${new Date(data.date).toLocaleDateString("fr-FR", { weekday:"long", day:"numeric", month:"long" })}
            </p>
            <p style="margin:6px 0;color:#64748b;">⏰ ${data.time}</p>
          </div>
          <p style="color:#64748b;font-size:14px;">
            Soyez à l'heure au point de départ. Bon voyage ! 🎉
          </p>
        </div>
        <div style="background:#e2e8f0;padding:14px;text-align:center;">
          <p style="margin:0;color:#94a3b8;font-size:12px;">© 2025 Tawsila — Your Ride, Our Pride</p>
        </div>
      </div>
    `,
  }),

  // Passager : réservation refusée
  reservation_rejected: (firstName, data) => ({
    subject: "❌ Réservation non retenue — Tawsila",
    html: `
      <div style="font-family:'Segoe UI',sans-serif;max-width:520px;margin:auto;background:#f8fafc;border-radius:14px;overflow:hidden;">
        <div style="background:linear-gradient(135deg,#0D1A35,#1A56DB);padding:28px;text-align:center;">
          <h1 style="color:white;margin:0;font-size:22px;">🚗 Tawsila</h1>
        </div>
        <div style="padding:28px;">
          <h2 style="color:#DC2626;">Réservation non retenue</h2>
          <p style="color:#64748b;font-size:15px;">
            Bonjour <strong>${firstName}</strong>, votre demande pour le trajet suivant n'a pas été retenue :
          </p>
          <div style="background:white;border:1px solid #fecaca;border-radius:10px;padding:18px;margin:18px 0;">
            <p style="margin:6px 0;color:#1e293b;">
              📍 <strong>${data.departure}</strong> → <strong>${data.destination}</strong>
            </p>
            <p style="margin:6px 0;color:#64748b;">
              📅 ${new Date(data.date).toLocaleDateString("fr-FR", { weekday:"long", day:"numeric", month:"long" })}
            </p>
          </div>
          <p style="color:#64748b;font-size:14px;">
            D'autres trajets sont disponibles sur Tawsila. Consultez la page d'accueil pour en trouver un autre.
          </p>
        </div>
        <div style="background:#e2e8f0;padding:14px;text-align:center;">
          <p style="margin:0;color:#94a3b8;font-size:12px;">© 2025 Tawsila — Your Ride, Our Pride</p>
        </div>
      </div>
    `,
  }),

  // Passager : trajet annulé par le conducteur
  trip_cancelled: (firstName, data) => ({
    subject: "⚠️ Trajet annulé — Tawsila",
    html: `
      <div style="font-family:'Segoe UI',sans-serif;max-width:520px;margin:auto;background:#f8fafc;border-radius:14px;overflow:hidden;">
        <div style="background:linear-gradient(135deg,#F59E0B,#D97706);padding:28px;text-align:center;">
          <h1 style="color:white;margin:0;font-size:22px;">🚗 Tawsila</h1>
        </div>
        <div style="padding:28px;">
          <h2 style="color:#D97706;">Trajet annulé ⚠️</h2>
          <p style="color:#64748b;font-size:15px;">
            Bonjour <strong>${firstName}</strong>, le conducteur a annulé le trajet suivant :
          </p>
          <div style="background:white;border:1px solid #fde68a;border-radius:10px;padding:18px;margin:18px 0;">
            <p style="margin:6px 0;color:#1e293b;">
              📍 <strong>${data.departure}</strong> → <strong>${data.destination}</strong>
            </p>
            <p style="margin:6px 0;color:#64748b;">
              📅 ${new Date(data.date).toLocaleDateString("fr-FR", { weekday:"long", day:"numeric", month:"long" })}
            </p>
          </div>
          <p style="color:#64748b;font-size:14px;">
            Nous sommes désolés pour ce désagrément. Cherchez un autre trajet sur Tawsila.
          </p>
        </div>
        <div style="background:#e2e8f0;padding:14px;text-align:center;">
          <p style="margin:0;color:#94a3b8;font-size:12px;">© 2025 Tawsila — Your Ride, Our Pride</p>
        </div>
      </div>
    `,
  }),
};

// ── Fonction principale d'envoi ────────────────────────────────────────────────
const sendTripEmail = async (email, firstName, templateKey, data) => {
  try {
    const template = templates[templateKey];
    if (!template) throw new Error(`Template '${templateKey}' introuvable`);

    const { subject, html } = template(firstName, data);

    await transporter.sendMail({
      from: `"Tawsila 🚗" <${process.env.EMAIL_USER}>`,
      to:   email,
      subject,
      html,
    });

    console.log(`Email '${templateKey}' envoyé à ${email} ✅`);
  } catch (error) {
    // On ne bloque pas l'API si l'email échoue
    console.error(`Email error (${templateKey}):`, error.message);
  }
};

module.exports = { sendTripEmail };