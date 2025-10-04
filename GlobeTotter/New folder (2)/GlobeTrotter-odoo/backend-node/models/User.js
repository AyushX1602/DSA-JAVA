const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
    username: { type: String, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },

    tripsCreated: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Trip" }
    ],
    tripsJoined: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Trip" }
    ]
  },
  { timestamps: true });

  module.exports = mongoose.model("User", userSchema);
