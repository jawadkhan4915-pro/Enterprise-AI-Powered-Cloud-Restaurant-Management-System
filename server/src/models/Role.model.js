const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    permissions: [
      {
        type: String, // slugs of permissions
      },
    ],
    isSystem: {
      type: Boolean,
      default: false, // Core roles that cannot be deleted easily
    },
    description: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

roleSchema.index({ slug: 1 });

const Role = mongoose.model('Role', roleSchema);

module.exports = Role;
