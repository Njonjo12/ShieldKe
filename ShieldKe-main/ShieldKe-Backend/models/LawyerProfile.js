// models/LawyerProfile.js
const mongoose = require('mongoose');

const LawyerProfileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  licenseNumber: { type: String, required: true },
  yearsOfExperience: { type: Number, required: true },
  practiceAreas: [{ type: String }], // e.g., ['Family Law', 'Corporate Law']
  phone: { type: String },
  location: { type: String },
  bio: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('LawyerProfile', LawyerProfileSchema);
