import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, Wallet, LogOut, Sparkles, Trash2, Edit, PlusCircle, Lightbulb, Newspaper, Download, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const urduTips = [
  "Beta, chai pe Rs 200 daily matlab mahine ke 6000! Ghar pe chai banao, paisa bachao! ☕",
  "Arre bhai, har impulse buy se pehle 5 second soch lo. Zaroorat hai ya sirf dil karta hai? 🤔",
  "Salary aate hi pehle khud ko pay karo - 20% bachat account mein! Baad mein kharch karna 💰",
  "Rickshaw pe 50 rupay extra dene se pehle socho - ye to nimko ka packet hai! 🛺",
  "Credit card ko debit card samjho. Jo hai utna hi kharch karo, warna tension barh jati hai! 💳",
  "Har Sunday ka khata-pani check karo. Jahan zyada ja raha hai wahan control karo! 📊",
  "Chhoti chhoti bachat mein hi asal fortune hai. Char paisa ka soch mat karo! 🪙",
  "Emergency fund banao - 3 mahine ka kharcha. Musibat mein kaam aayega! 🆘",
  "Restaurant mein har weekend? Ghar ka khaana tasty bhi, sasta bhi! 🍛",
  "ATM charges dene se acha, ek hi baar zyada amount nikalo! 🏧",
];

const getRandomTip = () => {
  const randomIndex = Math.floor(Math.random() * urduTips.length);
  return urduTips[randomIndex];
};

interface Transaction {
  id: string;
  amount: number;
  type: string;
  note: string;
  transaction_date: string;
  category_id: string | null;
  categories: { name: string; icon: string } | null;
}

interface Category {
  id: string;
  name: string;
  type: string;
  icon: string;
}

export default function Home() {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState<string>('');
  const [dailyTip, setDailyTip] = useState<string>('');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [editAmount, setEditAmount] = useState('');
  const [editNote, setEditNote] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editType, setEditType] = useState<'income' | 'expense'>('expense');
  const [editCategoryId, setEditCategoryId] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [showAllTransactions, setShowAllTransactions] = useState(false);

  useEffect(() => {
    loadTransactions();
    loadUserProfile();
    setDailyTip(getRandomTip());
  }, [user]);

  useEffect(() => {
    if (editType) {
      loadCategories();
    }
  }, [editType]);

  const loadCategories = async () => {
    const { data } = await supabase
      .from('categories')
      .select('*')
      .eq('type', editType);
    
    setCategories(data || []);
  };

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
        .order('transaction_date', { ascending: false });

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

  const handleEditTransaction = async (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setEditAmount(transaction.amount.toString());
    setEditNote(transaction.note);
    setEditDate(transaction.transaction_date);
    setEditType(transaction.type as 'income' | 'expense');
    setEditCategoryId(transaction.category_id || '');
    setEditDialogOpen(true);
  };

  const handleUpdateTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTransaction) return;

    try {
      const { error } = await supabase
        .from('transactions')
        .update({
          amount: parseFloat(editAmount),
          type: editType,
          category_id: editCategoryId,
          note: editNote,
          transaction_date: editDate,
        })
        .eq('id', editingTransaction.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Transaction updated successfully.',
      });
      setEditDialogOpen(false);
      loadTransactions();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    if (!confirm('Are you sure you want to delete this transaction?')) return;

    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Transaction deleted successfully.',
      });
      loadTransactions();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleExportToExcel = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*, categories(name, icon)')
        .eq('user_id', user.id)
        .order('transaction_date', { ascending: false });

      if (error) throw error;

      const exportData = data?.map(t => ({
        Date: new Date(t.transaction_date).toLocaleDateString(),
        Type: t.type.charAt(0).toUpperCase() + t.type.slice(1),
        Category: t.categories?.name || 'Other',
        Amount: Number(t.amount),
        Note: t.note || '',
      })) || [];

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Transactions');

      worksheet['!cols'] = [
        { wch: 12 },
        { wch: 10 },
        { wch: 15 },
        { wch: 12 },
        { wch: 30 }
      ];

      XLSX.writeFile(workbook, `Transactions_${new Date().toISOString().split('T')[0]}.xlsx`);

      toast({
        title: 'Success',
        description: 'Transactions exported successfully.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleExportToPDF = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*, categories(name, icon)')
        .eq('user_id', user.id)
        .order('transaction_date', { ascending: false });

      if (error) throw error;

      const doc = new jsPDF();
      
      // Colors from the app theme (Midnight Blue, Saffron Gold)
      const primaryBlue: [number, number, number] = [34, 48, 77]; // hsl(220, 60%, 20%)
      const saffronGold: [number, number, number] = [255, 191, 0]; // hsl(45, 100%, 50%)
      const textDark: [number, number, number] = [26, 26, 26];
      
      // Header with branding
      doc.setFillColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
      doc.rect(0, 0, 210, 40, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text('Tabeer.ai', 15, 20);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('Transaction Statement', 15, 28);
      
      // Statement date
      doc.setFontSize(9);
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, 15, 35);
      
      // Summary section
      const totalIncome = data?.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0) || 0;
      const totalExpense = data?.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0) || 0;
      const balance = totalIncome - totalExpense;
      
      doc.setTextColor(textDark[0], textDark[1], textDark[2]);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('Account Summary', 15, 50);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text(`Total Income: Rs ${totalIncome.toLocaleString()}`, 15, 57);
      doc.text(`Total Expenses: Rs ${totalExpense.toLocaleString()}`, 15, 63);
      
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(balance >= 0 ? 34 : 220, balance >= 0 ? 139 : 38, balance >= 0 ? 34 : 38);
      doc.text(`Net Balance: Rs ${balance.toLocaleString()}`, 15, 69);
      
      // Transaction table
      const tableData = data?.map(t => [
        new Date(t.transaction_date).toLocaleDateString(),
        t.categories?.name || 'Other',
        t.type.charAt(0).toUpperCase() + t.type.slice(1),
        `Rs ${Number(t.amount).toLocaleString()}`,
        t.note || '-',
      ]) || [];
      
      autoTable(doc, {
        startY: 78,
        head: [['Date', 'Category', 'Type', 'Amount', 'Note']],
        body: tableData,
        theme: 'striped',
        headStyles: {
          fillColor: primaryBlue,
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 9,
        },
        bodyStyles: {
          fontSize: 8,
          textColor: textDark,
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
        columnStyles: {
          0: { cellWidth: 25 },
          1: { cellWidth: 35 },
          2: { cellWidth: 25 },
          3: { cellWidth: 30, halign: 'right' },
          4: { cellWidth: 'auto' },
        },
        margin: { left: 15, right: 15 },
      });
      
      // Footer
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(
          `Page ${i} of ${pageCount} | Tabeer.ai - Your Financial Companion`,
          doc.internal.pageSize.width / 2,
          doc.internal.pageSize.height - 10,
          { align: 'center' }
        );
      }
      
      doc.save(`Tabeer_Statement_${new Date().toISOString().split('T')[0]}.pdf`);

      toast({
        title: 'Success',
        description: 'Statement exported successfully.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const balance = totalIncome - totalExpense;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/10 to-background">
      <header className="bg-gradient-to-r from-primary to-primary-light text-primary-foreground p-6 shadow-[var(--shadow-elegant)]">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Tabeer.ai</h1>
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

      <main className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Quick Action Card */}
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PlusCircle className="w-5 h-5" />
              Quick Actions
            </CardTitle>
            <CardDescription>Manage your transactions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button onClick={() => navigate('/add')} className="w-full" size="lg">
              <PlusCircle className="w-4 h-4 mr-2" />
              Add Transaction
            </Button>
            <div className="flex gap-2">
              <Button onClick={handleExportToExcel} variant="outline" className="flex-1" size="lg">
                <Download className="w-4 h-4 mr-2" />
                Export to Excel
              </Button>
              <Button onClick={handleExportToPDF} variant="outline" className="flex-1" size="lg">
                <FileText className="w-4 h-4 mr-2" />
                Export to PDF
              </Button>
            </div>
          </CardContent>
        </Card>

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

        {/* AI Tip of the Day */}
        <Card className="border-accent">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-yellow-500" />
              AI Tip of the Day
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {dailyTip}
            </p>
          </CardContent>
        </Card>

        {/* Financial News */}
        <Card className="border-accent">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Newspaper className="w-5 h-5" />
              Financial Insights
            </CardTitle>
            <CardDescription>Stay informed about market trends</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 rounded-lg bg-accent/20 hover:bg-accent/30 transition-colors cursor-pointer">
              <h4 className="font-medium text-sm">Global Markets Update</h4>
              <p className="text-xs text-muted-foreground mt-1">
                Markets show steady growth with technology sector leading gains...
              </p>
            </div>
            <div className="p-3 rounded-lg bg-accent/20 hover:bg-accent/30 transition-colors cursor-pointer">
              <h4 className="font-medium text-sm">Savings Rate Trends</h4>
              <p className="text-xs text-muted-foreground mt-1">
                Interest rates remain stable, good time for fixed deposits...
              </p>
            </div>
            <div className="p-3 rounded-lg bg-accent/20 hover:bg-accent/30 transition-colors cursor-pointer">
              <h4 className="font-medium text-sm">Budgeting Best Practices</h4>
              <p className="text-xs text-muted-foreground mt-1">
                Expert tips on optimizing your monthly budget allocation...
              </p>
            </div>
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
              (showAllTransactions ? transactions : transactions.slice(0, 5)).map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-accent/30 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      transaction.type === 'income' ? 'bg-success/20' : 'bg-destructive/20'
                    }`}>
                      {transaction.type === 'income' ? (
                        <TrendingUp className={`w-5 h-5 text-success`} />
                      ) : (
                        <TrendingDown className={`w-5 h-5 text-destructive`} />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{transaction.categories?.name || 'Other'}</p>
                      <p className="text-xs text-muted-foreground">{transaction.note}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
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
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleEditTransaction(transaction)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleDeleteTransaction(transaction.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
            {!loading && transactions.length > 5 && (
              <Button
                variant="outline"
                className="w-full mt-4"
                onClick={() => setShowAllTransactions(!showAllTransactions)}
              >
                {showAllTransactions ? 'Show Less' : `Show All (${transactions.length} total)`}
              </Button>
            )}
          </CardContent>
        </Card>
      </main>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-[90%] rounded-lg">
          <DialogHeader>
            <DialogTitle>Edit Transaction</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateTransaction} className="space-y-4">
            <div className="flex gap-2">
              <Button
                type="button"
                variant={editType === 'expense' ? 'default' : 'outline'}
                className="flex-1"
                onClick={() => setEditType('expense')}
              >
                Expense
              </Button>
              <Button
                type="button"
                variant={editType === 'income' ? 'default' : 'outline'}
                className="flex-1"
                onClick={() => setEditType('income')}
              >
                Income
              </Button>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-amount">Amount (₨)</Label>
              <Input
                id="edit-amount"
                type="number"
                step="0.01"
                placeholder="5000"
                value={editAmount}
                onChange={(e) => setEditAmount(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-category">Category</Label>
              <Select value={editCategoryId} onValueChange={setEditCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.icon} {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-date">Date</Label>
              <Input
                id="edit-date"
                type="date"
                value={editDate}
                onChange={(e) => setEditDate(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-note">Note</Label>
              <Textarea
                id="edit-note"
                placeholder="Add a note..."
                value={editNote}
                onChange={(e) => setEditNote(e.target.value)}
                rows={3}
              />
            </div>

            <Button type="submit" className="w-full">Update Transaction</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}