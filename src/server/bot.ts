import type { BotConfig } from '../types';

export class ContentBot {
  private config: BotConfig;

  constructor(config: BotConfig) {
    this.config = config;
  }

  async generatePost(topic: string): Promise<string> {
    const prompt = this.createPrompt(topic);
    
    try {
      // Simulate AI response for now
      const response = await this.simulateAIResponse(prompt);
      return this.formatResponse(response);
    } catch (error) {
      console.error('Error generating post:', error);
      throw new Error('Failed to generate post');
    }
  }

  private createPrompt(topic: string): string {
    const toneGuide = {
      professional: 'Use formal language and industry terminology',
      casual: 'Keep it relaxed and conversational',
      friendly: 'Be warm and approachable'
    };

    return `
      Create a ${this.config.tone} social media post about ${topic}.
      Tone guide: ${toneGuide[this.config.tone as keyof typeof toneGuide]}
      Include these hashtags where relevant: ${this.config.hashtags.join(', ')}
      Focus on these topics: ${this.config.topics.join(', ')}
      Keep it under 280 characters.
      Make it engaging and informative.
    `;
  }

  private formatResponse(text: string): string {
    let formatted = text.trim().replace(/\s+/g, ' ');
    if (formatted.length > 280) {
      formatted = formatted.substring(0, 277) + '...';
    }
    return formatted;
  }

  private async simulateAIResponse(prompt: string): Promise<string> {
    // Simulate AI response with a delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const responses = [
      "Exciting developments in AI today! New breakthroughs in natural language processing are revolutionizing how we interact with machines. #AI #Innovation",
      "The future of technology is here! Quantum computing advances promise to transform industries across the board. #Tech #Future",
      "Breaking: Major advancements in machine learning algorithms show promising results in healthcare applications. #AI #Healthcare #Innovation"
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  }

  getConfig(): BotConfig {
    return this.config;
  }
}