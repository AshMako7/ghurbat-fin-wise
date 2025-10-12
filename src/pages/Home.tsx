import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, Wallet, LogOut, Sparkles } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import { useToast } from '@/hooks/use-toast';

interface Transaction {
  id: string;
  amount: number;
  type: string;
  note: string;
  transaction_date: string;
  categories: { name: string; icon: string } | null;
}

export default function Home() {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState<string>('');

  useEffect(() => {
    loadTransactions();
    loadUserProfile();
  }, [user]);

  const loadUserProfile = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      if (data?.full_name) {
        setUserName(data.full_name);
      }
    } catch (error: any) {
      console.error('Error loading profile:', error.message);
    }
  };

  const loadTransactions = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*, categories(name, icon)')
        .eq('user_id', user.id)
        .order('transaction_date', { ascending: false })
        .limit(10);

      if (error) throw error;

      setTransactions(data || []);
      
      const income = data?.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0) || 0;
      const expense = data?.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0) || 0;
      
      setTotalIncome(income);
      setTotalExpense(expense);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const balance = totalIncome - totalExpense;

  return (
    <div className="min-h-screen pb-20 bg-gradient-to-br from-background via-accent/10 to-background">
      <header className="bg-gradient-to-r from-primary to-primary-light text-primary-foreground p-6 shadow-[var(--shadow-elegant)]">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Paisay Da Nasha</h1>
            <p className="text-primary-foreground/80 text-sm mt-1">
              {userName ? `Welcome back, ${userName}!` : 'Welcome back!'}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={signOut}
            className="text-primary-foreground hover:bg-primary-foreground/10"
          >
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </header>

      <main className="max-w-lg mx-auto p-4 space-y-6">
        <Card className="bg-gradient-to-br from-primary to-primary-light text-primary-foreground border-0 shadow-[var(--shadow-strong)]">
          <CardHeader>
            <CardTitle className="text-sm font-medium opacity-90">Total Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-4xl font-bold">₨{balance.toLocaleString()}</p>
              </div>
              <Wallet className="w-12 h-12 opacity-20" />
            </div>
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="bg-primary-foreground/10 rounded-lg p-3">
                <div className="flex items-center gap-2 text-sm opacity-90">
                  <TrendingUp className="w-4 h-4" />
                  <span>Income</span>
                </div>
                <p className="text-xl font-semibold mt-1">₨{totalIncome.toLocaleString()}</p>
              </div>
              <div className="bg-primary-foreground/10 rounded-lg p-3">
                <div className="flex items-center gap-2 text-sm opacity-90">
                  <TrendingDown className="w-4 h-4" />
                  <span>Expense</span>
                </div>
                <p className="text-xl font-semibold mt-1">₨{totalExpense.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/10 shadow-[var(--shadow-elegant)]">
          <CardHeader className="bg-accent/30 border-b border-border/50">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <CardTitle className="text-lg">AI Tip of the Day</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              {balance > 0 
                ? `Great job! You're on track. Save ₨${Math.round(balance * 0.2)} more this week to boost your savings goal.`
                : 'Track your expenses daily to identify spending patterns. Small changes can make a big difference!'}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-[var(--shadow-elegant)]">
          <CardHeader>
            <CardTitle className="text-lg">Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              <p className="text-center text-muted-foreground py-8">Loading...</p>
            ) : transactions.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No transactions yet. Add your first one!</p>
            ) : (
              transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-accent/30 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      transaction.type === 'income' ? 'bg-success/20' : 'bg-destructive/20'
                    }`}>
                      {transaction.type === 'income' ? (
                        <TrendingUp className={`w-5 h-5 text-success`} />
                      ) : (
                        <TrendingDown className={`w-5 h-5 text-destructive`} />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{transaction.categories?.name || 'Other'}</p>
                      <p className="text-xs text-muted-foreground">{transaction.note}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${
                      transaction.type === 'income' ? 'text-success' : 'text-destructive'
                    }`}>
                      {transaction.type === 'income' ? '+' : '-'}₨{Number(transaction.amount).toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(transaction.transaction_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </main>

      <BottomNav />
    </div>
  );
}