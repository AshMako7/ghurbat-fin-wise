import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Receipt, TrendingUp, Calendar as CalendarIcon, MoreHorizontal } from 'lucide-react';
import { format, startOfMonth, endOfMonth } from 'date-fns';

interface Transaction {
  id: string;
  amount: number;
  type: string;
  note: string;
  transaction_date: string;
  category_id: string;
  categories: { name: string; icon: string } | null;
}

export default function Overview() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  useEffect(() => {
    if (user) loadData();
  }, [user, selectedMonth]);

  const loadData = async () => {
    try {
      const start = startOfMonth(selectedMonth);
      const end = endOfMonth(selectedMonth);

      const { data, error } = await supabase
        .from('transactions')
        .select('*, categories(name, icon)')
        .eq('user_id', user?.id)
        .gte('transaction_date', format(start, 'yyyy-MM-dd'))
        .lte('transaction_date', format(end, 'yyyy-MM-dd'))
        .order('transaction_date', { ascending: false });

      if (error) throw error;

      setTransactions(data || []);

      const income = data?.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0) || 0;
      const expenses = data?.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0) || 0;

      setTotalIncome(income);
      setTotalExpenses(expenses);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const expensesByCategory = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      const category = t.categories?.name || 'Other';
      acc[category] = (acc[category] || 0) + Number(t.amount);
      return acc;
    }, {} as Record<string, number>);

  const chartData = Object.entries(expensesByCategory).slice(0, 3);
  const chartColors = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))'];

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Overview</h1>
          <div className="w-10 h-10 bg-primary rounded-full" />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <Card className="bg-muted/30">
            <CardContent className="p-4 text-center">
              <Receipt className="w-5 h-5 mx-auto mb-2 text-muted-foreground" />
              <div className="text-xs text-muted-foreground mb-1">First Salary</div>
              <div className="font-bold">${totalIncome.toFixed(0)}</div>
            </CardContent>
          </Card>
          
          <Card className="bg-primary">
            <CardContent className="p-4 text-center">
              <Receipt className="w-5 h-5 mx-auto mb-2 text-primary-foreground" />
              <div className="text-xs text-primary-foreground/80 mb-1">Total Expense</div>
              <div className="font-bold text-primary-foreground">${totalExpenses.toFixed(0)}</div>
            </CardContent>
          </Card>

          <Card className="bg-muted/30">
            <CardContent className="p-4 text-center">
              <TrendingUp className="w-5 h-5 mx-auto mb-2 text-muted-foreground" />
              <div className="text-xs text-muted-foreground mb-1">Monthly</div>
              <div className="font-bold">${(totalIncome - totalExpenses).toFixed(0)}</div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-3 mb-6">
          <Button variant="outline" size="sm" className="flex-1">
            <CalendarIcon className="w-4 h-4 mr-2" />
            Saving
          </Button>
          <Button variant="outline" size="sm" className="flex-1">
            <Receipt className="w-4 h-4 mr-2" />
            Remind
          </Button>
          <Button variant="outline" size="sm" className="flex-1">
            <TrendingUp className="w-4 h-4 mr-2" />
            Budget
          </Button>
        </div>

        {/* Latest Entries */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Latest Entries</h2>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="w-5 h-5" />
            </Button>
          </div>

          <div className="space-y-3">
            {transactions.slice(0, 3).map(transaction => (
              <Card key={transaction.id}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                      <span>{transaction.categories?.icon || '📝'}</span>
                    </div>
                    <div>
                      <div className="font-medium">{transaction.categories?.name || 'Other'}</div>
                      <div className="text-xs text-muted-foreground">{format(new Date(transaction.transaction_date), 'dd MMM yyyy')}</div>
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

        {/* Expense Chart */}
        {chartData.length > 0 && (
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4">Spending by Category</h3>
              <div className="flex justify-center mb-4">
                <div className="relative w-40 h-40">
                  <svg viewBox="0 0 100 100" className="transform -rotate-90">
                    {chartData.map((_, index) => {
                      const total = chartData.reduce((sum, [, val]) => sum + val, 0);
                      const percentage = (chartData[index][1] / total) * 100;
                      const offset = chartData.slice(0, index).reduce((sum, [, val]) => sum + (val / total) * 100, 0);
                      
                      return (
                        <circle
                          key={index}
                          cx="50"
                          cy="50"
                          r="40"
                          fill="none"
                          stroke={chartColors[index]}
                          strokeWidth="20"
                          strokeDasharray={`${percentage * 2.51} ${251 - percentage * 2.51}`}
                          strokeDashoffset={-offset * 2.51}
                        />
                      );
                    })}
                  </svg>
                </div>
              </div>
              <div className="space-y-2">
                {chartData.map(([category, amount], index) => (
                  <div key={category} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: chartColors[index] }} />
                      <span className="text-sm">{category}</span>
                    </div>
                    <span className="text-sm font-medium">${amount.toFixed(0)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
