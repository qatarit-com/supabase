import React, { useState } from 'react';
import { Coins, Package, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/database';

interface TokenStoreProps {
  onSuccess?: () => void;
}

interface TokenPackage {
  id: string;
  name: string;
  tokens: number;
  description: string;
  icon: 'basic' | 'pro' | 'enterprise';
}

const tokenPackages: TokenPackage[] = [
  {
    id: 'basic',
    name: 'Basic Pack',
    tokens: 100,
    description: 'Perfect for getting started',
    icon: 'basic'
  },
  {
    id: 'pro',
    name: 'Pro Pack',
    tokens: 500,
    description: 'Most popular choice',
    icon: 'pro'
  },
  {
    id: 'enterprise',
    name: 'Enterprise Pack',
    tokens: 2000,
    description: 'For power users',
    icon: 'enterprise'
  }
];

const getPackageIcon = (type: TokenPackage['icon']) => {
  switch (type) {
    case 'basic':
      return <Package className="h-8 w-8 text-blue-500" />;
    case 'pro':
      return <Zap className="h-8 w-8 text-purple-500" />;
    case 'enterprise':
      return <Coins className="h-8 w-8 text-yellow-500" />;
  }
};

export default function TokenStore({ onSuccess }: TokenStoreProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const purchaseTokens = async (packageId: string, tokenAmount: number) => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Start a Supabase transaction
      const { data: transactionData, error: transactionError } = await supabase
        .rpc('purchase_tokens', {
          p_user_id: user.id,
          p_amount: tokenAmount,
          p_package_id: packageId
        });

      if (transactionError) throw transactionError;

      setSuccess(`Successfully added ${tokenAmount} tokens!`);
      
      // Call onSuccess callback after successful purchase
      setTimeout(() => {
        onSuccess?.();
      }, 1500);
    } catch (err) {
      console.error('Error purchasing tokens:', err);
      setError('Failed to purchase tokens. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-center mb-6">
        <Coins className="h-6 w-6 text-yellow-500" />
        <h2 className="ml-2 text-lg font-semibold text-gray-900 dark:text-white">
          Token Store
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {tokenPackages.map((pkg) => (
          <div
            key={pkg.id}
            className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-blue-500 dark:hover:border-blue-400 transition-colors cursor-pointer"
            onClick={() => !loading && purchaseTokens(pkg.id, pkg.tokens)}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                {getPackageIcon(pkg.icon)}
                <div className="ml-3">
                  <h3 className="text-base font-medium text-gray-900 dark:text-white">
                    {pkg.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {pkg.description}
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-4 text-center">
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {pkg.tokens} tokens
              </span>
            </div>
            <button
              className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Get Tokens'}
            </button>
          </div>
        ))}
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg text-sm">
          {success}
        </div>
      )}
    </div>
  );
}