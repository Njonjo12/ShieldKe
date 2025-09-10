// routes/client.js
const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const { createClientProfile, getClientProfile } = require('../controllers/clientController');
const protect = require('../middleware/authMiddleware');

// @route   POST /api/client/profile
// @desc    Create or update client profile
// @access  Private
router.post('/profile', verifyToken, createClientProfile);

// @route   GET /api/client/profile
// @desc    Get logged-in client profile
// @access  Private
router.get('/profile', verifyToken, getClientProfile);

router.post('/profile', protect, createClientProfile);
router.get('/profile', protect, getClientProfile);

module.exports = router;
