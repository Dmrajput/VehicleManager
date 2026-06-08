const jwt = require('jsonwebtoken');

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '30d',
  });
};

// Short-lived token proving a successful password-reset OTP verification.
// It is handed to the client by /verify-reset-otp and consumed by /reset-password.
const generateResetToken = (userId) => {
  return jwt.sign({ id: userId, purpose: 'reset' }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_RESET_EXPIRES_IN || '15m',
  });
};

const verifyResetToken = (token) => {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  if (decoded.purpose !== 'reset') {
    throw new Error('Invalid reset token');
  }
  return decoded;
};

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

module.exports = { generateToken, generateResetToken, verifyResetToken, generateOTP };
