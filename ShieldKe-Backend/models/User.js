const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({

  name: {
    type: String,
    required: true
  },

  email: {
    type: String,
    required: true,
    unique: true
  },

  password: {
    type: String,
    required: true
  },

  role: {
    type: String,
    enum: ["client", "lawyer"],
    required: true
  },

  practiceArea: String,
  location: String,
  experience: Number,
  consultationFee: Number,
  bio: String

}, { timestamps: true });

const User = mongoose.model("User", userSchema);

module.exports = User;
