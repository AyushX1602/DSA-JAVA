const express = require("express");
const router = express.Router();
const activityController = require("../controller/activityController");

// GET all activities
router.get("/", activityController.getActivities);

// GET activity by ID
router.get("/:id", activityController.getActivityById);

// CREATE activity
router.post("/", activityController.createActivity);

// UPDATE activity
router.put("/:id", activityController.updateActivity);

// DELETE activity
router.delete("/:id", activityController.deleteActivity);

module.exports = router;
