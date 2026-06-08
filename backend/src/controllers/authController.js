const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const {
  generateToken,
  generateResetToken,
  verifyResetToken,
  generateOTP,
} = require('../utils/token');
const { sendOtpSms, isConfigured: isSmsConfigured } = require('../services/sms');

const otpExpiryMinutes = () => parseInt(process.env.OTP_EXPIRY_MINUTES || '5', 10);
const isDevMode = () => String(process.env.OTP_DEV_MODE || 'true') === 'true';
const MIN_PASSWORD_LENGTH = 6;

// Reduce any mobile (with/without country code, spaces, +) to its last 10 digits.
const normalizeMobile = (m) => String(m || '').replace(/\D/g, '').slice(-10);

// Google Play review account: lets a reviewer log in with a fixed
// mobile/password WITHOUT OTP, even on a fresh database. Configurable via env,
// with sensible defaults so it works on the deployed backend out of the box.
const getReviewAccount = () => {
  const mobile = process.env.REVIEW_ACCOUNT_MOBILE || '7600829332';
  const password = process.env.REVIEW_ACCOUNT_PASSWORD || 'Vehicle@123';
  if (!mobile || !password) return null;
  return { mobile, password };
};

const issueOtp = (user) => {
  const code = generateOTP();
  user.otpCode = code;
  user.otpExpiresAt = new Date(Date.now() + otpExpiryMinutes() * 60 * 1000);
  return code;
};

const isOtpExpired = (user) =>
  user.otpExpiresAt && user.otpExpiresAt.getTime() < Date.now();

// Try to deliver the OTP via SMS. Returns true if it was sent.
const deliverOtp = async (mobile, code) => {
  if (!isSmsConfigured()) return false;
  try {
    const result = await sendOtpSms(mobile, code);
    if (result.sent) {
      console.log(`OTP SMS sent to ${mobile} (sid: ${result.sid})`);
      return true;
    }
    return false;
  } catch (err) {
    console.error(`Failed to send OTP SMS to ${mobile}:`, err.message);
    return false;
  }
};

// Include the OTP in the API response only in dev mode, or when SMS delivery
// is unavailable (so testing without SMS still works).
const otpResponseExtras = (code, smsSent) =>
  isDevMode() || !smsSent ? { devOtp: code } : {};

const sessionPayload = (user, token) => ({
  token,
  user: user.toSafeJSON(),
});

// ---------------------------------------------------------------------------
// OTP signup / login
// ---------------------------------------------------------------------------

// @route POST /api/auth/register
const register = asyncHandler(async (req, res) => {
  const { name, mobile, email, password } = req.body;
  if (!mobile) {
    res.status(400);
    throw new Error('Mobile number is required');
  }
  if (!password || password.length < MIN_PASSWORD_LENGTH) {
    res.status(400);
    throw new Error(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`);
  }

  let user = await User.findOne({ mobile });
  if (user && user.isVerified) {
    res.status(409);
    throw new Error('An account with this mobile already exists. Please login.');
  }

  if (!user) {
    user = new User({ mobile });
  }
  if (name) user.name = name;
  if (email) user.email = email;
  user.password = password; // hashed by the model pre-save hook
  user.passwordUpdatedAt = new Date();

  const code = issueOtp(user);
  await user.save();

  const smsSent = await deliverOtp(mobile, code);

  res.status(201).json({
    success: true,
    message: smsSent ? 'OTP sent via SMS' : 'OTP generated',
    data: { mobile, ...otpResponseExtras(code, smsSent) },
  });
});

// @route POST /api/auth/login  (OTP login — sends an OTP)
const login = asyncHandler(async (req, res) => {
  const { mobile } = req.body;
  if (!mobile) {
    res.status(400);
    throw new Error('Mobile number is required');
  }

  let user = await User.findOne({ mobile });
  if (!user) {
    // Auto-create an unverified user so login doubles as signup for OTP flow.
    user = new User({ mobile });
  }

  const code = issueOtp(user);
  await user.save();

  const smsSent = await deliverOtp(mobile, code);

  res.json({
    success: true,
    message: smsSent ? 'OTP sent via SMS' : 'OTP generated',
    data: { mobile, isNewUser: !user.isVerified, ...otpResponseExtras(code, smsSent) },
  });
});

// @route POST /api/auth/verify-otp
const verifyOtp = asyncHandler(async (req, res) => {
  const { mobile, otp } = req.body;
  if (!mobile || !otp) {
    res.status(400);
    throw new Error('Mobile and OTP are required');
  }

  const user = await User.findOne({ mobile });
  if (!user || !user.otpCode) {
    res.status(400);
    throw new Error('No OTP requested for this number');
  }
  if (isOtpExpired(user)) {
    res.status(400);
    throw new Error('OTP expired, please request a new one');
  }
  if (user.otpCode !== String(otp)) {
    res.status(400);
    throw new Error('Invalid OTP');
  }

  // Generate the token first so a signing failure never consumes the OTP.
  const token = generateToken(user._id);

  user.isVerified = true;
  user.otpCode = null;
  user.otpExpiresAt = null;
  await user.save();

  res.json({ success: true, message: 'OTP verified', data: sessionPayload(user, token) });
});

// ---------------------------------------------------------------------------
// Password login
// ---------------------------------------------------------------------------

// @route POST /api/auth/login-password
const loginPassword = asyncHandler(async (req, res) => {
  const { mobile, password } = req.body;
  if (!mobile || !password) {
    res.status(400);
    throw new Error('Mobile number and password are required');
  }

  // Play Store review account bypass (no OTP). Ensures the account exists.
  const review = getReviewAccount();
  if (
    review &&
    normalizeMobile(mobile) === normalizeMobile(review.mobile) &&
    password === review.password
  ) {
    let user = await User.findOne({ mobile }).select('+password');
    if (!user) {
      user = new User({ mobile, name: 'Play Reviewer' });
    }
    user.isVerified = true;
    if (!user.password) {
      user.password = review.password; // hashed by pre-save
      user.passwordUpdatedAt = new Date();
    }
    await user.save();
    const token = generateToken(user._id);
    return res.json({ success: true, message: 'Login successful', data: sessionPayload(user, token) });
  }

  const user = await User.findOne({ mobile }).select('+password');
  // Generic message so we don't reveal whether the mobile is registered.
  if (!user || !user.password) {
    res.status(401);
    throw new Error('Invalid mobile number or password');
  }

  const ok = await user.comparePassword(password);
  if (!ok) {
    res.status(401);
    throw new Error('Invalid mobile number or password');
  }

  // A correct password also confirms ownership, so treat the account as verified.
  if (!user.isVerified) {
    user.isVerified = true;
    await user.save();
  }

  const token = generateToken(user._id);
  res.json({ success: true, message: 'Login successful', data: sessionPayload(user, token) });
});

// ---------------------------------------------------------------------------
// Forgot / reset password
// ---------------------------------------------------------------------------

// @route POST /api/auth/forgot-password  (sends a reset OTP)
const forgotPassword = asyncHandler(async (req, res) => {
  const { mobile } = req.body;
  if (!mobile) {
    res.status(400);
    throw new Error('Mobile number is required');
  }

  const user = await User.findOne({ mobile });
  if (!user) {
    res.status(404);
    throw new Error('No account found with this mobile number');
  }

  const code = issueOtp(user);
  await user.save();

  const smsSent = await deliverOtp(mobile, code);

  res.json({
    success: true,
    message: smsSent ? 'OTP sent via SMS' : 'OTP generated',
    data: { mobile, ...otpResponseExtras(code, smsSent) },
  });
});

// @route POST /api/auth/verify-reset-otp  (validates OTP, returns a reset token)
const verifyResetOtp = asyncHandler(async (req, res) => {
  const { mobile, otp } = req.body;
  if (!mobile || !otp) {
    res.status(400);
    throw new Error('Mobile and OTP are required');
  }

  const user = await User.findOne({ mobile });
  if (!user || !user.otpCode) {
    res.status(400);
    throw new Error('No OTP requested for this number');
  }
  if (isOtpExpired(user)) {
    res.status(400);
    throw new Error('OTP expired, please request a new one');
  }
  if (user.otpCode !== String(otp)) {
    res.status(400);
    throw new Error('Invalid OTP');
  }

  // OTP stays valid until the password is actually reset (or it expires).
  const resetToken = generateResetToken(user._id);
  res.json({ success: true, message: 'OTP verified', data: { resetToken } });
});

// @route POST /api/auth/reset-password
// Accepts either { resetToken, newPassword } (preferred) or { mobile, otp, newPassword }.
const resetPassword = asyncHandler(async (req, res) => {
  const { mobile, otp, resetToken, newPassword } = req.body;
  if (!newPassword || newPassword.length < MIN_PASSWORD_LENGTH) {
    res.status(400);
    throw new Error(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`);
  }

  let user = null;

  if (resetToken) {
    let decoded;
    try {
      decoded = verifyResetToken(resetToken);
    } catch (e) {
      res.status(400);
      throw new Error('Reset session expired, please verify the OTP again');
    }
    user = await User.findById(decoded.id);
  } else {
    if (!mobile || !otp) {
      res.status(400);
      throw new Error('A reset token or mobile + OTP is required');
    }
    user = await User.findOne({ mobile });
    if (user && (!user.otpCode || isOtpExpired(user) || user.otpCode !== String(otp))) {
      res.status(400);
      throw new Error('Invalid or expired OTP');
    }
  }

  if (!user) {
    res.status(400);
    throw new Error('Invalid reset request');
  }

  user.password = newPassword; // hashed by pre-save hook
  user.passwordUpdatedAt = new Date();
  user.isVerified = true;
  user.otpCode = null;
  user.otpExpiresAt = null;
  await user.save();

  res.json({ success: true, message: 'Password updated successfully' });
});

module.exports = {
  register,
  login,
  verifyOtp,
  loginPassword,
  forgotPassword,
  verifyResetOtp,
  resetPassword,
};
