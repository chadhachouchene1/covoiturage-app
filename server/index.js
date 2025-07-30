const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
require('dotenv').config();

const app = express()
const userRoute=require("./Routes/userRoute")
app.use(express.json())
app.use(cors())

app.use("/api/users",userRoute)

const port = process.env.PORT||5000;
mongoose.connect('mongodb://localhost:27017/ChatDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("MongoDB connected"))
.catch(err => console.log("MongoDB connection error: ", err));
app.listen(port,(req,res) =>{
console.log(`serveur running on port....: ${port}`)

})