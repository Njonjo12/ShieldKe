const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");
const User = require("../models/User");

const {
  createClientProfile,
  getClientProfile
} = require("../controllers/clientController");

router.post("/profile", protect, createClientProfile);
router.get("/profile", protect, getClientProfile);

/*
========================================
UPDATE PROFILE PHOTO
profilePhoto lives on the User model
(same place /auth/register writes it),
not on the ClientProfile sub-document.
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

      console.error("Client photo upload error:", error);

      res.status(500).json({
        message: "Could not update photo"
      });

    }

  }
);

module.exports = router;
