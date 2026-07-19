const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      required: true,
    },
    tableId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Table',
      default: null, // null for delivery / takeaway
      set: v => (v === '' ? null : v),
    },
    items: [
      {
        menuItemId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'MenuItem',
          required: true,
        },
        name: {
          type: String,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          default: 1,
        },
        price: {
          type: Number,
          required: true,
        },
        selectedVariant: {
          name: String,
          price: Number,
        },
        selectedAddOns: [
          {
            name: String,
            price: Number,
          },
        ],
        notes: {
          type: String,
          default: '',
        },
      },
    ],
    subTotal: {
      type: Number,
      required: true,
      default: 0,
    },
    discount: {
      code: { type: String, default: '' },
      amount: { type: Number, default: 0 },
    },
    tax: {
      rate: { type: Number, default: 10 },
      amount: { type: Number, default: 0 },
    },
    serviceCharge: {
      rate: { type: Number, default: 0 },
      amount: { type: Number, default: 0 },
    },
    grandTotal: {
      type: Number,
      required: true,
      default: 0,
    },
    orderType: {
      type: String,
      enum: ['dine_in', 'takeaway', 'delivery'],
      required: true,
      default: 'dine_in',
    },
    status: {
      type: String,
      enum: ['pending', 'preparing', 'ready', 'served', 'completed', 'cancelled'],
      default: 'pending',
    },
    paymentStatus: {
      type: String,
      enum: ['unpaid', 'paid', 'refunded'],
      default: 'unpaid',
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'card', 'online'],
      default: 'cash',
    },
    customerDetails: {
      name: { type: String, default: '' },
      phone: { type: String, default: '' },
    },
    deliveryAddress: {
      type: String,
      default: '',
    },
    orderNumber: {
      type: String,
      required: true,
      unique: true,
    },
    preparingAt: {
      type: Date,
    },
    readyAt: {
      type: Date,
    },
    completedAt: {
      type: Date,
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

// Indexes
orderSchema.index({ branchId: 1 });
orderSchema.index({ tableId: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ isDeleted: 1 });

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
