const db = require("../database/database");

// ======================
// GET ALL SUBJECTS
// ======================
const getSubjects = (req, res) => {
  const query = `SELECT * FROM subjects`;

  db.all(query, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ message: "Database error" });
    }

    return res.status(200).json(rows);
  });
};

// ======================
// CREATE SUBJECT
// ======================
const createSubject = (req, res) => {
  const { name, description } = req.body;

  if (!name) {
    return res.status(400).json({ message: "Subject name is required" });
  }

  const query = `
    INSERT INTO subjects (name, description)
    VALUES (?, ?)
  `;

  db.run(query, [name, description], function (err) {
    if (err) {
      return res.status(500).json({ message: "Database error" });
    }

    return res.status(201).json({
      message: "Subject created successfully",
      subjectId: this.lastID
    });
  });
};

// ======================
// UPDATE SUBJECT
// ======================
const updateSubject = (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;

  const query = `
    UPDATE subjects
    SET name = ?, description = ?
    WHERE id = ?
  `;

  db.run(query, [name, description, id], function (err) {
    if (err) {
      return res.status(500).json({ message: "Database error" });
    }

    return res.status(200).json({
      message: "Subject updated successfully"
    });
  });
};

// ======================
// DELETE SUBJECT
// ======================
const deleteSubject = (req, res) => {
  const { id } = req.params;

  const query = `
    DELETE FROM subjects
    WHERE id = ?
  `;

  db.run(query, [id], function (err) {
    if (err) {
      return res.status(500).json({ message: "Database error" });
    }

    return res.status(200).json({
      message: "Subject deleted successfully"
    });
  });
};

module.exports = {
  getSubjects,
  createSubject,
  updateSubject,
  deleteSubject
};