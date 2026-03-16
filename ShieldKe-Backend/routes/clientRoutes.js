const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");

const {
  createClientProfile,
  getClientProfile
} = require("../controllers/clientController");

router.post("/profile", protect, createClientProfile);
router.get("/profile", protect, getClientProfile);

module.exports = router;
