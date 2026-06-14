const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');

// Example protected route
router.get('/dashboard', verifyToken, (req, res) => {
  res.json({
    message: `Welcome ${req.user.role}!`,
    userId: req.user.id,
  });
});

module.exports = router;
