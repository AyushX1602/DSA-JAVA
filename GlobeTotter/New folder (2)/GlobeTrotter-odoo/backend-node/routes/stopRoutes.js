const express = require("express");
const router = express.Router();
const stopController = require("../controller/stopController");
const { protect } = require("../middleware/authMiddleware");

// GET all stops
router.get("/", protect, stopController.getStops);

// GET stop by ID
router.get("/:id", protect, stopController.getStopById);

// CREATE stop
router.post("/", protect, stopController.createStop);

// UPDATE stop
router.put("/:id", protect, stopController.updateStop);

// DELETE stop
router.delete("/:id", protect, stopController.deleteStop);

module.exports = router;
