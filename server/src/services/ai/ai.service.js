const Restaurant = require('../../models/Restaurant.model');
const OpenAIAdapter = require('./adapters/openai.adapter');
const OllamaAdapter = require('./adapters/ollama.adapter');
const LMStudioAdapter = require('./adapters/lmstudio.adapter');
const OpenRouterAdapter = require('./adapters/openrouter.adapter');
const MockAIAdapter = require('./adapters/mock.adapter');
const logger = require('../../config/logger');

class AIService {
  constructor() {
    this.provider = 'mock'; // Default cached provider name for logging/reference
  }

  /**
   * Resolves and instantiates the correct adapter dynamically based on Restaurant configuration
   */
  async getAdapter() {
    let provider = 'mock';
    let config = {};

    try {
      const restaurant = await Restaurant.findOne({ isDeleted: false });
      if (restaurant && restaurant.aiSettings && restaurant.aiSettings.provider && restaurant.aiSettings.provider !== 'none') {
        provider = restaurant.aiSettings.provider.toLowerCase();
        config = {
          apiKey: restaurant.aiSettings.apiKey,
          endpoint: restaurant.aiSettings.endpoint,
          model: restaurant.aiSettings.model,
        };
      } else {
        // Fallback to process.env config
        provider = (process.env.AI_PROVIDER || 'mock').toLowerCase();
        config = {
          apiKey: process.env.AI_API_KEY,
          endpoint: process.env.AI_ENDPOINT,
          model: process.env.AI_MODEL,
        };
      }
    } catch (err) {
      logger.error('Error fetching dynamic AI settings, using fallback environment config', err);
      provider = (process.env.AI_PROVIDER || 'mock').toLowerCase();
      config = {
        apiKey: process.env.AI_API_KEY,
        endpoint: process.env.AI_ENDPOINT,
        model: process.env.AI_MODEL,
      };
    }

    this.provider = provider;

    switch (provider) {
      case 'openai':
        return new OpenAIAdapter(config);
      case 'openrouter':
        return new OpenRouterAdapter(config);
      case 'ollama':
        return new OllamaAdapter(config);
      case 'lmstudio':
        return new LMStudioAdapter(config);
      case 'mock':
      default:
        return new MockAIAdapter();
    }
  }

  async generateResponse(prompt, systemInstruction = '') {
    const adapter = await this.getAdapter();
    try {
      logger.info(`Sending prompt request using ${adapter.name}`);
      return await adapter.generateText(prompt, systemInstruction);
    } catch (error) {
      logger.warn(`Active AI provider ${adapter.name} failed. Gracefully falling back to Mock AI suggestions...`);
      const fallback = new MockAIAdapter();
      return await fallback.generateText(prompt, systemInstruction);
    }
  }
}

// Singleton instances
module.exports = new AIService();
