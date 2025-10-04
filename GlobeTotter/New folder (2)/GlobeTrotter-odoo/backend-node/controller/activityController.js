const Activity = require("../models/Activity");
const Stop = require("../models/Stop");
const Trip = require("../models/Trip");

exports.getActivities = async (req, res) => {
  try {
    // Get user's trips first
    const userTrips = await Trip.find({ user: req.user._id }).select('_id');
    const tripIds = userTrips.map(trip => trip._id);
    
    // Get stops for user's trips
    const userStops = await Stop.find({ trip: { $in: tripIds } }).select('_id');
    const stopIds = userStops.map(stop => stop._id);

    const activities = await Activity.find({ stop: { $in: stopIds } })
      .populate({
        path: "stop",
        populate: [
          { path: "trip", select: "name primaryDestination" },
          { path: "city", select: "name country" }
        ]
      })
      .sort({ startTime: 1 });

    res.json(activities);
  } catch (err) {
    console.error("Error fetching activities:", err);
    res.status(500).json({ message: "Server error fetching activities" });
  }
};

exports.getActivityById = async (req, res) => {
  try {
    // Get user's trips first
    const userTrips = await Trip.find({ user: req.user._id }).select('_id');
    const tripIds = userTrips.map(trip => trip._id);
    
    // Get stops for user's trips
    const userStops = await Stop.find({ trip: { $in: tripIds } }).select('_id');
    const stopIds = userStops.map(stop => stop._id);

    const activity = await Activity.findOne({ 
      _id: req.params.id, 
      stop: { $in: stopIds } 
    })
      .populate({
        path: "stop",
        populate: [
          { path: "trip", select: "name primaryDestination" },
          { path: "city", select: "name country" }
        ]
      });

    if (!activity) return res.status(404).json({ message: "Activity not found" });

    res.json(activity);
  } catch (err) {
    console.error("Error fetching activity:", err);
    res.status(500).json({ message: "Server error fetching activity" });
  }
};

exports.createActivity = async (req, res) => {
  try {
    const activity = new Activity(req.body);
    await activity.save();
    res.status(201).json(activity);
  } catch (err) {
    console.error("Error creating activity:", err);
    res.status(400).json({ message: "Invalid activity data" });
  }
};

exports.updateActivity = async (req, res) => {
  try {
    const activity = await Activity.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!activity) return res.status(404).json({ message: "Activity not found" });

    res.json(activity);
  } catch (err) {
    console.error("Error updating activity:", err);
    res.status(400).json({ message: "Invalid activity update data" });
  }
};

exports.deleteActivity = async (req, res) => {
  try {
    const activity = await Activity.findByIdAndDelete(req.params.id);
    if (!activity) return res.status(404).json({ message: "Activity not found" });

    res.json({ message: "Activity deleted successfully" });
  } catch (err) {
    console.error("Error deleting activity:", err);
    res.status(500).json({ message: "Server error deleting activity" });
  }
};
