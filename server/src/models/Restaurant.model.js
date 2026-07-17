const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    logo: {
      type: String,
      default: '',
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: '',
    },
    address: {
      type: String,
      trim: true,
      default: '',
    },
    taxInfo: {
      rate: {
        type: Number,
        default: 10, // e.g. 10%
      },
      vatNumber: {
        type: String,
        trim: true,
        default: '',
      },
    },
    currency: {
      type: String,
      default: 'USD',
    },
    settings: {
      timezone: {
        type: String,
        default: 'UTC',
      },
      serviceCharge: {
        type: Number,
        default: 0, // e.g. 5% service charge
      },
    },
    aiSettings: {
      provider: {
        type: String,
        enum: ['none', 'mock', 'openai', 'ollama', 'lmstudio', 'openrouter'],
        default: 'mock',
      },
      apiKey: {
        type: String,
        default: '',
      },
      endpoint: {
        type: String,
        default: '',
      },
      model: {
        type: String,
        default: '',
      },
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

restaurantSchema.index({ isDeleted: 1 });

const Restaurant = mongoose.model('Restaurant', restaurantSchema);

module.exports = Restaurant;
