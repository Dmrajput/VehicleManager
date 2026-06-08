const express = require('express');
const {
  register,
  login,
  verifyOtp,
  loginPassword,
  forgotPassword,
  verifyResetOtp,
  resetPassword,
} = require('../controllers/authController');

const router = express.Router();

// OTP signup / login
router.post('/register', register);
router.post('/login', login);
router.post('/verify-otp', verifyOtp);

// Password login
router.post('/login-password', loginPassword);

// Forgot / reset password
router.post('/forgot-password', forgotPassword);
router.post('/verify-reset-otp', verifyResetOtp);
router.post('/reset-password', resetPassword);

module.exports = router;
