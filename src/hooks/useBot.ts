import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { loadBotProfile, updateBotStatus, isValidUUID } from '../lib/database';
import type { BotProfile } from '../types';

interface UseBotReturn {
  loading: boolean;
  error: string | null;
  bot: BotProfile | null;
  loadBot: (botId: string) => Promise<void>;
  updateStatus: (botId: string, status: 'active' | 'paused' | 'archived') => Promise<void>;
}

export function useBot(): UseBotReturn {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bot, setBot] = useState<BotProfile | null>(null);

  const loadBot = async (botId: string) => {
    if (!user) {
      setError('Authentication required');
      return;
    }

    if (!isValidUUID(botId)) {
      setError('Invalid bot ID format');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await loadBotProfile(botId, user.id);
      setBot(data);
    } catch (err) {
      console.error('Error loading bot:', err);
      setError(err instanceof Error ? err.message : 'Failed to load bot');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (botId: string, status: 'active' | 'paused' | 'archived') => {
    if (!user) {
      setError('Authentication required');
      return;
    }

    if (!isValidUUID(botId)) {
      setError('Invalid bot ID format');
      return;
    }

    setError(null);

    try {
      await updateBotStatus(botId, user.id, status);
      if (bot && bot.id === botId) {
        setBot({ ...bot, status });
      }
    } catch (err) {
      console.error('Error updating bot status:', err);
      setError(err instanceof Error ? err.message : 'Failed to update bot status');
    }
  };

  return { loading, error, bot, loadBot, updateStatus };
}