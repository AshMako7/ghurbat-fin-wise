import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, PieChart as PieChartIcon } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import { useToast } from '@/hooks/use-toast';

interface CategoryTotal {
  category: string;
  total: number;
  color: string;
}

export default function Insights() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [expensesByCategory, setExpensesByCategory] = useState<CategoryTotal[]>([]);
  const [loading, setLoading] = useState(true);

  const categoryColors = [
    'hsl(var(--primary))',
    'hsl(var(--primary-light))',
    'hsl(350 85% 55%)',
    'hsl(340 80% 60%)',
    'hsl(330 75% 65%)',
    'hsl(320 70% 70%)',
  ];

  useEffect(() => {
    loadInsights();
  }, [user]);

  const loadInsights = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*, categories(name)')
        .eq('user_id', user.id)
        .eq('type', 'expense');

      if (error) throw error;

      const grouped = data?.reduce((acc: any, transaction) => {
        const category = transaction.categories?.name || 'Other';
        if (!acc[category]) {
          acc[category] = 0;
        }
        acc[category] += Number(transaction.amount);
        return acc;
      }, {});

      const totals: CategoryTotal[] = Object.entries(grouped || {})
        .map(([category, total], index) => ({
          category,
          total: total as number,
          color: categoryColors[index % categoryColors.length],
        }))
        .sort((a, b) => b.total - a.total);

      setExpensesByCategory(totals);
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

  const totalExpenses = expensesByCategory.reduce((sum, cat) => sum + cat.total, 0);

  return (
    <div className="min-h-screen pb-20 bg-gradient-to-br from-background via-accent/10 to-background">
      <header className="bg-gradient-to-r from-primary to-primary-light text-primary-foreground p-6 shadow-[var(--shadow-elegant)]">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-8 h-8" />
            <h1 className="text-2xl font-bold">Insights</h1>
          </div>
          <p className="text-primary-foreground/80 text-sm mt-2">Understand your spending patterns</p>
        </div>
      </header>

      <main className="max-w-lg mx-auto p-4 space-y-6">
        <Card className="shadow-[var(--shadow-elegant)]">
          <CardHeader className="bg-accent/30 border-b border-border/50">
            <div className="flex items-center gap-2">
              <PieChartIcon className="w-5 h-5 text-primary" />
              <CardTitle className="text-lg">Spending by Category</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {loading ? (
              <p className="text-center text-muted-foreground py-8">Loading...</p>
            ) : expensesByCategory.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No expense data yet</p>
            ) : (
              <div className="space-y-4">
                {expensesByCategory.map((category) => {
                  const percentage = (category.total / totalExpenses) * 100;
                  return (
                    <div key={category.category} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{category.category}</span>
                        <div className="text-right">
                          <p className="font-semibold">₨{category.total.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">{percentage.toFixed(1)}%</p>
                        </div>
                      </div>
                      <div className="h-3 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full transition-all duration-300"
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: category.color,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-[var(--shadow-elegant)]">
          <CardHeader className="bg-accent/30 border-b border-border/50">
            <CardTitle className="text-lg">Total Expenses</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-4xl font-bold text-primary">₨{totalExpenses.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground mt-2">This month</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-primary/5 to-primary-light/5 border-primary/20 shadow-[var(--shadow-elegant)]">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <BarChart3 className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-semibold mb-1">Premium Features Coming Soon</p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Advanced AI projections, budget alerts, and detailed reports will be available in the premium version.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      <BottomNav />
    </div>
  );
}