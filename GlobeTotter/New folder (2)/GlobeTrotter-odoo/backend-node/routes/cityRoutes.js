const express = require("express");
const router = express.Router();
const cityController = require("../controller/cityController");

// GET all cities (public endpoint for search)
router.get("/", cityController.getCities);

// GET city by ID
router.get("/:id", cityController.getCityById);

// CREATE city (admin only)
router.post("/", cityController.createCity);

// UPDATE city (admin only)
router.put("/:id", cityController.updateCity);

// DELETE city (admin only)
router.delete("/:id", cityController.deleteCity);

module.exports = router;
