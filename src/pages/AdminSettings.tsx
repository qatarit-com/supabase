import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/database';
import { Settings, Coins, TrendingUp, Users, Bot, Save, Flag, AlertTriangle, Activity } from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

interface SystemStats {
  totalUsers: number;
  totalBots: number;
  totalTokens: number;
  activeUsers: number;
  activeBots: number;
}

interface TokenCosts {
  botCreation: number;
  postGeneration: number;
  templateCreation: number;
}

interface Report {
  id: string;
  type: 'user' | 'bot';
  reporter: {
    name: string;
    email: string;
  };
  reported: {
    name: string;
    email?: string;
  };
  reason: string;
  details: string;
  status: 'pending' | 'resolved' | 'dismissed';
  created_at: string;
}

export default function AdminSettings() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [tokenCosts, setTokenCosts] = useState<TokenCosts>({
    botCreation: 50,
    postGeneration: 10,
    templateCreation: 25
  });
  const [reports, setReports] = useState<Report[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'reports' | 'settings'>('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/signin');
      return;
    }

    loadSystemStats();
    loadTokenCosts();
    loadReports();
  }, [user, navigate]);

  const loadSystemStats = async () => {
    try {
      const { data, error } = await supabase.rpc('get_system_stats');
      if (error) throw error;
      setStats(data);
    } catch (err) {
      console.error('Error loading system stats:', err);
      setError('Failed to load system statistics');
    }
  };

  const loadTokenCosts = async () => {
    try {
      const { data, error } = await supabase.rpc('get_token_costs');
      if (error) throw error;
      setTokenCosts(data);
    } catch (err) {
      console.error('Error loading token costs:', err);
      setError('Failed to load token costs');
    }
  };

  const loadReports = async () => {
    try {
      const { data, error } = await supabase
        .from('reports')
        .select(`
          id,
          type,
          reason,
          details,
          status,
          created_at,
          reporter:profiles!reporter_id(name, email),
          reported_user:profiles!reported_id(name, email),
          reported_bot:bots!reported_bot_id(name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setReports(data?.map(report => ({
        id: report.id,
        type: report.type,
        reporter: report.reporter,
        reported: report.type === 'user' 
          ? report.reported_user 
          : { name: report.reported_bot.name },
        reason: report.reason,
        details: report.details,
        status: report.status,
        created_at: report.created_at
      })) || []);
    } catch (err) {
      console.error('Error loading reports:', err);
      setError('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTokenCosts = async () => {
    try {
      const { error } = await supabase.rpc('update_token_costs', {
        p_bot_creation: tokenCosts.botCreation,
        p_post_generation: tokenCosts.postGeneration,
        p_template_creation: tokenCosts.templateCreation
      });

      if (error) throw error;
      setSuccess('Token costs updated successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error updating token costs:', err);
      setError('Failed to update token costs');
    }
  };

  const handleResolveReport = async (reportId: string, status: 'resolved' | 'dismissed', notes?: string) => {
    try {
      const { error } = await supabase.rpc('resolve_report', {
        p_report_id: reportId,
        p_status: status,
        p_notes: notes
      });

      if (error) throw error;
      await loadReports();
      setSuccess(`Report ${status} successfully`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error resolving report:', err);
      setError('Failed to resolve report');
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      {/* Rest of the JSX remains the same */}
    </div>
  );
}