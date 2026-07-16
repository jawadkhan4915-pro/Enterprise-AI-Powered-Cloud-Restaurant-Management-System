const mongoose = require('mongoose');

const stockTransactionSchema = new mongoose.Schema(
  {
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      required: true,
    },
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'InventoryItem',
      required: true,
    },
    type: {
      type: String,
      enum: ['purchase', 'consumption', 'waste', 'adjustment'],
      required: true,
    },
    quantity: {
      type: Number,
      required: true, // positive = stock in, negative = stock out
    },
    notes: { type: String, default: '' },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { timestamps: true }
);

stockTransactionSchema.index({ branchId: 1 });
stockTransactionSchema.index({ itemId: 1 });
stockTransactionSchema.index({ type: 1 });

const StockTransaction = mongoose.model('StockTransaction', stockTransactionSchema);
module.exports = StockTransaction;
