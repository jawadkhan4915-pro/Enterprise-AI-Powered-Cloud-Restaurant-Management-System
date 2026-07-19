const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
    },
    date: {
      type: String, // 'YYYY-MM-DD'
      required: true,
    },
    clockIn: {
      type: Date,
      required: true,
    },
    clockOut: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ['present', 'late', 'absent', 'half_day', 'on_leave'],
      default: 'present',
    },
    breaks: [
      {
        start: {
          type: Date,
          required: true,
        },
        end: {
          type: Date,
          default: null,
        },
      },
    ],
    totalHours: {
      type: Number,
      default: 0, // In hours (e.g. 7.5)
    },
    overtimeHours: {
      type: Number,
      default: 0,
    },
    remarks: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Ensure only one attendance document per employee per day
attendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true });
attendanceSchema.index({ date: 1 });

const Attendance = mongoose.model('Attendance', attendanceSchema);

module.exports = Attendance;
