const express = require("express");
const router = express.Router();
const activityController = require("../controller/activityController");
const { protect } = require("../middleware/authMiddleware");

// GET all activities
router.get("/", protect, activityController.getActivities);

// GET activity by ID
router.get("/:id", protect, activityController.getActivityById);

// CREATE activity
router.post("/", protect, activityController.createActivity);

// UPDATE activity
router.put("/:id", protect, activityController.updateActivity);

// DELETE activity
router.delete("/:id", protect, activityController.deleteActivity);

module.exports = router;
