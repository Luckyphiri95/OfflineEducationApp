const express = require("express");
const router = express.Router();

const {
  getQuiz,
  submitQuiz,
  getResults,
  createQuestion,
  updateQuestion,
  deleteQuestion
} = require("../controllers/quizController");

// ======================
// QUIZ ROUTES
// ======================

router.get("/quiz", getQuiz);
router.post("/quiz", createQuestion);
router.put("/quiz/:id", updateQuestion);
router.delete("/quiz/:id", deleteQuestion);
router.post("/submitQuiz", submitQuiz);
router.get("/results", getResults);

module.exports = router;