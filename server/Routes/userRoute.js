const express = require("express");
const router = express.Router();

const { registerUser } = require("../Controllers/userController"); // ✅ Fix here
const { loginUser } = require("../Controllers/userController"); // ✅ Fix here
const { findUser , getUser } = require("../Controllers/userController"); // ✅ Fix here

router.post("/registrer", registerUser);
router.post("/login", loginUser);
router.get("/find/:userId", findUser);
router.get("/getuser", getUser);
module.exports = router;
