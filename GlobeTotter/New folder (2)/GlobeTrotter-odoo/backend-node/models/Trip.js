const mongoose = require("mongoose");

const tripSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  primaryDestination: { type: String },
  description: String,
  startDate: Date,
  endDate: Date,
  stops: [{ type: mongoose.Schema.Types.ObjectId, ref: "Stop" }],
  budgets: [{ type: mongoose.Schema.Types.ObjectId, ref: "Budget" }],
  coverImage: String,
  isPublic: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model("Trip", tripSchema);
