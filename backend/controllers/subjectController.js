const db = require("../database/database");
const path = require("path");
const fs = require("fs");
const { UPLOADS_DIR } = require("../middleware/upload");

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

// ======================
// UPLOAD STUDY GUIDE (PDF)
// ======================
const uploadGuide = (req, res) => {
  const { id } = req.params;

  if (!req.file) {
    return res.status(400).json({ message: "No PDF file uploaded" });
  }

  db.get(`SELECT guide_filename FROM subjects WHERE id = ?`, [id], (err, row) => {
    if (err) {
      return res.status(500).json({ message: "Database error" });
    }
    if (!row) {
      fs.unlink(req.file.path, () => {});
      return res.status(404).json({ message: "Subject not found" });
    }

    const previousFilename = row.guide_filename;

    db.run(
      `UPDATE subjects SET guide_filename = ?, guide_original_name = ? WHERE id = ?`,
      [req.file.filename, req.file.originalname, id],
      function (updateErr) {
        if (updateErr) {
          fs.unlink(req.file.path, () => {});
          return res.status(500).json({ message: "Database error" });
        }

        if (previousFilename) {
          fs.unlink(path.join(UPLOADS_DIR, previousFilename), () => {});
        }

        return res.status(200).json({
          message: "Study guide uploaded successfully",
          guide_filename: req.file.filename,
          guide_original_name: req.file.originalname,
        });
      }
    );
  });
};

// ======================
// DELETE STUDY GUIDE (PDF)
// ======================
const deleteGuide = (req, res) => {
  const { id } = req.params;

  db.get(`SELECT guide_filename FROM subjects WHERE id = ?`, [id], (err, row) => {
    if (err) {
      return res.status(500).json({ message: "Database error" });
    }
    if (!row) {
      return res.status(404).json({ message: "Subject not found" });
    }

    db.run(
      `UPDATE subjects SET guide_filename = NULL, guide_original_name = NULL WHERE id = ?`,
      [id],
      function (updateErr) {
        if (updateErr) {
          return res.status(500).json({ message: "Database error" });
        }

        if (row.guide_filename) {
          fs.unlink(path.join(UPLOADS_DIR, row.guide_filename), () => {});
        }

        return res.status(200).json({ message: "Study guide removed" });
      }
    );
  });
};

// ======================
// MARK STUDY GUIDE AS VIEWED
// ======================
const markGuideViewed = (req, res) => {
  const { id } = req.params;
  const { user_id } = req.body;

  if (!user_id) {
    return res.status(400).json({ message: "user_id is required" });
  }

  db.run(
    `INSERT OR IGNORE INTO guide_views (user_id, subject_id) VALUES (?, ?)`,
    [user_id, id],
    (err) => {
      if (err) {
        return res.status(500).json({ message: "Database error" });
      }
      return res.status(200).json({ message: "Guide view recorded" });
    }
  );
};

module.exports = {
  getSubjects,
  createSubject,
  updateSubject,
  deleteSubject,
  uploadGuide,
  deleteGuide,
  markGuideViewed
};