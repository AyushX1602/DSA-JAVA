const mongoose = require("mongoose");

const ngoSchema = new mongoose.Schema({
  name: { type: String, required: true },
  registrationNumber: { type: String, required: true },
  contactPersonName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  latitude : { type: Number, required: true },
  longitude : { type: Number, required: true },
  areasServed: [{ type: String }],
  beneficiariesCount: { type: Number, default: 0 },
  quantity: { type: Number, required: true },
  foodType: [{ type: String }],
  registrationCertificate: { type: String, required: true },
  fssaiCompliance: { type: String, required: true },
  pickupTiming: [{ type: String }],
  termsAccepted: { type: Boolean, required: true },
  status: { 
    type: String, 
    enum: ["pending",'rejected','approved'], 
    default: "pending" 
  },
});

const NGO = mongoose.model("NGO", ngoSchema);
module.exports = NGO;

