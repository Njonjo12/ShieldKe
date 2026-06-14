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

  phone: {
    type: String
  },

  password: {
    type: String,
    required: true
  },

  role: {
    type: String,
    enum: ["client", "lawyer", "admin"],
    required: true
  },

  // LAWYER FIELDS

  specialization: {
    type: String
  },

  yearsOfExperience: {
    type: Number
  },

  consultationFee: {
    type: Number,
    default: 0
  },

  lskNumber: {
    type: String
  },

  practiceAreas: [
    {
      type: String
    }
  ],

  location: {
    type: String
  },

  bio: {
    type: String
  },

  // VERIFICATION

  verificationStatus: {
    type: String,
    enum: ["pending", "verified", "rejected"],
    default: "pending"
  },

  isVerified: {
    type: Boolean,
    default: false
  },

  rejectionReason: {
    type: String,
    default: ""
  },

  canReapply: {
    type: Boolean,
    default: true
  },

  verificationReviewedAt: {
    type: Date
  },

  verificationReviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  // DOCUMENTS

  barCertificate: {
    type: String
  },

  practicingCertificate: {
    type: String
  },

  nationalIdDocument: {
    type: String
  },

  profilePhoto: {
    type: String
  }

}, { timestamps: true });

const User = mongoose.model("User", userSchema);

module.exports = User;