const mongoose = require("mongoose");

const budgetSchema = new mongoose.Schema({
  trip: { type: mongoose.Schema.Types.ObjectId, ref: "Trip", required: true },
  category: { type: String, enum: ["transport", "accommodation", "food", "activity", "other"], required: true },
  amount: { type: Number, required: true },
  activity: { type: mongoose.Schema.Types.ObjectId, ref: "Activity" }, // optional link
  notes: String,
}, { timestamps: true });

module.exports = mongoose.model("Budget", budgetSchema);
