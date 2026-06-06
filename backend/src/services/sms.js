// Twilio SMS service for sending OTP codes.
// Configure credentials in .env (TWILIO_*). If not configured, sending is
// skipped gracefully so the app still works in OTP_DEV_MODE.
let twilio;
try {
  // eslint-disable-next-line global-require
  twilio = require('twilio');
} catch (e) {
  twilio = null;
}

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_PHONE_NUMBER;
const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID;
const defaultCountryCode = process.env.DEFAULT_COUNTRY_CODE || '+91';

let client = null;

// Twilio needs a sender: either a phone number or a Messaging Service SID.
const isConfigured = () =>
  Boolean(twilio && accountSid && authToken && (fromNumber || messagingServiceSid));

const getClient = () => {
  if (!client && isConfigured()) {
    client = twilio(accountSid, authToken);
  }
  return client;
};

// Convert a stored mobile (e.g. "9876543210") to E.164 ("+919876543210").
const toE164 = (mobile) => {
  const raw = String(mobile).trim();
  if (raw.startsWith('+')) return raw;
  const digits = raw.replace(/\D/g, '');
  // If it already carries a country code (>10 digits), just prefix '+'.
  if (digits.length > 10) return `+${digits}`;
  return `${defaultCountryCode}${digits}`;
};

const sendOtpSms = async (mobile, code) => {
  if (!isConfigured()) {
    return { sent: false, reason: 'twilio_not_configured' };
  }

  const minutes = parseInt(process.env.OTP_EXPIRY_MINUTES || '5', 10);
  const message = {
    body: `Your Vehicle Manager verification code is ${code}. Valid for ${minutes} minutes.`,
    to: toE164(mobile),
  };
  if (messagingServiceSid) {
    message.messagingServiceSid = messagingServiceSid;
  } else {
    message.from = fromNumber;
  }

  const result = await getClient().messages.create(message);
  return { sent: true, sid: result.sid };
};

module.exports = { sendOtpSms, isConfigured };
