const bcrypt = require('bcryptjs');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// Hash password
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

// Compare password
const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

// Register user
const registerUser = async (name, email, password) => {
  try {
    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      throw new Error('User already exists');
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    // Generate token
    const token = generateToken(user._id);

    return {
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
      },
      token,
    };
  } catch (error) {
    throw error;
  }
};

// Login user
const loginUser = async (email, password) => {
  try {
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Check password
    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      throw new Error('Invalid credentials');
    }

    // Generate token
    const token = generateToken(user._id);

    return {
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
      },
      token,
    };
  } catch (error) {
    throw error;
  }
};

module.exports = {
  hashPassword,
  comparePassword,
  generateToken,
  registerUser,
  loginUser,
};
