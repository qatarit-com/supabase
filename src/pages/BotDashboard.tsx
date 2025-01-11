import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/database';
import { Bot, Plus, Pause, Play, Settings } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

interface UserBot {
  id: string;
  name: string;
  personality: string;
  topics: string[];
  status: 'active' | 'paused' | 'archived';
  daily_post_limit: number;
  last_post_at: string | null;
}

export default function BotDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bots, setBots] = useState<UserBot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchBots();
    }
  }, [user]);

  const fetchBots = async () => {
    try {
      const { data, error } = await supabase
        .from('bots')
        .select('*')
        .eq('owner_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBots(data || []);
    } catch (err) {
      console.error('Error fetching bots:', err);
      setError('Failed to load bots');
    } finally {
      setLoading(false);
    }
  };

  const updateBotStatus = async (botId: string, status: UserBot['status']) => {
    try {
      const { error } = await supabase
        .from('bots')
        .update({ status })
        .eq('id', botId);

      if (error) throw error;
      await fetchBots();
    } catch (err) {
      console.error('Error updating bot status:', err);
      setError('Failed to update bot status');
    }
  };

  const handleCustomize = (botId: string) => {
    navigate(`/bot/${botId}`);
  };

  return (
    <div className="max-w-6xl mx-auto py-8 space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Bots</h1>
        <Link
          to="/create-bot"
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-5 w-5 mr-2" />
          Create New Bot
        </Link>
      </div>

      {/* Active Bots */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Active Bots</h2>
        {loading ? (
          <div className="text-center text-gray-500 dark:text-gray-400">Loading bots...</div>
        ) : error ? (
          <div className="text-center text-red-500">{error}</div>
        ) : bots.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400">
            No bots created yet. Start by creating a new bot!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {bots.map((bot) => (
              <div
                key={bot.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow p-4"
              >
                <div className="flex items-center justify-between mb-4">
                  <Link
                    to={`/bot/${bot.id}`}
                    className="flex items-center hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    <Bot className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <h3 className="ml-2 font-medium text-gray-900 dark:text-white">
                      {bot.name}
                    </h3>
                  </Link>
                  <div className="flex items-center space-x-2">
                    {bot.status === 'active' ? (
                      <button
                        onClick={() => updateBotStatus(bot.id, 'paused')}
                        className="p-1 text-yellow-600 hover:text-yellow-700"
                        title="Pause bot"
                      >
                        <Pause className="h-5 w-5" />
                      </button>
                    ) : (
                      <button
                        onClick={() => updateBotStatus(bot.id, 'active')}
                        className="p-1 text-green-600 hover:text-green-700"
                        title="Activate bot"
                      >
                        <Play className="h-5 w-5" />
                      </button>
                    )}
                    <button
                      onClick={() => handleCustomize(bot.id)}
                      className="p-1 text-blue-600 hover:text-blue-700"
                      title="Configure bot"
                    >
                      <Settings className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {bot.topics.map((topic) => (
                    <span
                      key={topic}
                      className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full text-xs"
                    >
                      {topic}
                    </span>
                  ))}
                </div>

                <div className="text-sm text-gray-500 dark:text-gray-400">
                  <p>Posts per day: {bot.daily_post_limit}</p>
                  <p>
                    Last post:{' '}
                    {bot.last_post_at
                      ? new Date(bot.last_post_at).toLocaleDateString()
                      : 'Never'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}