// models/City.js
const mongoose = require("mongoose");

const citySchema = new mongoose.Schema({
  name: { type: String, required: true },
  country: { type: String, required: true },
  description: String,
}, { timestamps: true });

module.exports = mongoose.model("City", citySchema);
