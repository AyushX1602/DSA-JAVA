const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Donation = require('../models/Donation');
const DonationRequest = require('../models/requestDonation');
const NGO = require('../models/NGO');


const { isAuthenticated, hasRole } = require('../middlewares/authMiddleware');


router.post("/register",isAuthenticated, hasRole(['ngo']), async (req, res) => {
  try {
    const ngo = new NGO(req.body);
    await ngo.save();
    res.status(201).json({ message: "NGO registered successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to register NGO" });
  }
});

// Fetch all pending donation requests for NGOs (Not Yet Approved)
router.get('/requests', isAuthenticated, hasRole(['ngo']), async (req, res) => {
  try {
    console.log("Fetching pending donation requests for NGO:", req.user._id);

    const donationRequests = await Donation.find({ ngoApproved: false }).sort({ createdAt: -1 });

    console.log("Pending Donation Requests:", donationRequests);
    res.json(donationRequests);
  } catch (error) {
    console.error("Error fetching donation requests:", error);
    res.status(500).json({ error: "Failed to fetch donation requests" });
  }
});

// Fetch All Donations Approved by the Logged-in NGO
router.get('/approved', isAuthenticated, hasRole(['ngo']), async (req, res) => {
  try {
    console.log("Authenticated NGO ID:", req.user._id);

    const ngoId = new mongoose.Types.ObjectId(req.user._id); // Ensure ObjectId
    const approvedDonations = await Donation.find({ ngoId, ngoApproved: true });

    console.log("Approved Donations:", approvedDonations);
    res.json(approvedDonations);
  } catch (error) {
    console.error("Error fetching approved donations:", error);
    res.status(500).json({ error: "Failed to fetch approved donations" });
  }
});

// Approve a Donation Request
router.post('/requests/:id/accept', isAuthenticated, hasRole(['ngo']), async (req, res) => {
  try {
    const donationId = req.params.id;

    // Approve the donation and assign the NGO ID
    const updatedDonation = await Donation.findByIdAndUpdate(
      donationId,
      { ngoApproved: true, ngoId: req.user._id },
      { new: true }
    );

    if (!updatedDonation) return res.status(404).json({ error: "Donation not found" });

    console.log("Donation Approved:", updatedDonation);
    res.json({ message: "Donation approved", donation: updatedDonation });
  } catch (error) {
    console.error("Error accepting donation request:", error);
    res.status(500).json({ error: "Failed to accept donation request" });
  }
});

router.post("/request-donation", isAuthenticated, async (req, res) => {
  try {
    const { title, description, quantity, requiredBy } = req.body;

    // Check if any field is missing
    if (!title || !description || !quantity || !requiredBy) {
      return res.status(400).json({ message: "All fields are required" });
    }

    //Save new request in MongoDB
    const newRequest = new DonationRequest({
      title,
      description,
      quantity,
      requiredBy: new Date(requiredBy),  // Convert to Date object
      ngoId: req.user._id,  // Logged-in NGO ID
    });

    await newRequest.save();
    res.status(201).json(newRequest);
  } catch (error) {
    console.error("Error creating donation request:", error);
    res.status(500).json({ message: "Failed to submit request" });
  }
});

// Get all requested donations by NGOs
router.get("/my-requests", isAuthenticated, hasRole(["ngo"]), async (req, res) => {
  try {
    const requests = await DonationRequest.find({ ngoId: req.user._id });
    res.json(requests);
  } catch (error) {
    console.error("Error fetching NGO requests:", error);
    res.status(500).json({ error: "Failed to fetch NGO requests" });
  }
});

module.exports = router;


