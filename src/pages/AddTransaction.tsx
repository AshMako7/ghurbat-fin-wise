import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Calendar as CalendarIcon } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';

interface Category {
  id: string;
  name: string;
  type: string;
  icon: string;
}

export default function AddTransaction() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [date, setDate] = useState<Date>(new Date());

  useEffect(() => {
    loadCategories();
  }, [type]);

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('type', type);

      if (error) throw error;
      setCategories(data || []);
      if (data && data.length > 0) {
        setSelectedCategory(data[0].id);
      }
    } catch (error: any) {
      console.error('Error loading categories:', error.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || !selectedCategory) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { error } = await supabase.from('transactions').insert({
        user_id: user?.id,
        category_id: selectedCategory,
        amount: parseFloat(amount),
        type,
        note: note || null,
        transaction_date: format(date, 'yyyy-MM-dd'),
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: `${type === 'income' ? 'Income' : 'Expense'} added successfully`,
      });

      setAmount('');
      setNote('');
      setDate(new Date());
      navigate('/home');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => navigate(-1)}>
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold">Add {type === 'income' ? 'Income' : 'Expense'}</h1>
        </div>

        <div className="flex gap-2 mb-6">
          <Button
            variant={type === 'income' ? 'default' : 'outline'}
            className="flex-1 h-12"
            onClick={() => setType('income')}
          >
            Add Income
          </Button>
          <Button
            variant={type === 'expense' ? 'default' : 'outline'}
            className="flex-1 h-12"
            onClick={() => setType('expense')}
          >
            Add Expense
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label>{type === 'income' ? 'Income' : 'Expense'} Title</Label>
            <Input
              placeholder={type === 'income' ? 'Side Business' : 'Family Expense'}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="h-12"
            />
          </div>

          <div className="space-y-2">
            <Label>Amount</Label>
            <Input
              type="number"
              placeholder="1,368|"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              className="h-12"
              step="0.01"
            />
          </div>

          <div className="space-y-2">
            <Label>{type === 'income' ? 'Income' : 'Expense'} Category</Label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    <div className="flex items-center gap-2">
                      <span>{category.icon}</span>
                      <span>{category.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full h-12 justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, 'PPP') : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(day) => day && setDate(day)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <Button type="submit" className="w-full h-14 text-base font-semibold">
            ADD {type.toUpperCase()}
          </Button>
        </form>
      </div>
    </div>
  );
}