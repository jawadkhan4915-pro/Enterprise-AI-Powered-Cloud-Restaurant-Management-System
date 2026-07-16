const mongoose = require('mongoose');

const inventoryItemSchema = new mongoose.Schema(
  {
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      required: true,
    },
    supplierId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Supplier',
      default: null,
    },
    name: { type: String, required: true, trim: true },
    sku: { type: String, trim: true, default: '' },
    category: {
      type: String,
      enum: ['ingredient', 'beverage', 'supply', 'equipment', 'other'],
      default: 'ingredient',
    },
    unit: { type: String, trim: true, default: 'kg' }, // e.g. kg, liter, piece, portion
    currentStock: { type: Number, default: 0 },
    minimumStock: { type: Number, default: 0 }, // Low-stock alert threshold
    costPerUnit: { type: Number, default: 0 },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

inventoryItemSchema.index({ branchId: 1 });
inventoryItemSchema.index({ category: 1 });
inventoryItemSchema.index({ isDeleted: 1 });

const InventoryItem = mongoose.model('InventoryItem', inventoryItemSchema);
module.exports = InventoryItem;
