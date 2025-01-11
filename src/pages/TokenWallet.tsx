import React, { useState, useEffect } from 'react';
import { Coins, ArrowDown, ArrowUp, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/database';
import TokenStore from '../components/TokenStore';

interface Transaction {
  id: string;
  amount: number;
  type: 'purchase' | 'use' | 'refund';
  description: string;
  created_at: string;
}

export default function TokenWallet() {
  const { user } = useAuth();
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchBalance();
      fetchTransactions();
    }
  }, [user]);

  const fetchBalance = async () => {
    try {
      const { data, error } = await supabase
        .rpc('get_user_balance', { p_user_id: user?.id });

      if (error) throw error;
      setBalance(data || 0);
    } catch (err) {
      console.error('Error fetching balance:', err);
    }
  };

  const fetchTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('token_transactions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setTransactions(data || []);
    } catch (err) {
      console.error('Error fetching transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTokenPurchase = () => {
    fetchBalance();
    fetchTransactions();
  };

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-6">
      {/* Balance Card */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Token Balance</h2>
            <p className="text-4xl font-bold text-blue-600 dark:text-blue-400 mt-2">
              {balance} tokens
            </p>
          </div>
          <Coins className="h-12 w-12 text-blue-600 dark:text-blue-400" />
        </div>
      </div>

      {/* Token Store */}
      <TokenStore onSuccess={handleTokenPurchase} />

      {/* Transaction History */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Recent Transactions
          </h3>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {loading ? (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              Loading transactions...
            </div>
          ) : transactions.length === 0 ? (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              No transactions yet
            </div>
          ) : (
            transactions.map((tx) => (
              <div key={tx.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {tx.type === 'purchase' ? (
                      <ArrowUp className="h-5 w-5 text-green-500" />
                    ) : (
                      <ArrowDown className="h-5 w-5 text-red-500" />
                    )}
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {tx.description}
                      </p>
                      <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                        <Clock className="h-3 w-3 mr-1" />
                        {new Date(tx.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <span className={`font-medium ${
                    tx.type === 'purchase' 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {tx.type === 'purchase' ? '+' : ''}{tx.amount}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}