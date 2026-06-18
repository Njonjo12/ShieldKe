const express = require("express");

const router = express.Router();

const User = require("../models/User");
const upload = require("../middleware/upload");
const { protect } = require("../middleware/authMiddleware");

/*
========================================
UPDATE PROFILE PHOTO
profilePhoto lives on the User model.
Placed first by convention; the existing
GET /:id below uses a different HTTP verb
so there's no actual route collision.
========================================
*/

router.put(
  "/profile/photo",
  protect,
  upload.single("profilePhoto"),
  async (req, res) => {

    try {

      if (!req.file) {
        return res.status(400).json({
          message: "No photo uploaded"
        });
      }

      const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        { profilePhoto: req.file.path },
        { new: true }
      ).select("-password");

      res.json({ user: updatedUser });

    } catch (error) {

      console.error("Lawyer photo upload error:", error);

      res.status(500).json({
        message: "Could not update photo"
      });

    }

  }
);

/*
========================================
GET VERIFIED LAWYERS ONLY
========================================
*/

router.get("/", async (req, res) => {

  try {

    const lawyers =
      await User.find({

        role: "lawyer",

        isVerified: true,

        verificationStatus: "verified"

      })

      .select("-password")

      .sort({ createdAt: -1 });

    res.json(lawyers);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Server error"
    });

  }

});


/*
========================================
GET SINGLE LAWYER
========================================
*/

router.get("/:id", async (req, res) => {

  try {

    const lawyer =
      await User.findOne({

        _id: req.params.id,

        role: "lawyer",

        isVerified: true,

        verificationStatus: "verified"

      })

      .select("-password");

    if (!lawyer) {

      return res.status(404).json({
        message:
          "Lawyer not found or not verified"
      });

    }

    res.json(lawyer);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Server error"
    });

  }

});

module.exports = router;