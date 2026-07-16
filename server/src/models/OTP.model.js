const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    code: {
      type: String, // hashed OTP code
      required: true,
    },
    type: {
      type: String,
      enum: ['email_verification', 'password_reset', 'login_2fa'],
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// TTL Index to automatically delete documents when expired
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
otpSchema.index({ userId: 1, type: 1 });

const OTP = mongoose.model('OTP', otpSchema);

module.exports = OTP;
