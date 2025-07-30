const userModel=require("../Models/userModel")


const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const validator = require("validator");

  

const createToken = (_id) => {
  const jwtkey = process.env.JWT_SECRET_KEY || "yourDefaultSecretKey"; // fallback for dev
  return jwt.sign({ _id }, jwtkey, { expiresIn: "3d" });
};

const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    if (!validator.isLength(name, { min: 3 })) {
      return res.status(400).json({ message: "Name must be at least 3 characters long" });
    }

    if (!validator.isStrongPassword(password, { minLength: 6 })) {
      return res.status(400).json({ message: "Password must be strong (min 6 characters, a number, etc.)" });
    }

    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await userModel.create({
      name,
      email,
      password: hashedPassword
    });

    const token = createToken(newUser._id);

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email
      },
      token
    });

  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body; 

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid  password" });
    }

    const token = createToken(user._id);

    res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      },
      token
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const findUser = async (req,res) => {
    const userId = req.params.userId;
    try{
        const user = await userModel.findById(userId)
        res.status(200).json(user)
    } catch (error) {
    console.log( error);
    res.status(500).json({ message: "Server error" });
  }};


  const getUser = async (req,res) => {

    try{
        const users = await userModel.find()
        res.status(200).json(users)
    } catch (error) {
    console.log( error);
    res.status(500).json({ message: "Server error" });
  }};




module.exports = { registerUser, loginUser,findUser,getUser };


