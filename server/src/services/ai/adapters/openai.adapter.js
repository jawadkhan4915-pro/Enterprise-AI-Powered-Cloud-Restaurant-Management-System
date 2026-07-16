const logger = require('../../../config/logger');

class OpenAIAdapter {
  constructor(config) {
    this.name = `OpenAI Compatible Adapter (${config.provider || 'openai'})`;
    this.apiKey = config.apiKey || '';
    this.endpoint = config.endpoint || 'https://api.openai.com/v1/chat/completions';
    this.model = config.model || 'gpt-4o-mini';
  }

  async generateText(prompt, systemInstruction = '') {
    try {
      const headers = {
        'Content-Type': 'application/json',
      };

      if (this.apiKey) {
        headers['Authorization'] = `Bearer ${this.apiKey}`;
      }

      const body = {
        model: this.model,
        messages: [],
      };

      if (systemInstruction) {
        body.messages.push({ role: 'system', content: systemInstruction });
      }
      body.messages.push({ role: 'user', content: prompt });

      // Direct HTTP fetch to remain independent of SDK dependencies
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`AI Provider endpoint returned status ${response.status}: ${errorText}`);
      }

      const json = await response.json();
      return json.choices?.[0]?.message?.content || 'No response returned from model.';
    } catch (error) {
      logger.error('Error in OpenAI Compatible Adapter:', error);
      throw error;
    }
  }
}

module.exports = OpenAIAdapter;
