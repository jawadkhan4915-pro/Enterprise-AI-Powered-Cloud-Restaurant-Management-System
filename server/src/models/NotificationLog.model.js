const mongoose = require('mongoose');

const notificationLogSchema = new mongoose.Schema(
  {
    recipient: {
      type: String,
      required: true,
      trim: true,
    },
    channel: {
      type: String,
      enum: ['email', 'sms'],
      required: true,
    },
    type: {
      type: String,
      enum: ['receipt', 'booking_confirmed', 'booking_seated', 'booking_cancelled', 'test_email', 'test_sms'],
      required: true,
    },
    status: {
      type: String,
      enum: ['sent', 'failed', 'logged'],
      required: true,
      default: 'sent',
    },
    subject: {
      type: String,
      trim: true,
      default: '',
    },
    body: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for rapid sorting and log retrieval
notificationLogSchema.index({ channel: 1 });
notificationLogSchema.index({ type: 1 });
notificationLogSchema.index({ status: 1 });
notificationLogSchema.index({ createdAt: -1 });

const NotificationLog = mongoose.model('NotificationLog', notificationLogSchema);

module.exports = NotificationLog;
