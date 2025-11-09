import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

interface Transaction {
  id: string;
  amount: number;
  type: string;
  note: string;
  transaction_date: string;
  categories: { name: string; icon: string } | null;
}

export default function Entries() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    if (user) loadTransactions();
  }, [user]);

  const loadTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*, categories(name, icon)')
        .eq('user_id', user?.id)
        .order('transaction_date', { ascending: false })
        .limit(50);

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error('Error loading transactions:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => navigate(-1)}>
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold">Entries</h1>
        </div>

        <h2 className="text-lg font-semibold mb-4">Latest Entries</h2>

        <div className="space-y-3">
          {transactions.map(transaction => (
            <Card key={transaction.id}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                    <span>{transaction.categories?.icon || '📝'}</span>
                  </div>
                  <div>
                    <div className="font-medium">{transaction.categories?.name || 'Other'}</div>
                    <div className="text-xs text-muted-foreground">
                      {format(new Date(transaction.transaction_date), 'dd MMM yyyy')}
                    </div>
                  </div>
                </div>
                <div className={`font-semibold ${transaction.type === 'income' ? 'text-success' : 'text-foreground'}`}>
                  {transaction.type === 'income' ? '+' : '-'}${Number(transaction.amount).toFixed(2)}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
