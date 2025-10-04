const Activity = require("../models/Activity");

exports.getActivities = async (req, res) => {
  try {
    const activities = await Activity.find()
      .populate("stop", "name location") // populate stop details
      .sort({ startTime: 1 });

    res.json(activities);
  } catch (err) {
    console.error("Error fetching activities:", err);
    res.status(500).json({ message: "Server error fetching activities" });
  }
};

exports.getActivityById = async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id)
      .populate("stop", "name location");

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
