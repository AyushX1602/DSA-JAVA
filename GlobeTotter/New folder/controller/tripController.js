const Trip = require("../models/Trip");
const Stop = require("../models/Stop");
const Budget = require("../models/Budget");

exports.createTrip = async (req, res) => {
  try {
    const { name, description, startDate, endDate, stops, budgets } = req.body;

    const trip = await Trip.create({
      user: req.user._id, 
      name,
      description,
      primaryDestination: stops && stops.length > 0 ? stops[0].destination : null,
      startDate,
      endDate,
      stops,   
      budgets, 
    });

    res.status(201).json(trip);
  } catch (err) {
    console.error("Error creating trip:", err);
    res.status(500).json({ error: "Failed to create trip" });
  }
};


exports.getTrips = async (req, res) => {
  try {
    const trips = await Trip.find({ user: req.user._id })
      .populate("stops")
      .populate("budgets");

    res.json(trips);
  } catch (err) {
    console.error("Error fetching trips:", err);
    res.status(500).json({ error: "Failed to fetch trips" });
  }
};

exports.getTripById = async (req, res) => {
  try {
    const trip = await Trip.findOne({ _id: req.params.id, user: req.user._id })
      .populate("stops")
      .populate("budgets");

    if (!trip) return res.status(404).json({ error: "Trip not found" });
    res.json(trip);
  } catch (err) {
    console.error("Error fetching trip:", err);
    res.status(500).json({ error: "Failed to fetch trip" });
  }
};


exports.updateTrip = async (req, res) => {
  try {
    const updatedTrip = await Trip.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true }
    );

    if (!updatedTrip) return res.status(404).json({ error: "Trip not found" });
    res.json(updatedTrip);
  } catch (err) {
    console.error("Error updating trip:", err);
    res.status(500).json({ error: "Failed to update trip" });
  }
};

exports.deleteTrip = async (req, res) => {
  try {
    const deletedTrip = await Trip.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!deletedTrip) return res.status(404).json({ error: "Trip not found" });
    res.json({ message: "Trip deleted successfully" });
  } catch (err) {
    console.error("Error deleting trip:", err);
    res.status(500).json({ error: "Failed to delete trip" });
  }
};
