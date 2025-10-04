const express = require('express');
const router = express.Router();
const Donation = require('../models/Donation');
const DonationRequest = require('../models/requestDonation');

const { isAuthenticated, hasRole } = require('../middlewares/authMiddleware');

// Route to handle donation form submission
router.post('/add', isAuthenticated, hasRole(['donor']), async (req, res) => {
  try {
    const donation = new Donation({ ...req.body, donorId: req.user._id }); //Associate donation with donor
    await donation.save();
    res.status(201).json({ message: 'Donation saved successfully!' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save donation' });
  }
});


//Route to fetch all donations made by the logged-in donor
const mongoose = require('mongoose');

router.get("/", isAuthenticated, hasRole(["donor"]), async (req, res) => {
  try {
    console.log("Authenticated User ID:", req.user._id);

    const donorId = new mongoose.Types.ObjectId(req.user._id); // Ensure ObjectId
    const donations = await Donation.find({ donorId });

    // Add a correct status field
    const formattedDonations = donations.map((donation) => ({
      ...donation._doc,
      status: donation.ngoApproved
        ? donation.claimedBy
          ? donation.deliveredAt
            ? "completed"
            : "claimed"
          : "ngo_approved"
        : "pending",
    }));

    console.log("Formatted Donations with Status:", formattedDonations); //Debugging

    res.json(formattedDonations);
  } catch (error) {
    console.error("Error fetching donations:", error);
    res.status(500).json({ error: "Failed to fetch donations" });
  }
});

router.post("/request-donation", isAuthenticated, async (req, res) => {
  try {
    const { title, description, quantity, requiredBy, dietaryRequirements } = req.body;

    // Check if any field is missing
    if (!title || !description || !quantity || !requiredBy) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Save new request in MongoDB
    const newRequest = new DonationRequest({
      title,
      description,
      quantity,
      dietaryRequirements,
      requiredBy: new Date(requiredBy), // Convert to Date object
      requestedBy: req.user._id, // Logged-in NGO
    });

    await newRequest.save();
    res.status(201).json(newRequest);
  } catch (error) {
    console.error(" Error creating donation request:", error);
    res.status(500).json({ message: "Failed to submit request" });
  }
});

// Get all requested donations by NGOs
router.get("/my-requests", isAuthenticated, hasRole(["donor"]), async (req, res) => {
  try {
    // Fetch requests from the DonationRequest model
    const requests = await DonationRequest.find();
    res.json(requests);
  } catch (error) {
    console.error("Error fetching NGO requests:", error);
    res.status(500).json({ error: "Failed to fetch NGO requests" });
  }
});

router.post("/requests/:id/accept", isAuthenticated, hasRole(["donor"]), async (req, res) => {
  try {
    const requestId = req.params.id;

    // Find the donation request
    const request = await DonationRequest.findById(requestId);
    if (!request) return res.status(404).json({ error: "Request not found" });

    // Convert the request into a donation
    const newDonation = new Donation({
      title: request.title,
      description: request.description,
      quantity: request.quantity,
      pickupTime: request.requiredBy, // Assuming 'requiredBy' is the intended date
      donorId: req.user._id, // Associate with the donor who accepted
      ngoId: request.ngoId, // The NGO that requested
      status: "pending", // Mark as pending until NGO approval
    });

    await newDonation.save();

    // Remove the request after conversion to donation
    await DonationRequest.findByIdAndDelete(requestId);

    res.status(200).json({ message: "Request accepted and converted into a donation", donation: newDonation });
  } catch (error) {
    console.error("Error accepting NGO request:", error);
    res.status(500).json({ error: "Failed to accept donation request" });
  }
});


module.exports = router;
