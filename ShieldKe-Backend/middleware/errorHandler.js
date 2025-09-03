// middleware/errorHandler.js

// Custom error handler middleware
const errorHandler = (err, req, res, next) => {
    console.error(err.stack);
  
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Internal Server Error';
  
    // Handle specific known error types
    if (err.name === 'ValidationError') {
      statusCode = 400;
      message = Object.values(err.errors).map(val => val.message).join(', ');
    }
  
    if (err.name === 'CastError') {
      statusCode = 400;
      message = `Invalid ${err.path}: ${err.value}`;
    }
  
    if (err.code && err.code === 11000) {
      statusCode = 400;
      message = 'Duplicate field value entered';
    }
  
    if (err.name === 'JsonWebTokenError') {
      statusCode = 401;
      message = 'Invalid token, not authorized';
    }
  
    if (err.name === 'TokenExpiredError') {
      statusCode = 401;
      message = 'Token expired, please log in again';
    }
  
    res.status(statusCode).json({
      success: false,
      error: message,
      stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
    });
  };
  
  module.exports = errorHandler;
  