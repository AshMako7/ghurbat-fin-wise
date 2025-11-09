import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Target, ArrowLeft, Edit2, Trash2, PlusCircle } from 'lucide-react';

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
  const navigate = useNavigate();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
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
      if (editingGoal) {
        const { error } = await supabase
          .from('goals')
          .update({
            title,
            target_amount: parseFloat(targetAmount),
            target_date: targetDate,
          })
          .eq('id', editingGoal.id);

        if (error) throw error;

        toast({
          title: 'Success!',
          description: 'Goal updated successfully.',
        });
      } else {
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
      }

      setTitle('');
      setTargetAmount('');
      setTargetDate('');
      setEditingGoal(null);
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

  const handleEdit = (goal: Goal) => {
    setEditingGoal(goal);
    setTitle(goal.title);
    setTargetAmount(goal.target_amount.toString());
    setTargetDate(goal.target_date);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this goal?')) return;

    try {
      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Goal deleted successfully.',
      });
      loadGoals();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleDialogOpenChange = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setEditingGoal(null);
      setTitle('');
      setTargetAmount('');
      setTargetDate('');
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
    <div className="min-h-screen bg-background pb-24 px-6">
      <div className="flex items-center gap-4 mb-6 pt-6">
        <button onClick={() => navigate(-1)}>
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-2xl font-bold">Your Goals</h1>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
        </div>
      ) : goals.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No goals yet. Set your first goal!</p>
          <Button onClick={() => setDialogOpen(true)}>Set New Goal</Button>
        </div>
      ) : (
        <div className="space-y-4">
          {goals.map((goal) => (
            <Card key={goal.id} className="relative">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                      <Target className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{goal.title}</h3>
                      <p className="text-xs text-muted-foreground">
                        {Math.max(0, Math.ceil((new Date(goal.target_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))} days remaining
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(goal)}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(goal.id)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">${Number(goal.current_amount || 0).toFixed(0)}</span>
                    <span className="font-semibold">${Number(goal.target_amount).toFixed(0)}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${calculateProgress(goal)}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={handleDialogOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingGoal ? 'Edit Goal' : 'Set New Goal'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Goal Title</Label>
              <Input
                placeholder="New house"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <Label>Amount</Label>
              <Input
                type="number"
                placeholder="188,000|"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                required
                step="0.01"
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <Label>Deadline</Label>
              <Input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                required
                className="h-12"
              />
            </div>

            <Button type="submit" className="w-full h-12">
              {editingGoal ? 'Update Goal' : 'Add Goal'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Button
        onClick={() => setDialogOpen(true)}
        className="fixed bottom-24 right-6 w-14 h-14 rounded-full shadow-lg"
        size="icon"
      >
        <PlusCircle className="w-6 h-6" />
      </Button>
    </div>
  );
}