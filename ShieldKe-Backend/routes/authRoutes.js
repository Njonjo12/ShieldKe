
const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");

const {
  registerUser,
  loginUser,
  getMe
} = require("../controllers/authController");

const User = require("../models/User"); // <-- ADD THIS

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", protect, getMe);


/* GET ALL LAWYERS */

router.get("/lawyers", async (req, res) => {

  try {

    const lawyers = await User.find({ role: "lawyer" }).select("-password");

    res.json(lawyers);

  } catch (err) {

    console.error("Fetch lawyers error:", err);

    res.status(500).json({ error: "Failed to fetch lawyers" });

  }

});


module.exports = router;
