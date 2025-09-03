// routes/lawyer.js
const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const { createLawyerProfile, getLawyerProfile } = require('../controllers/lawyerController');
const protect = require('../middleware/authMiddleware');

// @route   POST /api/lawyer/profile
// @desc    Create or update lawyer profile
// @access  Private
router.post('/profile', verifyToken, createLawyerProfile);

// @route   GET /api/lawyer/profile
// @desc    Get logged-in lawyer profile
// @access  Private
router.get('/profile', verifyToken, getLawyerProfile);

// ✅ Wrap routes with protect
router.post('/profile', protect, createLawyerProfile);
router.get('/profile', protect, getLawyerProfile);

module.exports = router;
