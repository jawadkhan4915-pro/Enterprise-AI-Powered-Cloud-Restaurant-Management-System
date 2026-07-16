const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      default: null,
    },
    customerName: {
      type: String,
      required: true,
      trim: true,
    },
    customerPhone: {
      type: String,
      required: true,
      trim: true,
    },
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      required: true,
    },
    tableId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Table',
      default: null, // Table mapping can be done later by host
    },
    partySize: {
      type: Number,
      required: true,
      default: 2,
    },
    reservationTime: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'seated', 'cancelled', 'no_show'],
      default: 'pending',
    },
    notes: {
      type: String,
      trim: true,
      default: '',
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

reservationSchema.index({ branchId: 1, reservationTime: 1 });
reservationSchema.index({ customerPhone: 1 });
reservationSchema.index({ status: 1 });
reservationSchema.index({ isDeleted: 1 });

const Reservation = mongoose.model('Reservation', reservationSchema);

module.exports = Reservation;
