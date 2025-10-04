// models/Stop.js
const mongoose = require("mongoose");

const stopSchema = new mongoose.Schema({
  trip: { type: mongoose.Schema.Types.ObjectId, ref: "Trip", required: true },
  city: { type: mongoose.Schema.Types.ObjectId, ref: "City", required: true },
  arrivalDate: Date,
  departureDate: Date,
  activities: [{ type: mongoose.Schema.Types.ObjectId, ref: "Activity" }],
}, { timestamps: true });

module.exports = mongoose.model("Stop", stopSchema);
