const express = require("express");
const router = express.Router();
const User = require("../models/User");

/*
  GET ALL LAWYERS
*/
router.get("/", async (req, res) => {
  try {
    const lawyers = await User.find({ role: "lawyer" })
      .select("-password");

    res.json(lawyers);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

/*
  GET SINGLE LAWYER BY ID
*/
router.get("/:id", async (req, res) => {
  try {
    const lawyer = await User.findOne({
      _id: req.params.id,
      role: "lawyer"
    }).select("-password");

    if (!lawyer) {
      return res.status(404).json({ message: "Lawyer not found" });
    }

    res.json(lawyer);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
