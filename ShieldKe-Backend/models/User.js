const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({

  name:  { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },

  /* password not required for OAuth accounts */
  password: {
    type: String,
    required: function () { return this.authProvider === "local"; }
  },

  role: {
    type: String,
    enum: ["client", "lawyer", "admin"],
    required: true
  },

  /* ── OAuth ── */
  googleId:     { type: String, sparse: true },
  linkedinId:   { type: String, sparse: true },
  authProvider: {
    type: String,
    enum: ["local", "google", "linkedin"],
    default: "local"
  },

  /* ── Email verification ── */
  isEmailVerified:          { type: Boolean, default: false },
  emailVerificationToken:   { type: String  },
  emailVerificationExpires: { type: Date    },

  /* ── Password reset ── */
  resetPasswordToken:   { type: String },
  resetPasswordExpires: { type: Date   },

  /* ── Lawyer fields ── */
  specialization:    { type: String },
  yearsOfExperience: { type: Number },
  consultationFee:   { type: Number, default: 0 },
  lskNumber:         { type: String },
  practiceAreas:     [{ type: String }],
  location:          { type: String },
  bio:               { type: String },

  /* ── Admin/lawyer verification ── */
  verificationStatus: {
    type: String,
    enum: ["pending", "verified", "rejected"],
    default: "pending"
  },
  isVerified:             { type: Boolean, default: false },
  rejectionReason:        { type: String,  default: "" },
  canReapply:             { type: Boolean, default: true },
  verificationReviewedAt: { type: Date },
  verificationReviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  /* ── Documents & photo ── */
  barCertificate:        { type: String },
  practicingCertificate: { type: String },
  nationalIdDocument:    { type: String },
  profilePhoto:          { type: String }

}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
