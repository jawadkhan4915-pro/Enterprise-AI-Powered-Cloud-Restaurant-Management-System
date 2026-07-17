const OpenAIAdapter = require('./openai.adapter');

class OpenRouterAdapter extends OpenAIAdapter {
  constructor(config) {
    super({
      ...config,
      provider: 'openrouter',
      endpoint: config.endpoint || 'https://openrouter.ai/api/v1/chat/completions',
      model: config.model || 'google/gemma-2-9b-it:free',
    });
    this.name = 'OpenRouter Adapter';
  }
}

module.exports = OpenRouterAdapter;
