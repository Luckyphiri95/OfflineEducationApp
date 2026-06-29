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


// ======================
// CREATE QUESTION
// ======================
const createQuestion = (req, res) => {
  const { subject_id, question, option_a, option_b, option_c, option_d, correct_answer } = req.body;

  if (!subject_id || !question || !option_a || !option_b || !option_c || !option_d || !correct_answer) {
    return res.status(400).json({ message: "All fields required" });
  }

  const query = `
    INSERT INTO quiz (subject_id, question, option_a, option_b, option_c, option_d, correct_answer)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.run(query, [subject_id, question, option_a, option_b, option_c, option_d, correct_answer], function (err) {
    if (err) {
      return res.status(500).json({ message: "Database error" });
    }
    return res.status(201).json({ message: "Question created", questionId: this.lastID });
  });
};


// ======================
// UPDATE QUESTION
// ======================
const updateQuestion = (req, res) => {
  const { id } = req.params;
  const { subject_id, question, option_a, option_b, option_c, option_d, correct_answer } = req.body;

  const query = `
    UPDATE quiz SET subject_id = ?, question = ?, option_a = ?, option_b = ?,
    option_c = ?, option_d = ?, correct_answer = ? WHERE id = ?
  `;

  db.run(query, [subject_id, question, option_a, option_b, option_c, option_d, correct_answer, id], function (err) {
    if (err) {
      return res.status(500).json({ message: "Database error" });
    }
    if (this.changes === 0) {
      return res.status(404).json({ message: "Question not found" });
    }
    return res.status(200).json({ message: "Question updated" });
  });
};


// ======================
// DELETE QUESTION
// ======================
const deleteQuestion = (req, res) => {
  const { id } = req.params;

  db.run(`DELETE FROM quiz WHERE id = ?`, [id], function (err) {
    if (err) {
      return res.status(500).json({ message: "Database error" });
    }
    if (this.changes === 0) {
      return res.status(404).json({ message: "Question not found" });
    }
    return res.status(200).json({ message: "Question deleted" });
  });
};


module.exports = {
  getQuiz,
  submitQuiz,
  getResults,
  createQuestion,
  updateQuestion,
  deleteQuestion
};