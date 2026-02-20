import axiosInstance from './axiosinstance';

// Send OTP to email
export const sendOTP = async (email) => {
  try {
    const response = await axiosInstance.post('/auth/send-otp', { email });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Verify OTP
export const verifyOTP = async (email, otp) => {
  try {
    const response = await axiosInstance.post('/auth/verify-otp', { email, otp });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Register user (signup with OTP verification)
export const registerUser = async (name, email, password) => {
  try {
    const response = await axiosInstance.post('/auth/register', { name, email, password });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Login user
export const loginUser = async (email, password) => {
  try {
    const response = await axiosInstance.post('/auth/login', { email, password });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export default {
  sendOTP,
  verifyOTP,
  registerUser,
  loginUser,
};
