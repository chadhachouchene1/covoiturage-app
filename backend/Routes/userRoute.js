const express = require("express");
const router = express.Router();
const { registerUser, loginUser, findUser, getUsers, upload, sendOTP, checkOTP, forgotPassword, resetPassword } = require("../Controllers/userController");

router.post("/send-otp", sendOTP);
router.post("/verify-otp", checkOTP);
router.post("/register", upload.single("image"), registerUser);
router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.get("/find/:userId", findUser);
router.get("/getusers", getUsers);

module.exports = router;