require("dotenv").config();

const express = require("express");
const cors = require("cors");

const db = require("./database/database");
const authRoutes = require("./routes/authRoutes");
const subjectRoutes = require("./routes/subjectRoutes");

const app = express();

app.use(cors());
app.use(express.json());

// AUTH ROUTES
app.use("/api/auth", authRoutes);

// SUBJECT ROUTES
app.use("/api", subjectRoutes);
//TESTING 
console.log("Subject routes loaded");

app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});