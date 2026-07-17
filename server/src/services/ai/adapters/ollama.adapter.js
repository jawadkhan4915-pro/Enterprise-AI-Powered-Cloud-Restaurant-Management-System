const OpenAIAdapter = require('./openai.adapter');

class OllamaAdapter extends OpenAIAdapter {
  constructor(config) {
    super({
      ...config,
      provider: 'ollama',
      endpoint: config.endpoint || 'http://localhost:11434/v1/chat/completions',
      model: config.model || 'llama3',
    });
    this.name = 'Ollama Adapter';
  }
}

module.exports = OllamaAdapter;
