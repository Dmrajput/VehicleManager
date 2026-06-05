const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, default: '' },
    mobile: { type: String, required: true, unique: true, trim: true },
    email: { type: String, trim: true, lowercase: true, default: '' },
    profileImage: { type: String, default: '' },
    isVerified: { type: Boolean, default: false },
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

userSchema.methods.toSafeJSON = function () {
  return {
    id: this._id,
    name: this.name,
    mobile: this.mobile,
    email: this.email,
    profileImage: this.profileImage,
    isVerified: this.isVerified,
    settings: this.settings,
    createdAt: this.createdAt,
  };
};

module.exports = mongoose.model('User', userSchema);
