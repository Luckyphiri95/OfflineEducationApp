const express = require("express");
const router = express.Router();

const {
  getSubjects,
  createSubject,
  updateSubject,
  deleteSubject
} = require("../controllers/subjectController");

// Get all subjects
router.get("/subjects", getSubjects);

// Create a subject
router.post("/subjects", createSubject);

// Update a subject
router.put("/subjects/:id", updateSubject);

// Delete a subject
router.delete("/subjects/:id", deleteSubject);

module.exports = router;