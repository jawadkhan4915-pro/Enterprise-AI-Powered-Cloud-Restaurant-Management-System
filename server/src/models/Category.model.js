const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
    },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: null, // support nested subcategories
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    image: {
      type: String,
      default: '',
    },
    order: {
      type: Number,
      default: 0, // ordering order on menu UI
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

categorySchema.index({ restaurantId: 1 });
categorySchema.index({ parentId: 1 });
categorySchema.index({ slug: 1 });
categorySchema.index({ isDeleted: 1 });

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
