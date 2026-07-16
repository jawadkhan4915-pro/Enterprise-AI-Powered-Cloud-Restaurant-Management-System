const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    token: {
      type: String, // hashed signature or full token hash
      required: true,
    },
    deviceInfo: {
      ip: String,
      userAgent: String,
    },
    lastActive: {
      type: Date,
      default: Date.now,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

sessionSchema.index({ userId: 1 });
sessionSchema.index({ token: 1 });

const Session = mongoose.model('Session', sessionSchema);

module.exports = Session;
