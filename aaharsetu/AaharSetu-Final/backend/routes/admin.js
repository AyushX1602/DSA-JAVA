const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Donation = require('../models/Donation');
const DonationRequest = require('../models/requestDonation');
const NGO = require('../models/NGO');
const Volunteer = require('../models/Volunteer');


// Route to fetch all NGOs
router.get("/ngo", async (req, res) => {
  try {
    const ngos = await NGO.find();
    res.status(200).json(ngos);
  } catch (error) {
    res.status(500).json({ error: "Error fetching NGOs", details: error.message });
  }
});

router.get("/volunteer", async (req, res) => {
  try {
    const volunteers = await Volunteer.find();
    res.status(200).json(volunteers);
  } catch (error) {
    res.status(500).json({ error: "Error fetching NGOs", details: error.message });
  }
});

router.get("/donation", async (req, res) => {
  try {
    const donations = await Donation.find();
    res.status(200).json(donations);
  } catch (error) {
    res.status(500).json({ error: "Error fetching Donations", details: error.message });
  }
});


// Route to fetch a specific NGO by ID
router.get("/:id", async (req, res) => {
  try {
    const ngo = await NGO.findById(req.params.id);
    if (!ngo) {
      return res.status(404).json({ message: "NGO not found" });
    }
    res.status(200).json(ngo);
  } catch (error) {
    res.status(500).json({ error: "Error fetching NGO", details: error.message });
  }
});

// Fetch all pending approvals
router.get('/pending', async (req, res) => {
  try {
    const pendingDonors = await Donor.find({ isApproved: false });
    const pendingNGOs = await NGO.find({ isApproved: false });
    const pendingVolunteers = await Volunteer.find({ isApproved: false });

    res.json({
      donors: pendingDonors,
      ngos: pendingNGOs,
      volunteers: pendingVolunteers
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
});

// Approve a donor
router.put('/approve/donor/:id', async (req, res) => {
  try {
    const donor = await Donor.findByIdAndUpdate(req.params.id, { isApproved: true }, { new: true });
    if (!donor) return res.status(404).json({ message: 'Donor not found' });

    res.json({ message: 'Donor approved successfully', donor });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
});

// Approve an NGO
router.put('/approve/ngo/:id', async (req, res) => {
  try {
    const ngo = await NGO.findByIdAndUpdate(req.params.id, { isApproved: true }, { new: true });
    if (!ngo) return res.status(404).json({ message: 'NGO not found' });

    res.json({ message: 'NGO approved successfully', ngo });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
});


router.put('/donation/:id/approve', async (req, res) => {
  const { id } = req.params;
  try {
      const updatedDonation = await Donation.findByIdAndUpdate(
          id,
          { status: "approved" },
          { new: true }
      );
      
      if (!updatedDonation) {
          return res.status(404).json({ error: "Donation not found" });
      }

      res.status(200).json({ message: "Donation approved", updatedDonation });
  } catch (error) {
      res.status(500).json({ error: "Error updating donation", details: error.message });
  }
});

router.put('/donation/:id/reject', async (req, res) => {
  const { id } = req.params;
  try {
      const updatedDonation = await Donation.findByIdAndUpdate(
          id,
          { status: "rejected" },
          { new: true }
      );

      if (!updatedDonation) {
          return res.status(404).json({ error: "Donation not found" });
      }

      res.status(200).json({ message: "Donation rejected", updatedDonation });
  } catch (error) {
      res.status(500).json({ error: "Error updating donation", details: error.message });
  }
});




// Approve a Volunteer
router.put('/approve/volunteer/:id', async (req, res) => {
  try {
    const volunteer = await Volunteer.findByIdAndUpdate(req.params.id, { isApproved: true }, { new: true });
    if (!volunteer) return res.status(404).json({ message: 'Volunteer not found' });

    res.json({ message: 'Volunteer approved successfully', volunteer });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
});

module.exports = router;