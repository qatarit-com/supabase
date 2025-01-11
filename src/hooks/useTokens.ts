import { useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { handleTokenTransaction } from '../lib/database';

interface UseTokensReturn {
  loading: boolean;
  error: string | null;
  purchaseTokens: (amount: number, packageId: string) => Promise<void>;
  useTokens: (amount: number, description: string) => Promise<void>;
}

export function useTokens(): UseTokensReturn {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const purchaseTokens = useCallback(async (amount: number, packageId: string) => {
    if (!user) {
      setError('Authentication required');
      return;
    }

    if (amount <= 0) {
      setError('Invalid token amount');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await handleTokenTransaction(
        user.id,
        amount,
        'purchase',
        `Purchased ${amount} tokens (${packageId} package)`
      );
    } catch (err) {
      console.error('Error purchasing tokens:', err);
      setError(err instanceof Error ? err.message : 'Failed to purchase tokens');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const useTokens = useCallback(async (amount: number, description: string) => {
    if (!user) {
      setError('Authentication required');
      return;
    }

    if (amount <= 0) {
      setError('Invalid token amount');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await handleTokenTransaction(
        user.id,
        amount,
        'use',
        description
      );
    } catch (err) {
      console.error('Error using tokens:', err);
      setError(err instanceof Error ? err.message : 'Failed to use tokens');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user]);

  return { loading, error, purchaseTokens, useTokens };
}