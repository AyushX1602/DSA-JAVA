const mongoose = require('mongoose');

const { v4: uuidv4 } = require("uuid");

const donationSchema = new mongoose.Schema({
  title: String,
  description: String,
  quantity: Number,
  expiryDate: String,
  pickupAddress: String,
  pickupTime: String,
  photo: String, 
  donorName: String,
  donorPhone: String,
  latitude: Number,
  longitude: Number,
  foodType: String,
  donorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  ngoApproved: { type: Boolean, default: false },  //  Approval status
  ngoId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, //  NGO who approved


  // NEW FIELDS TO TRACK DELIVERY STATUS
  status: { 
    type: String, 
    enum: ["pending", "ngoApproved", "claimed", "completed",'rejected','approved'], 
    default: "pending" 
  },
  claimedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }, // Volunteer ID
  claimedAt: { type: Date, default: null } // Timestamp when claimed
});

const Donation = mongoose.model('Donation', donationSchema);
module.exports = Donation;

