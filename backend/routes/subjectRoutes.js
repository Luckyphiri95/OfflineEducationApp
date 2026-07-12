const express = require("express");
const router = express.Router();

const {
  getSubjects,
  createSubject,
  updateSubject,
  deleteSubject,
  uploadGuide,
  deleteGuide,
  markGuideViewed
} = require("../controllers/subjectController");
const { upload } = require("../middleware/upload");

// Get all subjects
router.get("/subjects", getSubjects);

// Create a subject
router.post("/subjects", createSubject);

// Update a subject
router.put("/subjects/:id", updateSubject);

// Delete a subject
router.delete("/subjects/:id", deleteSubject);

// Upload/replace a subject's study guide PDF
router.post("/subjects/:id/guide", upload.single("pdf"), uploadGuide);

// Remove a subject's study guide PDF
router.delete("/subjects/:id/guide", deleteGuide);

// Mark a subject's study guide as viewed by a user
router.post("/subjects/:id/guide/view", markGuideViewed);

module.exports = router;