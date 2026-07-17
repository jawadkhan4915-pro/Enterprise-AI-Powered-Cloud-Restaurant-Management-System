const OpenAIAdapter = require('./openai.adapter');

class LMStudioAdapter extends OpenAIAdapter {
  constructor(config) {
    super({
      ...config,
      provider: 'lmstudio',
      endpoint: config.endpoint || 'http://localhost:1234/v1/chat/completions',
      model: config.model || 'model-identifier',
    });
    this.name = 'LM Studio Adapter';
  }
}

module.exports = LMStudioAdapter;
