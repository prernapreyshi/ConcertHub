import { useState, useMemo } from 'react';
import { Transaction, TransactionFormData } from '@/types/transaction';
import { TransactionForm } from '@/components/TransactionForm';
import { TransactionList } from '@/components/TransactionList';
import { MonthlyExpensesChart } from '@/components/MonthlyExpensesChart';
import { useToast } from '@/hooks/use-toast';
import CategoryPieChart from '@/components/CategoryPieChart';
import BudgetComparisonChart from '@/components/BudgetComparisonChart';
import BudgetForm from '@/components/BudgetForm';
import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';

const Index = () => {
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | undefined>();
  const [selectedMonth, setSelectedMonth] = useState<string>('All');
  const [selectedYear, setSelectedYear] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [budgets, setBudgets] = useState<Record<string, number>>({});

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(amount);

  const generateId = () =>
    Date.now().toString() + Math.random().toString(36).substr(2, 9);

  const handleAddTransaction = (formData: TransactionFormData) => {
    if (editingTransaction) {
      setTransactions(prev =>
        prev.map(t =>
          t.id === editingTransaction.id
            ? { ...formData, id: editingTransaction.id }
            : t
        )
      );
      setEditingTransaction(undefined);
    } else {
      const newTransaction: Transaction = {
        ...formData,
        id: generateId(),
      };
      setTransactions(prev => [newTransaction, ...prev]);
    }
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteTransaction = (id: string) => {
    const transaction = transactions.find(t => t.id === id);
    setTransactions(prev => prev.filter(t => t.id !== id));

    if (transaction) {
      toast({
        title: 'Transaction deleted',
        description: `${transaction.description} has been removed`,
        variant: 'destructive',
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingTransaction(undefined);
  };

  const availableYears = useMemo(() => {
    const years = new Set(transactions.map(t => new Date(t.date).getFullYear()));
    return ['All', ...Array.from(years).sort()];
  }, [transactions]);

  const availableCategories = useMemo(() => {
    const cats = new Set(transactions.map(t => t.category));
    return ['All', ...Array.from(cats).sort()];
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const date = new Date(t.date);
      const matchesMonth = selectedMonth === 'All' || (date.getMonth() + 1).toString() === selectedMonth;
      const matchesYear = selectedYear === 'All' || date.getFullYear().toString() === selectedYear;
      const matchesCategory = selectedCategory === 'All' || t.category === selectedCategory;
      return matchesMonth && matchesYear && matchesCategory;
    });
  }, [transactions, selectedMonth, selectedYear, selectedCategory]);

  const totalBalance = filteredTransactions.reduce((sum, transaction) => {
    return transaction.type === 'income' ? sum + transaction.amount : sum - transaction.amount;
  }, 0);

  const totalIncome = filteredTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = filteredTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const recentTransactions = [...filteredTransactions].slice(0, 5);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      style={{ backgroundColor: '#D8A', color: 'black' }}
      className="min-h-screen"
    >
      {/* Removed the header text here */}

      <div className="container mx-auto px-4 py-8 space-y-8">
        <TransactionForm
          onSubmit={handleAddTransaction}
          editingTransaction={editingTransaction}
          onCancel={handleCancelEdit}
        />

        <div className="flex flex-wrap gap-4 items-center justify-start">
          <div>
            <label className="text-sm block mb-1">Month</label>
            <select
              className="bg-pink-200 border border-pink-400 px-2 py-1 rounded text-black"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            >
              <option value="All">All</option>
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>{new Date(0, i).toLocaleString('default', { month: 'long' })}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm block mb-1">Year</label>
            <select
              className="bg-pink-200 border border-pink-400 px-2 py-1 rounded text-black"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
            >
              {availableYears.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm block mb-1">Category</label>
            <select
              className="bg-pink-200 border border-pink-400 px-2 py-1 rounded text-black"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {availableCategories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        <BudgetForm
          onSave={(key, amount) => setBudgets(prev => ({ ...prev, [key]: amount }))}
          categories={availableCategories.filter((c) => c !== 'All')}
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-[#FBEAF2] border border-[#B48] text-black shadow-md rounded-xl p-4">
            <h3 className="font-semibold"> Total Balance</h3>
            <p className="text-2xl font-bold">{formatCurrency(totalBalance)}</p>
          </Card>
          <Card className="bg-[#FBEAF2] border border-[#B48] text-black shadow-md rounded-xl p-4">
            <h3 className="font-semibold"> Total Income</h3>
            <p className="text-2xl font-bold">{formatCurrency(totalIncome)}</p>
          </Card>
          <Card className="bg-[#FBEAF2] border border-[#B48] text-black shadow-md rounded-xl p-4">
            <h3 className="font-semibold"> Total Expenses</h3>
            <p className="text-2xl font-bold">{formatCurrency(totalExpenses)}</p>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <MonthlyExpensesChart transactions={filteredTransactions} />
          <CategoryPieChart transactions={filteredTransactions} />
          <BudgetComparisonChart
            transactions={filteredTransactions}
            budgets={budgets}
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
          />
        </div>

        <TransactionList
          transactions={filteredTransactions}
          onEdit={handleEditTransaction}
          onDelete={handleDeleteTransaction}
        />
      </div>
    </motion.div>
  );
};

export default Index;
