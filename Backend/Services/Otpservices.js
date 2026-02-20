const Otp = require('../models/Otp');
const nodemailer = require('nodemailer');

// Generate random 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP via email
const sendOTPEmail = async (email, otp) => {
  try {
    // Configure nodemailer (update with your email service)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your OTP for Verification',
      html: `
        <h2>OTP Verification</h2>
        <p>Your OTP is: <strong>${otp}</strong></p>
        <p>This OTP will expire in 5 minutes.</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

// Create and send OTP
const createAndSendOTP = async (email) => {
  try {
    // Delete any existing OTPs for this email
    await Otp.deleteMany({ email });

    // Generate new OTP
    const otp = generateOTP();

    // Save OTP to database
    await Otp.create({ email, otp });

    // Send OTP email
    const emailSent = await sendOTPEmail(email, otp);

    return { success: true, emailSent };
  } catch (error) {
    throw error;
  }
};

// Verify OTP
const verifyOTP = async (email, otp) => {
  try {
    const otpRecord = await Otp.findOne({ email, otp });

    if (!otpRecord) {
      return { success: false, message: 'Invalid or expired OTP' };
    }

    // Delete OTP after successful verification
    await Otp.deleteOne({ _id: otpRecord._id });

    return { success: true, message: 'OTP verified successfully' };
  } catch (error) {
    throw error;
  }
};

module.exports = {
  generateOTP,
  sendOTPEmail,
  createAndSendOTP,
  verifyOTP,
};
