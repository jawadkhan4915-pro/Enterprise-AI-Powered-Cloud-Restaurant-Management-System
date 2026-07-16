const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema(
  {
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      required: true,
    },
    category: {
      type: String,
      enum: ['rent', 'utilities', 'inventory', 'salaries', 'marketing', 'other'],
      required: true,
      default: 'other',
    },
    amount: {
      type: Number,
      required: true,
      default: 0,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['pending', 'paid'],
      default: 'paid',
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'card', 'bank_transfer'],
      default: 'cash',
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
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

expenseSchema.index({ branchId: 1, date: -1 });
expenseSchema.index({ category: 1 });
expenseSchema.index({ isDeleted: 1 });

const Expense = mongoose.model('Expense', expenseSchema);

module.exports = Expense;
