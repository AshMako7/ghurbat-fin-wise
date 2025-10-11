import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Target, Plus, Calendar, TrendingUp } from 'lucide-react';
import BottomNav from '@/components/BottomNav';

interface Goal {
  id: string;
  title: string;
  target_amount: number;
  current_amount: number;
  target_date: string;
}

export default function Goals() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [targetDate, setTargetDate] = useState('');

  useEffect(() => {
    loadGoals();
  }, [user]);

  const loadGoals = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGoals(data || []);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const { error } = await supabase.from('goals').insert({
        user_id: user.id,
        title,
        target_amount: parseFloat(targetAmount),
        target_date: targetDate,
      });

      if (error) throw error;

      toast({
        title: 'Success!',
        description: 'Goal created successfully.',
      });

      setTitle('');
      setTargetAmount('');
      setTargetDate('');
      setDialogOpen(false);
      loadGoals();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const calculateMonthlyTarget = (goal: Goal) => {
    const today = new Date();
    const target = new Date(goal.target_date);
    const monthsLeft = Math.max(1, (target.getFullYear() - today.getFullYear()) * 12 + target.getMonth() - today.getMonth());
    const remaining = goal.target_amount - goal.current_amount;
    return (remaining / monthsLeft).toFixed(0);
  };

  const calculateProgress = (goal: Goal) => {
    return (goal.current_amount / goal.target_amount) * 100;
  };

  return (
    <div className="min-h-screen pb-20 bg-gradient-to-br from-background via-accent/10 to-background">
      <header className="bg-gradient-to-r from-primary to-primary-light text-primary-foreground p-6 shadow-[var(--shadow-elegant)]">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center gap-3">
            <Target className="w-8 h-8" />
            <h1 className="text-2xl font-bold">Financial Goals</h1>
          </div>
          <p className="text-primary-foreground/80 text-sm mt-2">Track and achieve your savings goals</p>
        </div>
      </header>

      <main className="max-w-lg mx-auto p-4 space-y-4">
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full h-12 bg-gradient-to-r from-primary to-primary-light hover:opacity-90 shadow-[var(--shadow-elegant)]">
              <Plus className="w-5 h-5 mr-2" />
              Set New Goal
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-[90%] rounded-lg">
            <DialogHeader>
              <DialogTitle>Create New Goal</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Goal Title</Label>
                <Input
                  id="title"
                  placeholder="e.g., Save for a car"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Target Amount (₨)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="500000"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Target Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  required
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <Button type="submit" className="w-full">Create Goal</Button>
            </form>
          </DialogContent>
        </Dialog>

        {loading ? (
          <p className="text-center text-muted-foreground py-8">Loading...</p>
        ) : goals.length === 0 ? (
          <Card className="shadow-[var(--shadow-elegant)]">
            <CardContent className="py-12 text-center">
              <Target className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">No goals yet. Set your first goal!</p>
            </CardContent>
          </Card>
        ) : (
          goals.map((goal) => {
            const progress = calculateProgress(goal);
            const monthlyTarget = calculateMonthlyTarget(goal);
            const daysLeft = Math.ceil((new Date(goal.target_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

            return (
              <Card key={goal.id} className="shadow-[var(--shadow-elegant)] overflow-hidden">
                <div className="bg-gradient-to-r from-primary/10 to-primary-light/10 border-b border-border p-4">
                  <CardTitle className="text-xl">{goal.title}</CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-2">
                    <Calendar className="w-4 h-4" />
                    {daysLeft} days left
                  </CardDescription>
                </div>
                <CardContent className="pt-6 space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-semibold">{progress.toFixed(1)}%</span>
                    </div>
                    <Progress value={progress} className="h-3" />
                    <div className="flex justify-between text-sm mt-2">
                      <span className="text-muted-foreground">₨{goal.current_amount.toLocaleString()}</span>
                      <span className="font-semibold text-primary">₨{goal.target_amount.toLocaleString()}</span>
                    </div>
                  </div>

                  <Card className="bg-accent/30 border-primary/10">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                          <TrendingUp className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium mb-1">AI Suggestion</p>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            Save ₨{monthlyTarget} per month to reach your goal. 
                            Investing with 8% annual return could help you achieve this faster!
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>
            );
          })
        )}
      </main>

      <BottomNav />
    </div>
  );
}