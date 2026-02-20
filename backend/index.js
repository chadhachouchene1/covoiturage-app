const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();
const userRoute = require("./Routes/userRoute");

app.use(express.json());
app.use(cors());

// ✅ Servir les images uploadées comme fichiers statiques
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/users", userRoute);

const port = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Atlas connected ✅"))
  .catch(err => console.log("MongoDB connection error ❌", err));

app.listen(port, () => {
  console.log(`Server running on port: ${port}`);
});