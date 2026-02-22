const userModel = require("../Models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const validator = require("validator");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { sendOTPEmail, verifyOTP } = require("../Otpservice");

// ─── Multer (image upload) ────────────────────────────────────────────────────
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename:    (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|webp/;
  const ext = allowed.test(path.extname(file.originalname).toLowerCase());
  const mime = allowed.test(file.mimetype);
  cb(ext && mime ? null : new Error("Only images are allowed"), ext && mime);
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 3 * 1024 * 1024 } });

// ─── JWT helper ───────────────────────────────────────────────────────────────
const createToken = (_id) => {
  const jwtkey = process.env.JWT_SECRET_KEY || "yourDefaultSecretKey";
  return jwt.sign({ _id }, jwtkey, { expiresIn: "3d" });
};

// ─── SEND OTP ─────────────────────────────────────────────────────────────────
const sendOTP = async (req, res) => {
  try {
    const { email, firstName } = req.body;
    if (!email || !firstName) {
      return res.status(400).json({ message: "Email et prénom requis" });
    }
    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: "Format email invalide" });
    }
    await sendOTPEmail(email, firstName);
    res.status(200).json({ message: "Code envoyé sur votre email ✅" });
  } catch (error) {
    console.error("SendOTP Error:", error);
    res.status(500).json({ message: "Erreur envoi email. Vérifiez votre configuration." });
  }
};

// ─── VERIFY OTP ───────────────────────────────────────────────────────────────
const checkOTP = async (req, res) => {
  const { email, code } = req.body;
  if (!email || !code) {
    return res.status(400).json({ message: "Email et code requis" });
  }
  const result = verifyOTP(email, code);
  if (!result.valid) {
    return res.status(400).json({ message: result.message });
  }
  res.status(200).json({ message: "Email vérifié avec succès ✅" });
};

// ─── REGISTER ─────────────────────────────────────────────────────────────────
const registerUser = async (req, res) => {
  try {
    const { firstName, lastName, dateOfBirth, birthPlace, email, phone, password, confirmPassword } = req.body;

    if (!firstName || !lastName || !dateOfBirth || !birthPlace || !email || !phone || !password) {
      return res.status(400).json({ message: "Tous les champs sont obligatoires" });
    }
    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: "Format email invalide" });
    }
    if (!validator.isMobilePhone(phone, "any")) {
      return res.status(400).json({ message: "Numéro de téléphone invalide" });
    }
    const dob = new Date(dateOfBirth);
    const age = Math.floor((Date.now() - dob.getTime()) / (365.25 * 24 * 3600 * 1000));
    if (age < 18) {
      return res.status(400).json({ message: "Vous devez avoir au moins 18 ans" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const imagePath = req.file ? `/uploads/${req.file.filename}` : "";

    const newUser = await userModel.create({
      firstName, lastName, dateOfBirth, birthPlace,
      email, phone,
      password: hashedPassword,
      image: imagePath,
      acceptedRules: true,
      isVerified: true,
    });

    const token = createToken(newUser._id);

    res.status(201).json({
      message: "Compte créé avec succès",
      user: {
        id: newUser._id,
        name: `${newUser.firstName} ${newUser.lastName}`,
        email: newUser.email,
        phone: newUser.phone,
        image: newUser.image,
        role: newUser.role,
      },
      token,
    });
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// ─── LOGIN ────────────────────────────────────────────────────────────────────
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email et mot de passe requis" });
    }
    const user = await userModel.findOne({ email });
    if (!user) return res.status(400).json({ message: "Email introuvable" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Mot de passe incorrect" });

    const token = createToken(user._id);

    res.status(200).json({
      message: "Connexion réussie",
      user: {
        id: user._id,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        phone: user.phone,
        image: user.image,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// ─── OTHER ────────────────────────────────────────────────────────────────────
const findUser = async (req, res) => {
  try {
    const user = await userModel.findById(req.params.userId).select("-password");
    if (!user) return res.status(404).json({ message: "Utilisateur introuvable" });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

const getUsers = async (req, res) => {
  try {
    const users = await userModel.find().select("-password");
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// ─── FORGOT PASSWORD — Envoyer OTP reset ─────────────────────────────────────
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email requis" });
    if (!validator.isEmail(email)) return res.status(400).json({ message: "Format email invalide" });

    // Vérifier que l'email existe en base
    const user = await userModel.findOne({ email });
    if (!user) return res.status(404).json({ message: "Aucun compte associé à cet email" });

    // Envoyer OTP
    await sendOTPEmail(email, user.firstName);
    res.status(200).json({ message: "Code de réinitialisation envoyé ✅" });
  } catch (error) {
    console.error("ForgotPassword Error:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// ─── RESET PASSWORD — Changer le mot de passe ────────────────────────────────
const resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    if (!email || !newPassword) {
      return res.status(400).json({ message: "Email et nouveau mot de passe requis" });
    }

    if (!validator.isStrongPassword(newPassword, { minLength: 6 })) {
      return res.status(400).json({ message: "Mot de passe trop faible" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await userModel.findOneAndUpdate({ email }, { password: hashedPassword });

    res.status(200).json({ message: "Mot de passe réinitialisé avec succès ✅" });
  } catch (error) {
    console.error("ResetPassword Error:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

module.exports = { registerUser, loginUser, findUser, getUsers, upload, sendOTP, checkOTP, forgotPassword, resetPassword };