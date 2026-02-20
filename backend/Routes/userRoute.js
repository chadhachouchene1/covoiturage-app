const express = require("express");
const router = express.Router();

const { registerUser, loginUser, findUser, getUsers, upload, sendOTP, checkOTP } = require("../Controllers/userController");

router.post("/send-otp", sendOTP);          // Étape 1 : envoyer le code
router.post("/verify-otp", checkOTP);       // Étape 2 : vérifier le code
router.post("/register", upload.single("image"), registerUser); // Étape 3 : créer le compte
router.post("/login", loginUser);
router.get("/find/:userId", findUser);
router.get("/getusers", getUsers);

module.exports = router;