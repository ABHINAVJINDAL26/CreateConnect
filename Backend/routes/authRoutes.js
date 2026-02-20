const express = require('express');
const router = express.Router();
const {
  register,
  login,
  sendOTP,
  verifyOTPController,
} = require('../controllers/authController');

// @route   POST /api/auth/register
// @desc    Register a new user
router.post('/register', register);

// @route   POST /api/auth/login
// @desc    Login user
router.post('/login', login);

// @route   POST /api/auth/send-otp
// @desc    Send OTP to email
router.post('/send-otp', sendOTP);

// @route   POST /api/auth/verify-otp
// @desc    Verify OTP
router.post('/verify-otp', verifyOTPController);

module.exports = router;
