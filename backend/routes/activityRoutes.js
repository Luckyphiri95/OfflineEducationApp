const express = require("express");
const router = express.Router();

const {
  getActivities,
  createActivity,
  updateActivity,
  deleteActivity
} = require("../controllers/activityController");

// Get all activities
router.get("/activities", getActivities);

// Create an activity
router.post("/activities", createActivity);

// Update an activity
router.put("/activities/:id", updateActivity);

// Delete an activity
router.delete("/activities/:id", deleteActivity);

module.exports = router;
