const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");


const donationRequestSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  quantity: { type: Number, required: true },
  requiredBy: { type: Date, required: true },
  dietaryRequirements: [{ type: String, required: true }],
  ngoId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ["pending", "accepted", "rejected"], default: "pending" },
}, { timestamps: true });

const DonationRequest = mongoose.model("DonationRequest", donationRequestSchema);
module.exports = DonationRequest;

