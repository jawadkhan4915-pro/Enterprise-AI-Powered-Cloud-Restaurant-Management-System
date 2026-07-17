class BaseAIAdapter {
  constructor(name) {
    this.name = name;
  }

  /**
   * Generates a text response from the AI provider.
   * @param {string} prompt - The user prompt.
   * @param {string} [systemInstruction] - Optional system instructions.
   * @returns {Promise<string>} The generated reply.
   */
  async generateText(prompt, systemInstruction = '') {
    throw new Error('generateText method must be implemented by subclasses');
  }
}

module.exports = BaseAIAdapter;
