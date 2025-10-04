const express = require("express");
const router = express.Router();
const Donation = require("../models/Donation");
const Volunteer = require("../models/Volunteer");
const { isAuthenticated, hasRole } = require("../middlewares/authMiddleware");

// Get all volunteers
router.get("/", async (req, res) => {
  try {
    const volunteers = await Volunteer.find();
    res.json(volunteers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Volunteer Registration Route
router.post('/register', async (req, res) => {
  try {
    const newVolunteer = new Volunteer(req.body);
    await newVolunteer.save();
    res.status(201).json({ message: 'Volunteer registered successfully' });
  } catch (error) {
    console.error('Error saving volunteer:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;


// Route to fetch all NGO-approved donations
router.get("/approved-donations", isAuthenticated, hasRole(["volunteer"]), async (req, res) => {
  try {
      console.log("Fetching approved donations for volunteers...");

      const volunteerId = req.user._id; // Get logged-in volunteer ID

      // Fetch Available Pickups (Unclaimed Donations)
      const availableDonations = await Donation.find({ ngoApproved: true, claimedBy: null }).sort({ createdAt: -1 });

      // Fetch Active Deliveries (Claimed by this Volunteer)
      const activeDeliveries = await Donation.find({ claimedBy: volunteerId, status: "claimed" }).sort({ createdAt: -1 });

      console.log("Available Donations:", availableDonations);
      console.log("Active Deliveries:", activeDeliveries);

      res.json({ availableDonations, activeDeliveries });
  } catch (error) {
      console.error("Error fetching approved donations:", error);
      res.status(500).json({ error: "Failed to fetch approved donations" });
  }
});


router.post("/claim/:donationId", isAuthenticated, hasRole(["volunteer"]), async (req, res) => {
  try {
      const { donationId } = req.params;
      const volunteerId = req.user._id; // Get logged-in volunteer ID

      const donation = await Donation.findById(donationId);
      if (!donation) return res.status(404).json({ error: "Donation not found" });

      // ✅ Update donation as claimed
      donation.claimedBy = volunteerId;
      donation.status = "claimed";
      await donation.save();

      res.json({ message: "Donation claimed successfully", donation });
  } catch (error) {
      console.error("Error claiming donation:", error);
      res.status(500).json({ error: "Failed to claim donation" });
  }
});


router.get("/active-deliveries", isAuthenticated, hasRole(["volunteer"]), async (req, res) => {
  try {
      console.log("Fetching active deliveries for volunteer:", req.user._id);

      const activeDeliveries = await Donation.find({
          claimedBy: req.user._id, // Only fetch deliveries claimed by this volunteer
          status: "claimed",
      }).sort({ claimedAt: -1 });

      console.log("Active Deliveries Found:", activeDeliveries);
      res.json(activeDeliveries);
  } catch (error) {
      console.error("Error fetching active deliveries:", error);
      res.status(500).json({ error: "Failed to fetch active deliveries" });
  }
});

router.post("/complete/:donationId", isAuthenticated, hasRole(["volunteer"]), async (req, res) => {
  try {
    const { donationId } = req.params;
    const volunteerId = req.user._id; // Get the logged-in volunteer's ID

    const donation = await Donation.findById(donationId);
    if (!donation) return res.status(404).json({ message: "Donation not found" });

    if (donation.claimedBy.toString() !== volunteerId.toString()) {
      return res.status(403).json({ message: "You are not assigned to this donation" });
    }

    if (donation.status === "completed") {
      return res.status(400).json({ message: "This delivery has already been completed" });
    }

    donation.status = "completed"; // Mark as completed
    await donation.save();

    res.json({ message: "Delivery completed successfully", donation });
  } catch (error) {
    console.error("Error completing delivery:", error);
    res.status(500).json({ error: "Failed to complete delivery" });
  }
});



module.exports = router;

