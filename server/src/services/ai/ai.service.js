const OpenAIAdapter = require('./adapters/openai.adapter');
const MockAIAdapter = require('./adapters/mock.adapter');
const logger = require('../../utils/logger');

class AIService {
  constructor() {
    this.provider = (process.env.AI_PROVIDER || 'none').toLowerCase();
    this.adapter = null;

    this.initAdapter();
  }

  initAdapter() {
    const config = {
      provider: this.provider,
      apiKey: process.env.AI_API_KEY,
      endpoint: process.env.AI_ENDPOINT,
      model: process.env.AI_MODEL,
    };

    switch (this.provider) {
      case 'openai':
        this.adapter = new OpenAIAdapter({
          ...config,
          endpoint: config.endpoint || 'https://api.openai.com/v1/chat/completions',
          model: config.model || 'gpt-4o-mini',
        });
        break;
      case 'openrouter':
        this.adapter = new OpenAIAdapter({
          ...config,
          endpoint: config.endpoint || 'https://openrouter.ai/api/v1/chat/completions',
          model: config.model || 'google/gemma-2-9b-it:free',
        });
        break;
      case 'ollama':
        this.adapter = new OpenAIAdapter({
          ...config,
          endpoint: config.endpoint || 'http://localhost:11434/v1/chat/completions',
          model: config.model || 'llama3',
        });
        break;
      case 'lmstudio':
        this.adapter = new OpenAIAdapter({
          ...config,
          endpoint: config.endpoint || 'http://localhost:1234/v1/chat/completions',
          model: config.model || 'model-identifier',
        });
        break;
      default:
        logger.info('Initializing default Mock AI Service (Demo Mode)');
        this.adapter = new MockAIAdapter();
    }
  }

  async generateResponse(prompt, systemInstruction = '') {
    try {
      logger.info(`Sending prompt request using ${this.adapter.name}`);
      return await this.adapter.generateText(prompt, systemInstruction);
    } catch (error) {
      logger.warn('Active AI provider failed. Gracefully falling back to Mock AI suggestions...');
      const fallback = new MockAIAdapter();
      return await fallback.generateText(prompt, systemInstruction);
    }
  }
}

// Singleton instances
module.exports = new AIService();
