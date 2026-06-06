const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const { generateToken, generateOTP } = require('../utils/token');
const { sendOtpSms, isConfigured: isSmsConfigured } = require('../services/sms');

const otpExpiryMinutes = () => parseInt(process.env.OTP_EXPIRY_MINUTES || '5', 10);
const isDevMode = () => String(process.env.OTP_DEV_MODE || 'true') === 'true';

const issueOtp = (user) => {
  const code = generateOTP();
  user.otpCode = code;
  user.otpExpiresAt = new Date(Date.now() + otpExpiryMinutes() * 60 * 1000);
  return code;
};

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

// @route POST /api/auth/register
const register = asyncHandler(async (req, res) => {
  const { name, mobile, email } = req.body;
  if (!mobile) {
    res.status(400);
    throw new Error('Mobile number is required');
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

  const code = issueOtp(user);
  await user.save();

  const smsSent = await deliverOtp(mobile, code);

  res.status(201).json({
    success: true,
    message: smsSent ? 'OTP sent via SMS' : 'OTP generated',
    data: { mobile, ...otpResponseExtras(code, smsSent) },
  });
});

// @route POST /api/auth/login
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

  if (user.otpExpiresAt && user.otpExpiresAt.getTime() < Date.now()) {
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

  res.json({
    success: true,
    message: 'OTP verified',
    data: {
      token,
      user: user.toSafeJSON(),
    },
  });
});

module.exports = { register, login, verifyOtp };
