const db = require("../database/database");

// ======================
// GET ALL ACTIVITIES
// ======================
const getActivities = (req, res) => {
  const query = `SELECT * FROM activities`;

  db.all(query, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ message: "Database error" });
    }

    return res.status(200).json(rows);
  });
};

// ======================
// CREATE ACTIVITY
// ======================
const createActivity = (req, res) => {
  const { subject_id, title } = req.body;

  if (!subject_id || !title) {
    return res.status(400).json({ message: "Subject and title are required" });
  }

  const query = `
    INSERT INTO activities (subject_id, title)
    VALUES (?, ?)
  `;

  db.run(query, [subject_id, title], function (err) {
    if (err) {
      return res.status(500).json({ message: "Database error" });
    }

    return res.status(201).json({
      message: "Activity created successfully",
      activityId: this.lastID
    });
  });
};

// ======================
// UPDATE ACTIVITY
// ======================
const updateActivity = (req, res) => {
  const { id } = req.params;
  const { subject_id, title } = req.body;

  const query = `
    UPDATE activities
    SET subject_id = ?, title = ?
    WHERE id = ?
  `;

  db.run(query, [subject_id, title, id], function (err) {
    if (err) {
      return res.status(500).json({ message: "Database error" });
    }

    return res.status(200).json({
      message: "Activity updated successfully"
    });
  });
};

// ======================
// DELETE ACTIVITY
// ======================
const deleteActivity = (req, res) => {
  const { id } = req.params;

  db.run(`DELETE FROM activities WHERE id = ?`, [id], function (err) {
    if (err) {
      return res.status(500).json({ message: "Database error" });
    }

    db.run(`DELETE FROM quiz WHERE activity_id = ?`, [id], () => {});

    return res.status(200).json({
      message: "Activity deleted successfully"
    });
  });
};

module.exports = {
  getActivities,
  createActivity,
  updateActivity,
  deleteActivity
};
