const db = require("../database/database");
const path = require("path");
const fs = require("fs");
const { UPLOADS_DIR } = require("../middleware/upload");

// ======================
// GET ALL PAST PAPERS
// ======================
const getPapers = (req, res) => {
  const query = `SELECT * FROM past_papers`;

  db.all(query, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ message: "Database error" });
    }

    return res.status(200).json(rows);
  });
};

// ======================
// CREATE PAST PAPER
// ======================
const createPaper = (req, res) => {
  const { subject_id, title, year } = req.body;

  if (!subject_id || !title) {
    return res.status(400).json({ message: "Subject and title are required" });
  }

  const query = `
    INSERT INTO past_papers (subject_id, title, year)
    VALUES (?, ?, ?)
  `;

  db.run(query, [subject_id, title, year], function (err) {
    if (err) {
      return res.status(500).json({ message: "Database error" });
    }

    return res.status(201).json({
      message: "Past paper created successfully",
      paperId: this.lastID
    });
  });
};

// ======================
// UPDATE PAST PAPER
// ======================
const updatePaper = (req, res) => {
  const { id } = req.params;
  const { subject_id, title, year } = req.body;

  const query = `
    UPDATE past_papers
    SET subject_id = ?, title = ?, year = ?
    WHERE id = ?
  `;

  db.run(query, [subject_id, title, year, id], function (err) {
    if (err) {
      return res.status(500).json({ message: "Database error" });
    }

    return res.status(200).json({
      message: "Past paper updated successfully"
    });
  });
};

// ======================
// DELETE PAST PAPER
// ======================
const deletePaper = (req, res) => {
  const { id } = req.params;

  db.get(`SELECT filename FROM past_papers WHERE id = ?`, [id], (err, row) => {
    if (err) {
      return res.status(500).json({ message: "Database error" });
    }

    db.run(`DELETE FROM past_papers WHERE id = ?`, [id], function (deleteErr) {
      if (deleteErr) {
        return res.status(500).json({ message: "Database error" });
      }

      db.run(`DELETE FROM quiz WHERE paper_id = ?`, [id], () => {});

      if (row && row.filename) {
        fs.unlink(path.join(UPLOADS_DIR, row.filename), () => {});
      }

      return res.status(200).json({
        message: "Past paper deleted successfully"
      });
    });
  });
};

// ======================
// UPLOAD PAST PAPER FILE (PDF)
// ======================
const uploadPaperFile = (req, res) => {
  const { id } = req.params;

  if (!req.file) {
    return res.status(400).json({ message: "No PDF file uploaded" });
  }

  db.get(`SELECT filename FROM past_papers WHERE id = ?`, [id], (err, row) => {
    if (err) {
      return res.status(500).json({ message: "Database error" });
    }
    if (!row) {
      fs.unlink(req.file.path, () => {});
      return res.status(404).json({ message: "Past paper not found" });
    }

    const previousFilename = row.filename;

    db.run(
      `UPDATE past_papers SET filename = ?, original_name = ? WHERE id = ?`,
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
          message: "Past paper file uploaded successfully",
          filename: req.file.filename,
          original_name: req.file.originalname,
        });
      }
    );
  });
};

// ======================
// DELETE PAST PAPER FILE (PDF)
// ======================
const deletePaperFile = (req, res) => {
  const { id } = req.params;

  db.get(`SELECT filename FROM past_papers WHERE id = ?`, [id], (err, row) => {
    if (err) {
      return res.status(500).json({ message: "Database error" });
    }
    if (!row) {
      return res.status(404).json({ message: "Past paper not found" });
    }

    db.run(
      `UPDATE past_papers SET filename = NULL, original_name = NULL WHERE id = ?`,
      [id],
      function (updateErr) {
        if (updateErr) {
          return res.status(500).json({ message: "Database error" });
        }

        if (row.filename) {
          fs.unlink(path.join(UPLOADS_DIR, row.filename), () => {});
        }

        return res.status(200).json({ message: "Past paper file removed" });
      }
    );
  });
};

module.exports = {
  getPapers,
  createPaper,
  updatePaper,
  deletePaper,
  uploadPaperFile,
  deletePaperFile
};
