const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema(
  {
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    price: {
      type: Number,
      required: true,
      default: 0,
    },
    sku: {
      type: String,
      trim: true,
      default: '',
    },
    image: {
      type: String,
      default: '', // image url / path
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    preparationTime: {
      type: Number,
      default: 8, // prep time in minutes
    },
    variants: [
      {
        name: { type: String, required: true }, // e.g. 'Small', 'Large'
        price: { type: Number, required: true },
        sku: { type: String, default: '' },
      },
    ],
    addOns: [
      {
        name: { type: String, required: true }, // e.g. 'Extra Cheese', 'Bacon'
        price: { type: Number, required: true },
      },
    ],
    nutritionalInfo: {
      calories: { type: Number, default: 0 },
      protein: { type: Number, default: 0 },
      fat: { type: Number, default: 0 },
      carbs: { type: Number, default: 0 },
    },
    allergyInfo: [
      {
        type: String, // e.g. 'Nuts', 'Dairy', 'Gluten'
      },
    ],
    isCombo: {
      type: Boolean,
      default: false,
    },
    comboItems: [
      {
        itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' },
        quantity: { type: Number, default: 1 },
      },
    ],
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

menuItemSchema.index({ restaurantId: 1 });
menuItemSchema.index({ categoryId: 1 });
menuItemSchema.index({ isAvailable: 1 });
menuItemSchema.index({ isDeleted: 1 });

const MenuItem = mongoose.model('MenuItem', menuItemSchema);

module.exports = MenuItem;
