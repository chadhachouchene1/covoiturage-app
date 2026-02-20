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
    const { email, phone, firstName } = req.body;
    if (!email || !firstName || !phone) {
      return res.status(400).json({ message: "Email, téléphone et prénom requis" });
    }
    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: "Format email invalide" });
    }

    // ✅ Vérification AVANT d'envoyer l'OTP
    const existingEmail = await userModel.findOne({ email });
    if (existingEmail) {
      return res.status(409).json({ message: "Cet email est déjà associé à un compte" });
    }

    const existingPhone = await userModel.findOne({ phone });
    if (existingPhone) {
      return res.status(409).json({ message: "Ce numéro de téléphone est déjà utilisé" });
    }

    await sendOTPEmail(email, firstName);
    res.status(200).json({ message: "Code envoyé sur votre email ✅" });
  } catch (error) {
    console.error("SendOTP Error:", error);
    res.status(500).json({ message: "Erreur envoi email." });
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
    const { firstName, lastName, dateOfBirth, birthPlace, email, phone, password } = req.body;

    // ── Champs obligatoires ──
    if (!firstName || !lastName || !dateOfBirth || !birthPlace || !email || !phone || !password) {
      return res.status(400).json({ message: "Tous les champs sont obligatoires" });
    }

    // ── Vérification âge >= 18 ──
    const dob = new Date(dateOfBirth);
    const age = Math.floor((Date.now() - dob.getTime()) / (365.25 * 24 * 3600 * 1000));
    if (age < 18) {
      return res.status(400).json({ message: "Vous devez avoir au moins 18 ans" });
    }

    // ── Hash mot de passe ──
    const hashedPassword = await bcrypt.hash(password, 10);
    const imagePath = req.file ? `/uploads/${req.file.filename}` : "";

    // ── Créer l'utilisateur ──
    const newUser = await userModel.create({
      firstName,
      lastName,
      dateOfBirth,
      birthPlace,
      email,
      phone,
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

module.exports = { registerUser, loginUser, findUser, getUsers, upload, sendOTP, checkOTP };