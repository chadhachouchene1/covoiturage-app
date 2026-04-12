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
router.get("/search", async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 2) {
      return res.status(400).json({ message: "Minimum 2 caractères" });
    }
 
    const userModel = require("../Models/userModel");
    const users = await userModel.find({
      $or: [
        { firstName: { $regex: q.trim(), $options: "i" } },
        { lastName:  { $regex: q.trim(), $options: "i" } },
      ],
    })
    .select("firstName lastName image role")
    .limit(20);
 
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
});
 

module.exports = router;