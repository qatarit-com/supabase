import React, { useState, useEffect } from 'react';
import { Settings, Save } from 'lucide-react';
import { useAI } from '../hooks/useAI';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/database';
import type { BotConfig } from '../types';

export default function BotConfig() {
  const { user } = useAuth();
  const { configureBot, error: aiError } = useAI();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [config, setConfig] = useState<BotConfig>({
    name: 'TechBot',
    topics: ['AI', 'Technology', 'Innovation'],
    postFrequency: 'medium',
    tone: 'professional',
    hashtags: ['#AI', '#Tech', '#Future']
  });

  useEffect(() => {
    const loadBotConfig = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('bots')
          .select('*')
          .eq('owner_id', user.id)
          .maybeSingle(); // Use maybeSingle() instead of single()

        if (error && error.code !== 'PGRST116') {
          throw error;
        }

        if (data) {
          setConfig({
            name: data.name,
            topics: data.topics || ['AI', 'Technology', 'Innovation'],
            postFrequency: 'medium',
            tone: data.personality || 'professional',
            hashtags: (data.topics || ['AI', 'Technology', 'Innovation']).map(
              (t: string) => `#${t.replace(/\s+/g, '')}`
            )
          });
        }
        // If no data, keep the default config
      } catch (err) {
        console.error('Error loading bot config:', err);
        setError('Failed to load bot configuration');
      }
    };

    loadBotConfig();
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    
    try {
      await configureBot(config);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Settings className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <h2 className="ml-2 text-lg font-semibold text-gray-900 dark:text-gray-100">Bot Configuration</h2>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          <Save className="h-4 w-4 mr-1" />
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Bot Name</label>
          <input
            type="text"
            value={config.name}
            onChange={(e) => setConfig({ ...config, name: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Topics</label>
          <input
            type="text"
            value={config.topics.join(', ')}
            onChange={(e) => setConfig({ ...config, topics: e.target.value.split(',').map(t => t.trim()) })}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400"
            placeholder="AI, Technology, Innovation"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Post Frequency</label>
          <select
            value={config.postFrequency}
            onChange={(e) => setConfig({ ...config, postFrequency: e.target.value as BotConfig['postFrequency'] })}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400"
          >
            <option value="low">Low (1-2 posts/day)</option>
            <option value="medium">Medium (5-7 posts/day)</option>
            <option value="high">High (10+ posts/day)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Communication Tone</label>
          <select
            value={config.tone}
            onChange={(e) => setConfig({ ...config, tone: e.target.value as BotConfig['tone'] })}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400"
          >
            <option value="professional">Professional</option>
            <option value="casual">Casual</option>
            <option value="friendly">Friendly</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Hashtags</label>
          <input
            type="text"
            value={config.hashtags.join(', ')}
            onChange={(e) => setConfig({ ...config, hashtags: e.target.value.split(',').map(t => t.trim()) })}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400"
            placeholder="#AI, #Tech, #Future"
          />
        </div>
      </div>

      {(error || aiError) && (
        <div className="mt-4 text-red-500 text-sm">
          {error || aiError}
        </div>
      )}
    </div>
  );
}