const { registerUser, loginUser } = require('../Services/authServices');
const { createAndSendOTP, verifyOTP } = require('../Services/Otpservices');

// @desc    Register user
// @route   POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide all fields' });
    }

    // Register user
    const result = await registerUser(name, email, password);

    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Login user
    const result = await loginUser(email, password);

    res.json(result);
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
};

// @desc    Send OTP
// @route   POST /api/auth/send-otp
const sendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Please provide email' });
    }

    const result = await createAndSendOTP(email);

    res.json({
      message: 'OTP sent successfully',
      emailSent: result.emailSent,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
const verifyOTPController = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Please provide email and OTP' });
    }

    const result = await verifyOTP(email, otp);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  register,
  login,
  sendOTP,
  verifyOTPController,
};
