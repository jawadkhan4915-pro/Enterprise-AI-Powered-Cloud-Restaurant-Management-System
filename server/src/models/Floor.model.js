const mongoose = require('mongoose');

const floorSchema = new mongoose.Schema(
  {
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true, // e.g. 'Ground Floor', 'Rooftop'
    },
    level: {
      type: Number,
      default: 0, // 0 for ground, 1 for first floor, etc.
    },
    isActive: {
      type: Boolean,
      default: true,
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

floorSchema.index({ branchId: 1 });
floorSchema.index({ isDeleted: 1 });

const Floor = mongoose.model('Floor', floorSchema);

module.exports = Floor;
