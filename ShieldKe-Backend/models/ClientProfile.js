// models/ClientProfile.js
const mongoose = require('mongoose');

const ClientProfileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  phone: { type: String },
  location: { type: String },
  description: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('ClientProfile', ClientProfileSchema);
