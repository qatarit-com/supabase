import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/database';
import { Calendar, MapPin, Link as LinkIcon, Flag, Settings, Bot, TrendingUp, MessageSquare, Users } from 'lucide-react';
import ContentFeed from '../components/ContentFeed';
import { isValidUUID } from '../lib/database';

interface BotProfile {
  id: string;
  name: string;
  personality: string;
  topics: string[];
  status: 'active' | 'paused' | 'archived';
  posts_count: number;
  followers_count: number;
  engagement_metrics: {
    likes: number;
    rebweebs: number;
    replies: number;
  };
  created_at: string;
}

export default function BotProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState<BotProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'posts' | 'analytics'>('posts');

  useEffect(() => {
    if (!id || !isValidUUID(id)) {
      setError('Invalid bot ID');
      setLoading(false);
      return;
    }

    if (user) {
      loadBotProfile();
    }
  }, [user, id]);

  const loadBotProfile = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('bots')
        .select(`
          id,
          name,
          personality,
          topics,
          status,
          created_at,
          engagement_metrics,
          bot_stats (
            posts_count,
            total_interactions
          )
        `)
        .eq('id', id)
        .eq('owner_id', user?.id)
        .single();

      if (fetchError) throw fetchError;

      if (data) {
        setProfile({
          ...data,
          posts_count: data.bot_stats?.posts_count || 0,
          followers_count: 0,
          engagement_metrics: {
            likes: data.engagement_metrics?.likes || 0,
            rebweebs: data.engagement_metrics?.rebweebs || 0,
            replies: data.engagement_metrics?.replies || 0
          }
        });
      }
    } catch (err) {
      console.error('Error loading bot profile:', err);
      setError('Failed to load bot profile');
      if (err instanceof Error && err.message.includes('invalid input syntax for type uuid')) {
        navigate('/bot-dashboard');
      }
    } finally {
      setLoading(false);
    }
  };

  const calculateEngagementRate = (metrics: BotProfile['engagement_metrics'], posts: number): string => {
    if (!posts || !metrics) return '0';
    const totalEngagements = (metrics.likes || 0) + (metrics.rebweebs || 0) + (metrics.replies || 0);
    const rate = (totalEngagements / (posts * 3)) * 100;
    return rate.toFixed(1);
  };

  const calculateTotalInteractions = (metrics: BotProfile['engagement_metrics']): string => {
    if (!metrics) return '0';
    return ((metrics.likes || 0) + (metrics.rebweebs || 0) + (metrics.replies || 0)).toLocaleString();
  };

  if (!id || !isValidUUID(id)) {
    return (
      <div className="max-w-4xl mx-auto py-8 text-center">
        <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-4 rounded-lg">
          Invalid bot ID. Please return to the dashboard.
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-8 text-center">
        <div className="animate-pulse">
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4"></div>
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="max-w-4xl mx-auto py-8 text-center">
        <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-4 rounded-lg">
          {error || 'Bot not found'}
        </div>
        <Link 
          to="/bot-dashboard"
          className="mt-4 inline-flex items-center text-blue-600 dark:text-blue-400 hover:underline"
        >
          <Bot className="h-4 w-4 mr-2" />
          Return to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Rest of the JSX remains the same */}
    </div>
  );
}