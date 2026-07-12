require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");

const db = require("./database/database");
const authRoutes = require("./routes/authRoutes");
const subjectRoutes = require("./routes/subjectRoutes");
const quizRoutes = require("./routes/quizRoutes");
const paperRoutes = require("./routes/paperRoutes");
const activityRoutes = require("./routes/activityRoutes");
const progressRoutes = require("./routes/progressRoutes");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// AUTH ROUTES
app.use("/api/auth", authRoutes);

// SUBJECT ROUTES
app.use("/api", subjectRoutes);

// QUIZ ROUTES
app.use("/api", quizRoutes);

// PAST PAPER ROUTES
app.use("/api", paperRoutes);

// ACTIVITY ROUTES
app.use("/api", activityRoutes);

// PROGRESS ROUTES
app.use("/api", progressRoutes);


app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});