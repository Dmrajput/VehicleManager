const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, default: '' },
    mobile: { type: String, required: true, unique: true, trim: true },
    email: { type: String, trim: true, lowercase: true, default: '' },
    profileImage: { type: String, default: '' },
    isVerified: { type: Boolean, default: false },
    // Hashed password (bcrypt). select:false so it is never returned by default.
    password: { type: String, default: null, select: false },
    passwordUpdatedAt: { type: Date, default: null },
    // OTP fields (kept on the user doc for simplicity in dev)
    otpCode: { type: String, default: null },
    otpExpiresAt: { type: Date, default: null },
    settings: {
      notificationsEnabled: { type: Boolean, default: true },
      reminderDaysBefore: { type: [Number], default: [30, 15, 7, 1] },
    },
  },
  { timestamps: true }
);

// Hash the password automatically whenever it is set/changed.
// NOTE: this is an async hook, so Mongoose does NOT pass `next` — we just
// return (or throw to abort the save).
userSchema.pre('save', async function hashPassword() {
  if (!this.isModified('password') || !this.password) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare a plaintext candidate against the stored hash.
// Requires the document to have been loaded with `.select('+password')`.
userSchema.methods.comparePassword = async function comparePassword(candidate) {
  if (!this.password || !candidate) return false;
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toSafeJSON = function toSafeJSON() {
  return {
    id: this._id,
    name: this.name,
    mobile: this.mobile,
    email: this.email,
    profileImage: this.profileImage,
    isVerified: this.isVerified,
    // True when the account has a password set (so the app can adapt the UI).
    hasPassword: Boolean(this.password),
    settings: this.settings,
    createdAt: this.createdAt,
  };
};

module.exports = mongoose.model('User', userSchema);
