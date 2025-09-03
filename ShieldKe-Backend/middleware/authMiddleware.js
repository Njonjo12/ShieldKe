const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Protect middleware
 * - Checks for a valid JWT in Authorization header
 * - Attaches decoded user to req.user
 */
const protect = async (req, res, next) => {
  let token;

  try {
    // Check header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1]; // "Bearer <token>"

      if (!process.env.JWT_SECRET) {
        console.error('JWT_SECRET is missing in environment variables');
        return res.status(500).json({ message: 'Server misconfigured' });
      }

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Attach user (without password)
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({ message: 'User not found' });
      }

      return next();
    }

    // No token
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  } catch (err) {
    console.error('Auth middleware error:', err.message);
    return res.status(401).json({ message: 'Not authorized, invalid token' });
  }
};

module.exports = protect;
