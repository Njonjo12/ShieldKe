const express = require("express");
const router  = express.Router();

const { protect } = require("../middleware/authMiddleware");
const upload      = require("../middleware/upload");
const User        = require("../models/User");

const {
  registerUser,
  verifyEmail,
  resendVerification,
  loginUser,
  forgotPassword,
  resetPassword,
  googleAuth,
  linkedinAuthRedirect,
  linkedinAuthCallback,
  getMe,
} = require("../controllers/authController");


/* ── REGISTER ── */
router.post("/register",
  upload.fields([
    { name: "barCertificate",        maxCount: 1 },
    { name: "practicingCertificate", maxCount: 1 },
    { name: "nationalIdDocument",    maxCount: 1 },
    { name: "profilePhoto",          maxCount: 1 },
  ]),
  registerUser
);

/* ── EMAIL VERIFICATION ── */
router.get("/verify-email/:token",  verifyEmail);
router.post("/resend-verification", resendVerification);

/* ── LOGIN ── */
router.post("/login", loginUser);

/* ── PASSWORD RESET ── */
router.post("/forgot-password",      forgotPassword);
router.post("/reset-password/:token", resetPassword);

/* ── GOOGLE OAUTH ── */
router.post("/google", googleAuth);

/* ── LINKEDIN OAUTH ── */
router.get("/linkedin",          linkedinAuthRedirect);
router.get("/linkedin/callback", linkedinAuthCallback);

/* ── CURRENT USER ── */
router.get("/me", protect, getMe);


/* ── GET VERIFIED LAWYERS (kept from original) ── */
router.get("/lawyers", async (req, res) => {
  try {
    const lawyers = await User.find({ role: "lawyer", isVerified: true }).select("-password");
    res.json(lawyers);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch lawyers" });
  }
});

/* ── ADMIN VERIFY LAWYER (kept from original) ── */
router.put("/verify-lawyer/:id", async (req, res) => {
  try {
    const lawyer = await User.findById(req.params.id);
    if (!lawyer) return res.status(404).json({ message: "Lawyer not found" });
    lawyer.isVerified         = true;
    lawyer.verificationStatus = "verified";
    await lawyer.save();
    res.json({ message: "Lawyer verified successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
