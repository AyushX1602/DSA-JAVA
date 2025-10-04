const express = require("express");
const router = express.Router();
const budgetController = require("../controller/budgetController");
const { protect } = require("../middleware/authMiddleware");

// GET all budgets
router.get("/", protect, budgetController.getBudgets);

// GET budget by ID
router.get("/:id", protect, budgetController.getBudgetById);

// CREATE budget
router.post("/", protect, budgetController.createBudget);

// UPDATE budget
router.put("/:id", protect, budgetController.updateBudget);

// DELETE budget
router.delete("/:id", protect, budgetController.deleteBudget);

module.exports = router;
