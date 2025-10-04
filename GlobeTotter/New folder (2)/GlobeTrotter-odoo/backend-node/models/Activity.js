const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema({
  stop: { type: mongoose.Schema.Types.ObjectId, ref: "Stop", required: true },
  name: { type: String, required: true },
  description: String,
  startTime: Date,
  endTime: Date,
  cost: Number, 
}, { timestamps: true });

module.exports = mongoose.model("Activity", activitySchema);
