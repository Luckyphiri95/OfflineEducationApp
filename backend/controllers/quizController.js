const db = require("../database/database");

// ======================
// GET ALL QUIZZES
// ======================
const getQuiz = (req, res) => {
  const query = `
    SELECT * FROM quiz
  `;

  db.all(query, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ message: "Database error" });
    }

    return res.status(200).json(rows);
  });
};


// ======================
// SUBMIT QUIZ (SCORE CALCULATION)
// ======================
const submitQuiz = (req, res) => {
  const { user_id, subject_id, answers } = req.body;

  if (!user_id || !subject_id || !answers) {
    return res.status(400).json({ message: "Missing data" });
  }

  const query = `
    SELECT * FROM quiz WHERE subject_id = ?
  `;

  db.all(query, [subject_id], (err, questions) => {
    if (err) {
      return res.status(500).json({ message: "Database error" });
    }

    let score = 0;

    questions.forEach((q) => {
      const userAnswer = answers[q.id];
      if (userAnswer === q.correct_answer) {
        score++;
      }
    });

    const insert = `
      INSERT INTO results (user_id, subject_id, score, total_questions)
      VALUES (?, ?, ?, ?)
    `;

    db.run(
      insert,
      [user_id, subject_id, score, questions.length],
      function (err) {
        if (err) {
          return res.status(500).json({ message: "Error saving result" });
        }

        return res.status(200).json({
          message: "Quiz submitted",
          score,
          total: questions.length,
          resultId: this.lastID
        });
      }
    );
  });
};


// ======================
// GET RESULTS
// ======================
const getResults = (req, res) => {
  const query = `
    SELECT * FROM results
  `;

  db.all(query, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ message: "Database error" });
    }

    return res.status(200).json(rows);
  });
};


module.exports = {
  getQuiz,
  submitQuiz,
  getResults
};