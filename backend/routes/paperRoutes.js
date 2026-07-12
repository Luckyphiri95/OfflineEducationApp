const express = require("express");
const router = express.Router();

const {
  getPapers,
  createPaper,
  updatePaper,
  deletePaper,
  uploadPaperFile,
  deletePaperFile
} = require("../controllers/paperController");
const { upload } = require("../middleware/upload");

// Get all past papers
router.get("/papers", getPapers);

// Create a past paper
router.post("/papers", createPaper);

// Update a past paper
router.put("/papers/:id", updatePaper);

// Delete a past paper
router.delete("/papers/:id", deletePaper);

// Upload/replace a past paper's PDF file
router.post("/papers/:id/file", upload.single("pdf"), uploadPaperFile);

// Remove a past paper's PDF file
router.delete("/papers/:id/file", deletePaperFile);

module.exports = router;
