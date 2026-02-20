const nodemailer = require("nodemailer");

// Stockage temporaire des OTP en mémoire { email: { code, expiresAt } }
const otpStore = new Map();

// ─── Créer le transporteur Gmail ─────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,   // votre gmail ex: monapp@gmail.com
    pass: process.env.EMAIL_PASS,   // mot de passe d'application Gmail (pas votre vrai mdp)
  },
});

// ─── Générer un code OTP à 4 chiffres ────────────────────────────────────────
const generateOTP = () => {
  return Math.floor(1000 + Math.random() * 9000).toString(); // "4782"
};

// ─── Envoyer l'OTP par email ──────────────────────────────────────────────────
const sendOTPEmail = async (email, firstName) => {
  const code = generateOTP();
  const expiresAt = Date.now() + 10 * 60 * 1000; // expire dans 10 minutes

  // Stocker l'OTP
  otpStore.set(email, { code, expiresAt });

  const mailOptions = {
    from: `"CoVoiturage 🚗" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Votre code de vérification CoVoiturage",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; background: #f9f9f9; border-radius: 12px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #7c3aed, #4f46e5); padding: 32px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">🚗 CoVoiturage</h1>
        </div>
        <div style="padding: 32px;">
          <h2 style="color: #1f2937;">Bonjour ${firstName} 👋</h2>
          <p style="color: #6b7280; font-size: 15px;">Voici votre code de vérification pour activer votre compte :</p>
          
          <div style="background: #7c3aed; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0;">
            <span style="color: white; font-size: 42px; font-weight: 800; letter-spacing: 12px;">${code}</span>
          </div>
          
          <p style="color: #9ca3af; font-size: 13px;">⏱️ Ce code expire dans <strong>10 minutes</strong>.</p>
          <p style="color: #9ca3af; font-size: 13px;">Si vous n'avez pas créé de compte, ignorez cet email.</p>
        </div>
        <div style="background: #f3f4f6; padding: 16px; text-align: center;">
          <p style="color: #9ca3af; font-size: 12px; margin: 0;">© 2025 CoVoiturage — Partagez la route</p>
        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
  return { success: true };
};

// ─── Vérifier l'OTP ───────────────────────────────────────────────────────────
const verifyOTP = (email, code) => {
  const record = otpStore.get(email);

  if (!record) return { valid: false, message: "Aucun code envoyé pour cet email" };
  if (Date.now() > record.expiresAt) {
    otpStore.delete(email);
    return { valid: false, message: "Code expiré, demandez-en un nouveau" };
  }
  if (record.code !== code) return { valid: false, message: "Code incorrect" };

  otpStore.delete(email); // supprimer après usage
  return { valid: true };
};

module.exports = { sendOTPEmail, verifyOTP };