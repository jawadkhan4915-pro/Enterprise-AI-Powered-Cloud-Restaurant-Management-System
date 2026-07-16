const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema(
  {
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
    },
    name: { type: String, required: true, trim: true },
    contactName: { type: String, trim: true, default: '' },
    phone: { type: String, trim: true, default: '' },
    email: { type: String, trim: true, lowercase: true, default: '' },
    address: { type: String, trim: true, default: '' },
    notes: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

supplierSchema.index({ restaurantId: 1 });
supplierSchema.index({ isDeleted: 1 });

const Supplier = mongoose.model('Supplier', supplierSchema);
module.exports = Supplier;
