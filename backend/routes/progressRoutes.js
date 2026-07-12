const express = require("express");
const router = express.Router();

const { getProgress } = require("../controllers/progressController");

// Get per-subject completion progress for a user
router.get("/progress", getProgress);

module.exports = router;
