const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null, // Optional system user linkage
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    role: {
      type: String,
      enum: ['waiter', 'chef', 'cashier', 'manager', 'cleaner', 'other'],
      default: 'waiter',
    },
    salary: {
      type: Number,
      default: 0,
    },
    hourlyRate: {
      type: Number,
      default: 0, // for shift calculation
    },
    shift: {
      start: { type: String, default: '09:00' },
      end: { type: String, default: '17:00' },
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
    hireDate: {
      type: Date,
      default: Date.now,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

employeeSchema.index({ email: 1 });
employeeSchema.index({ role: 1 });
employeeSchema.index({ isDeleted: 1 });

const Employee = mongoose.model('Employee', employeeSchema);

module.exports = Employee;
