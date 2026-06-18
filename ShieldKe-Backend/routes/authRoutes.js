const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");

const upload = require("../middleware/upload");

const {
  registerUser,
  loginUser,
  getMe
} = require("../controllers/authController");

const User = require("../models/User");


// REGISTER

router.post(

  "/register",

  upload.fields([
    { name: "barCertificate", maxCount: 1 },
    { name: "practicingCertificate", maxCount: 1 },
    { name: "nationalIdDocument", maxCount: 1 },
    { name: "profilePhoto", maxCount: 1 }
  ]),

  registerUser

);


// LOGIN

router.post("/login", loginUser);


// CURRENT USER

router.get("/me", protect, getMe);


// GET LAWYERS

router.get("/lawyers", async (req, res) => {

  try {

    const lawyers = await User.find({
      role: "lawyer",
      isVerified: true
    }).select("-password");

    res.json(lawyers);

  } catch (err) {

    console.error("Fetch lawyers error:", err);

    res.status(500).json({
      error: "Failed to fetch lawyers"
    });

  }

});


// ADMIN VERIFY LAWYER

router.put(
  "/verify-lawyer/:id",
  async (req, res) => {

    try {

      const lawyer = await User.findById(req.params.id);

      if (!lawyer) {
        return res.status(404).json({
          message: "Lawyer not found"
        });
      }

      lawyer.isVerified = true;
      lawyer.verificationStatus = "verified";

      await lawyer.save();

      res.json({
        message: "Lawyer verified successfully"
      });

    } catch (error) {

      console.error(error);

      res.status(500).json({
        message: "Server error"
      });

    }

  }
);

module.exports = router;