const express = require("express");
const router = express.Router();
const budgetController = require("../controller/budgetController");

// GET all budgets
router.get("/", budgetController.getBudgets);

// GET budget by ID
router.get("/:id", budgetController.getBudgetById);

// CREATE budget
router.post("/", budgetController.createBudget);

// UPDATE budget
router.put("/:id", budgetController.updateBudget);

// DELETE budget
router.delete("/:id", budgetController.deleteBudget);

module.exports = router;
