const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: '',
    },
    loyaltyPoints: {
      type: Number,
      default: 0,
    },
    loyaltyTier: {
      type: String,
      enum: ['bronze', 'silver', 'gold', 'platinum'],
      default: 'bronze',
    },
    visitCount: {
      type: Number,
      default: 0,
    },
    totalSpent: {
      type: Number,
      default: 0,
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

// Auto-assign loyalty tiers based on points balance
customerSchema.pre('save', function (next) {
  if (this.loyaltyPoints >= 1000) {
    this.loyaltyTier = 'platinum';
  } else if (this.loyaltyPoints >= 500) {
    this.loyaltyTier = 'gold';
  } else if (this.loyaltyPoints >= 200) {
    this.loyaltyTier = 'silver';
  } else {
    this.loyaltyTier = 'bronze';
  }
  next();
});

customerSchema.index({ phone: 1 });
customerSchema.index({ name: 1 });
customerSchema.index({ isDeleted: 1 });

const Customer = mongoose.model('Customer', customerSchema);

module.exports = Customer;
