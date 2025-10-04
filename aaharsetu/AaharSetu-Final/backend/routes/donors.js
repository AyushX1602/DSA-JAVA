const express = require("express");
const Donor = require("../models/User");
const Donation = require('../models/Donation');
const router = express.Router();

// Get all donors
router.get("/", async (req, res) => {
  try {
    const donors = await Donor.find();
    res.json(donors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add a new donor
router.post("/", async (req, res) => {
  const newDonor = new Donor(req.body);
  try {
    const savedDonor = await newDonor.save();
    res.status(201).json(savedDonor);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
