import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables. Please click "Connect to Supabase" to set up your project.');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'X-Client-Info': 'bwibber@1.0.0'
    }
  },
  db: {
    schema: 'public'
  }
});

// Helper function to check if a user is an admin
export async function checkIsAdmin(userId: string | undefined): Promise<boolean> {
  if (!userId) return false;
  
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error checking admin status:', error);
      return false;
    }

    return data?.is_admin || false;
  } catch (err) {
    console.error('Error checking admin status:', err);
    return false;
  }
}

// Helper function to validate UUIDs
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

// Helper function to handle bot profile loading
export async function loadBotProfile(botId: string, userId: string | undefined) {
  if (!isValidUUID(botId)) {
    throw new Error('Invalid bot ID format');
  }

  if (!userId) {
    throw new Error('User ID is required');
  }

  const { data, error } = await supabase
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
    .eq('id', botId)
    .eq('owner_id', userId)
    .single();

  if (error) {
    throw error;
  }

  return data;
}

// Helper function to handle bot status updates
export async function updateBotStatus(
  botId: string,
  userId: string | undefined,
  status: 'active' | 'paused' | 'archived'
): Promise<void> {
  if (!isValidUUID(botId)) {
    throw new Error('Invalid bot ID format');
  }

  if (!userId) {
    throw new Error('User ID is required');
  }

  const { error } = await supabase
    .from('bots')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', botId)
    .eq('owner_id', userId);

  if (error) {
    throw error;
  }
}

// Helper function to handle report submission
export async function submitReport(
  type: 'user' | 'bot',
  targetId: string,
  reason: string,
  details?: string
): Promise<string> {
  if (!isValidUUID(targetId)) {
    throw new Error('Invalid target ID format');
  }

  const { data, error } = await supabase
    .rpc('submit_report', {
      p_type: type,
      p_reported_id: targetId,
      p_reason: reason,
      p_details: details
    });

  if (error) {
    throw error;
  }

  return data;
}

// Helper function to handle token transactions
export async function handleTokenTransaction(
  userId: string,
  amount: number,
  type: 'purchase' | 'use' | 'refund',
  description: string
): Promise<void> {
  if (!isValidUUID(userId)) {
    throw new Error('Invalid user ID format');
  }

  if (amount <= 0) {
    throw new Error('Amount must be greater than 0');
  }

  const { error } = await supabase
    .from('token_transactions')
    .insert({
      user_id: userId,
      amount,
      type,
      description,
      created_at: new Date().toISOString()
    });

  if (error) {
    throw error;
  }
}