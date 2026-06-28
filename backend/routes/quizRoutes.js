const express = require("express");
const router = express.Router();

const {
  getQuiz,
  submitQuiz,
  getResults
} = require("../controllers/quizController");

// ======================
// QUIZ ROUTES
// ======================

// GET all quiz questions
router.get("/quiz", getQuiz);

// Submit quiz answers
router.post("/submitQuiz", submitQuiz);

// Get all results
router.get("/results", getResults);

module.exports = router;