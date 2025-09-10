// routes/auth.js
const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const { register, login, getMe } = require('../controllers/authController');

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', register);

// @route   POST /api/auth/login
// @desc    Login user & get token
// @access  Public
router.post('/login', login);

// @route   GET /api/auth/me
// @desc    Get logged-in user info
// @access  Private
router.get('/me', verifyToken, getMe);

module.exports = router;
