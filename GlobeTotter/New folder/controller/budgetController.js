const Budget = require("../models/Budget");

exports.getBudgets = async (req, res) => {
  try {
    const budgets = await Budget.find()
      .populate("trip", "name destination") // populate trip name & destination
      .populate("activity", "name description") // populate activity details if linked
      .sort({ createdAt: -1 });

    res.json(budgets);
  } catch (err) {
    console.error("Error fetching budgets:", err);
    res.status(500).json({ message: "Server error fetching budgets" });
  }
};

exports.getBudgetById = async (req, res) => {
  try {
    const budget = await Budget.findById(req.params.id)
      .populate("trip", "name destination")
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
