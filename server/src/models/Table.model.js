const mongoose = require('mongoose');

const tableSchema = new mongoose.Schema(
  {
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      required: true,
    },
    floorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Floor',
      required: true,
    },
    number: {
      type: String, // e.g. 'T-1', 'T-2', or '12'
      required: true,
      trim: true,
    },
    capacity: {
      type: Number,
      default: 4, // default 4 seats
    },
    shape: {
      type: String,
      enum: ['square', 'circle'],
      default: 'square',
    },
    position: {
      x: {
        type: Number,
        default: 50, // x coordinate on canvas
      },
      y: {
        type: Number,
        default: 50, // y coordinate on canvas
      },
    },
    size: {
      width: {
        type: Number,
        default: 80, // width in pixels
      },
      height: {
        type: Number,
        default: 80, // height in pixels
      },
    },
    status: {
      type: String,
      enum: ['available', 'occupied', 'reserved', 'dirty'],
      default: 'available',
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

tableSchema.index({ branchId: 1, floorId: 1 });
tableSchema.index({ isDeleted: 1 });

const Table = mongoose.model('Table', tableSchema);

module.exports = Table;
