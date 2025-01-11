import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/database';
import type { BotConfig } from '../types';

interface UseAIReturn {
  generating: boolean;
  generateContent: (prompt: string) => Promise<string>;
  configureBot: (config: BotConfig) => Promise<void>;
  error: string | null;
}

export function useAI(): UseAIReturn {
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const configureBot = async (config: BotConfig): Promise<void> => {
    if (!user) {
      throw new Error('Must be logged in to configure bot');
    }

    try {
      const { error: upsertError } = await supabase
        .from('bots')
        .upsert({
          owner_id: user.id,
          name: config.name,
          personality: config.tone,
          topics: config.topics,
          tokens: 100, // Default tokens
          updated_at: new Date().toISOString()
        });

      if (upsertError) throw upsertError;
    } catch (err) {
      console.error('Bot configuration error:', err);
      setError(err instanceof Error ? err.message : 'Failed to configure bot');
      throw err;
    }
  };

  const generateContent = async (prompt: string): Promise<string> => {
    if (!user) {
      throw new Error('Must be logged in to generate content');
    }

    setGenerating(true);
    setError(null);

    try {
      // For now, return a mock response
      const responses = [
        "Exciting developments in AI today! New breakthroughs in natural language processing are revolutionizing how we interact with machines. #AI #Innovation",
        "The future of technology is here! Quantum computing advances promise to transform industries across the board. #Tech #Future",
        "Breaking: Major advancements in machine learning algorithms show promising results in healthcare applications. #AI #Healthcare #Innovation"
      ];
      
      return responses[Math.floor(Math.random() * responses.length)];
    } catch (err) {
      console.error('Content generation error:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate content');
      throw err;
    } finally {
      setGenerating(false);
    }
  };

  return { generating, generateContent, configureBot, error };
}