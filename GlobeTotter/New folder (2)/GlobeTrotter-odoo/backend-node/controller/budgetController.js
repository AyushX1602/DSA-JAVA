const Budget = require("../models/Budget");
const Trip = require("../models/Trip");

exports.getBudgets = async (req, res) => {
  try {
    // Get user's trips first
    const userTrips = await Trip.find({ user: req.user._id }).select('_id');
    const tripIds = userTrips.map(trip => trip._id);

    const budgets = await Budget.find({ trip: { $in: tripIds } })
      .populate("trip", "name primaryDestination") 
      .populate("activity", "name description") 
      .sort({ createdAt: -1 });

    res.json(budgets);
  } catch (err) {
    console.error("Error fetching budgets:", err);
    res.status(500).json({ message: "Server error fetching budgets" });
  }
};

exports.getBudgetById = async (req, res) => {
  try {
    // Get user's trips first
    const userTrips = await Trip.find({ user: req.user._id }).select('_id');
    const tripIds = userTrips.map(trip => trip._id);

    const budget = await Budget.findOne({ 
      _id: req.params.id, 
      trip: { $in: tripIds } 
    })
      .populate("trip", "name primaryDestination")
      .populate("activity", "name description");

    if (!budget) return res.status(404).json({ message: "Budget not found" });

    res.json(budget);
  } catch (err) {
    console.error("Error fetching budget:", err);
    res.status(500).json({ message: "Server error fetching budget" });
  }
};

exports.createBudget = async (req, res) => {
  try {
    const budget = new Budget(req.body);
    await budget.save();
    res.status(201).json(budget);
  } catch (err) {
    console.error("Error creating budget:", err);
    res.status(400).json({ message: "Invalid budget data" });
  }
};

exports.updateBudget = async (req, res) => {
  try {
    const budget = await Budget.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!budget) return res.status(404).json({ message: "Budget not found" });

    res.json(budget);
  } catch (err) {
    console.error("Error updating budget:", err);
    res.status(400).json({ message: "Invalid budget update data" });
  }
};

exports.deleteBudget = async (req, res) => {
  try {
    const budget = await Budget.findByIdAndDelete(req.params.id);
    if (!budget) return res.status(404).json({ message: "Budget not found" });

    res.json({ message: "Budget deleted successfully" });
  } catch (err) {
    console.error("Error deleting budget:", err);
    res.status(500).json({ message: "Server error deleting budget" });
  }
};
