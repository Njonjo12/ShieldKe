const express = require("express");

const router = express.Router();

const User = require("../models/User");
const Consultation = require("../models/Consultation");

const { protect } =
  require("../middleware/authMiddleware");


/*
========================================
ADMIN CHECK
========================================
*/

const adminOnly = async (req, res, next) => {

  try {

    const admin = await User.findById(req.user._id);

    if (!admin || admin.role !== "admin") {

      return res.status(403).json({
        message: "Admin access only"
      });

    }

    next();

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Server error"
    });

  }

};


/*
========================================
GET ALL LAWYERS
========================================
*/

router.get(

  "/lawyers",

  protect,

  adminOnly,

  async (req, res) => {

    try {

      const lawyers = await User.find({
        role: "lawyer"
      }).select("-password");

      res.json(lawyers);

    } catch (error) {

      console.error(error);

      res.status(500).json({
        message: "Server error"
      });

    }

  }

);


/*
========================================
GET PENDING LAWYERS
========================================
*/

router.get(

  "/pending-lawyers",

  protect,

  adminOnly,

  async (req, res) => {

    try {

      const lawyers = await User.find({

        role: "lawyer",

        verificationStatus: "pending"

      }).select("-password");

      res.json(lawyers);

    } catch (error) {

      console.error(error);

      res.status(500).json({
        message: "Server error"
      });

    }

  }

);


/*
========================================
GET VERIFIED LAWYERS
========================================
*/

router.get(

  "/verified-lawyers",

  protect,

  adminOnly,

  async (req, res) => {

    try {

      const lawyers = await User.find({

        role: "lawyer",

        verificationStatus: "verified"

      }).select("-password");

      res.json(lawyers);

    } catch (error) {

      console.error(error);

      res.status(500).json({
        message: "Server error"
      });

    }

  }

);


/*
========================================
GET REJECTED LAWYERS
========================================
*/

router.get(

  "/rejected-lawyers",

  protect,

  adminOnly,

  async (req, res) => {

    try {

      const lawyers = await User.find({

        role: "lawyer",

        verificationStatus: "rejected"

      }).select("-password");

      res.json(lawyers);

    } catch (error) {

      console.error(error);

      res.status(500).json({
        message: "Server error"
      });

    }

  }

);


/*
========================================
APPROVE LAWYER
========================================
*/

router.put(

  "/approve-lawyer/:id",

  protect,

  adminOnly,

  async (req, res) => {

    try {

      const lawyer =
        await User.findById(req.params.id);

      if (!lawyer) {

        return res.status(404).json({
          message: "Lawyer not found"
        });

      }

      lawyer.isVerified = true;

      lawyer.verificationStatus =
        "verified";

      lawyer.rejectionReason = "";

      await lawyer.save();

      res.json({
        message: "Lawyer approved"
      });

    } catch (error) {

      console.error(error);

      res.status(500).json({
        message: "Server error"
      });

    }

  }

);


/*
========================================
REJECT LAWYER
========================================
*/

router.put(

  "/reject-lawyer/:id",

  protect,

  adminOnly,

  async (req, res) => {

    try {

      const { rejectionReason } = req.body;

      const lawyer =
        await User.findById(req.params.id);

      if (!lawyer) {

        return res.status(404).json({
          message: "Lawyer not found"
        });

      }

      lawyer.isVerified = false;

      lawyer.verificationStatus =
        "rejected";

      lawyer.rejectionReason =
        rejectionReason || "";

      await lawyer.save();

      res.json({
        message: "Lawyer rejected"
      });

    } catch (error) {

      console.error(error);

      res.status(500).json({
        message: "Server error"
      });

    }

  }

);

/*
========================================
GET ALL USERS (clients + lawyers)
Powers the admin "Users" sidebar tab.
========================================
*/

router.get(
  "/users",
  protect,
  adminOnly,
  async (req, res) => {

    try {

      const users = await User.find({})
        .select("-password")
        .sort({ createdAt: -1 });

      res.json(users);

    } catch (error) {

      console.error(error);

      res.status(500).json({
        message: "Server error"
      });

    }

  }

);


/*
========================================
GET ALL CONSULTATIONS (platform-wide)
Powers the admin "Consultations" sidebar
tab. Requires the Consultation model.
========================================
*/

router.get(
  "/consultations",
  protect,
  adminOnly,
  async (req, res) => {

    try {

      const consultations = await Consultation.find({})
        .populate("client", "name email")
        .populate("lawyer", "name email specialization")
        .sort({ createdAt: -1 });

      res.json(consultations);

    } catch (error) {

      console.error(error);

      res.status(500).json({
        message: "Server error"
      });

    }

  }

);

module.exports = router;