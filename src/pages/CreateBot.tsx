import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Bot, Coins, Sparkles, Wand2, Plus, MessageSquare } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/database';
import TokenStore from '../components/TokenStore';

interface BotTemplate {
  id: string;
  name: string;
  description: string;
  personality: string;
  topics: string[];
  token_cost: number;
}

interface BotConfig {
  name: string;
  personality: 'professional' | 'casual' | 'enthusiastic' | 'analytical';
  topics: string[];
  tokens: number;
}

export default function CreateBot() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showTokenStore, setShowTokenStore] = useState(false);
  const [templates, setTemplates] = useState<BotTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<BotTemplate | null>(null);
  const [generatingTemplate, setGeneratingTemplate] = useState(false);
  const [showTemplateInput, setShowTemplateInput] = useState(false);
  const [templatePrompt, setTemplatePrompt] = useState('');
  const [botConfig, setBotConfig] = useState<BotConfig>({
    name: '',
    personality: 'professional',
    topics: ['Technology', 'AI', 'Innovation'],
    tokens: 50
  });

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('bot_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (err) {
      console.error('Error fetching templates:', err);
      setError('Failed to load templates');
    }
  };

  const handleTemplateSelect = (template: BotTemplate) => {
    setSelectedTemplate(template);
    setBotConfig({
      name: template.name,
      personality: template.personality as BotConfig['personality'],
      topics: template.topics,
      tokens: template.token_cost
    });
  };

  const generateNewTemplate = async () => {
    if (!user || !templatePrompt.trim()) return;
    
    setGeneratingTemplate(true);
    setError(null);
    
    try {
      // Extract topics and personality from the prompt
      const topics = templatePrompt
        .toLowerCase()
        .split(/[,.]/)
        .map(t => t.trim())
        .filter(t => t.length > 0);

      // Determine personality based on prompt keywords
      let personality: BotConfig['personality'] = 'professional';
      if (templatePrompt.toLowerCase().includes('casual') || templatePrompt.toLowerCase().includes('friendly')) {
        personality = 'casual';
      } else if (templatePrompt.toLowerCase().includes('enthusiastic') || templatePrompt.toLowerCase().includes('excited')) {
        personality = 'enthusiastic';
      } else if (templatePrompt.toLowerCase().includes('analytical') || templatePrompt.toLowerCase().includes('detailed')) {
        personality = 'analytical';
      }

      // Check if user has enough tokens
      const { data: hasTokens, error: checkError } = await supabase
        .rpc('check_token_balance', {
          p_user_id: user.id,
          p_required_amount: 25 // Cost for generating a template
        });

      if (checkError) throw checkError;

      if (!hasTokens) {
        setShowTokenStore(true);
        return;
      }

      // Create a new template using the create_bot_template RPC
      const { data: newTemplate, error: createError } = await supabase
        .rpc('create_bot_template', {
          p_owner_id: user.id,
          p_topics: topics,
          p_personality: personality
        });

      if (createError) throw createError;

      // Add the new template to the list and select it
      if (newTemplate) {
        await fetchTemplates(); // Refresh the entire list
        setSelectedTemplate(newTemplate);
        setBotConfig({
          name: newTemplate.name,
          personality: newTemplate.personality as BotConfig['personality'],
          topics: newTemplate.topics,
          tokens: newTemplate.token_cost
        });
        setShowTemplateInput(false);
        setTemplatePrompt('');
      }
    } catch (err) {
      console.error('Error generating template:', err);
      setError('Failed to generate template. Please try again.');
    } finally {
      setGeneratingTemplate(false);
    }
  };

  // Rest of the component remains the same...

  return (
    <div className="max-w-4xl mx-auto py-8">
      {/* Templates Section */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Quick Start Templates
          </h2>
          <button
            onClick={() => setShowTemplateInput(!showTemplateInput)}
            className="flex items-center px-3 py-1.5 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
          >
            <Wand2 className="h-4 w-4 mr-1.5" />
            Suggest Template
          </button>
        </div>

        {showTemplateInput && (
          <div className="mb-4 bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Describe your ideal bot template
              </label>
              <textarea
                value={templatePrompt}
                onChange={(e) => setTemplatePrompt(e.target.value)}
                placeholder="Example: A casual tech news bot that covers AI, machine learning, and startup news"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                rows={3}
              />
            </div>
            <div className="flex justify-end">
              <button
                onClick={generateNewTemplate}
                disabled={generatingTemplate || !templatePrompt.trim()}
                className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                {generatingTemplate ? 'Generating...' : 'Generate Template'}
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Rest of the template section remains the same... */}
      </div>

      {/* Rest of the component remains the same... */}
    </div>
  );
}