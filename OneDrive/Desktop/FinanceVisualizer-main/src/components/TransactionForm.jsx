import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Transaction, TransactionFormData } from '@/types/transaction';
import { useToast } from '@/hooks/use-toast';

const categories = [
  'Food',
  'Transportation',
  'Utilities',
  'Entertainment',
  'Healthcare',
  'Education',
  'Shopping',
  'Others',
];

export const TransactionForm = ({
  onSubmit,
  editingTransaction,
  onCancel,
}: {
  onSubmit: (transaction: TransactionFormData) => void;
  editingTransaction?: Transaction;
  onCancel?: () => void;
}) => {
  const { toast } = useToast();

  const [formData, setFormData] = useState<TransactionFormData>({
    amount: editingTransaction?.amount || 0,
    date: editingTransaction?.date || new Date().toISOString().split('T')[0],
    description: editingTransaction?.description || '',
    type: editingTransaction?.type || 'expense',
    category: editingTransaction?.category || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.amount || formData.amount <= 0)
      newErrors.amount = 'Amount must be greater than 0';
    if (!formData.date) newErrors.date = 'Date is required';
    if (!formData.description.trim())
      newErrors.description = 'Description is required';
    if (!formData.category) newErrors.category = 'Category is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
      if (!editingTransaction) {
        setFormData({
          amount: 0,
          date: new Date().toISOString().split('T')[0],
          description: '',
          type: 'expense',
          category: '',
        });
      }
      toast({
        title: editingTransaction
          ? 'Transaction updated'
          : 'Transaction added',
        description: `${formData.type === 'income' ? '+' : '-'}₹${formData.amount.toFixed(2)} - ${formData.description}`,
      });
    }
  };

  return (
    <Card className="bg-[#FBEAF2] text-black border border-[#B48] rounded-2xl shadow-xl transition-all duration-300">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">
          {editingTransaction ? ' Edit Transaction' : ' Add New Transaction'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Amount */}
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (₹)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={formData.amount === 0 ? '' : formData.amount.toString()}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    amount: parseFloat(e.target.value) || 0,
                  })
                }
                className={`transition-all border border-[#B48] focus:ring-2 focus:ring-[#D8A] focus:border-[#D8A] rounded-lg ${errors.amount ? 'border-red-500' : ''}`}
                placeholder="0.00"
              />
              {errors.amount && (
                <p className="text-sm text-red-600">{errors.amount}</p>
              )}
            </div>

            {/* Date */}
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                className={`transition-all border border-[#B48] focus:ring-2 focus:ring-[#D8A] focus:border-[#D8A] rounded-lg ${errors.date ? 'border-red-500' : ''}`}
              />
              {errors.date && (
                <p className="text-sm text-red-600">{errors.date}</p>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className={`transition-all border border-[#B48] focus:ring-2 focus:ring-[#D8A] focus:border-[#D8A] rounded-lg ${errors.description ? 'border-red-500' : ''}`}
              placeholder="Enter transaction description"
            />
            {errors.description && (
              <p className="text-sm text-red-600">{errors.description}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Type */}
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value: 'income' | 'expense') =>
                  setFormData({ ...formData, type: value })
                }
              >
                <SelectTrigger className="transition-all border border-[#B48] focus:ring-2 focus:ring-[#D8A] rounded-lg bg-white text-black">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent className="bg-white text-black border border-[#B48]">
                  <SelectItem value="expense">Expense</SelectItem>
                  <SelectItem value="income">Income</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value: string) =>
                  setFormData({ ...formData, category: value })
                }
              >
                <SelectTrigger className="w-full px-3 py-2 border-2 border-[#B48] rounded-lg bg-[#FBEAF2] text-black focus:ring-2 focus:ring-[#D8A] transition-all">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="bg-[#FBEAF2] text-black border border-[#B48] rounded-lg shadow-md">
                  {categories.map((cat) => (
                    <SelectItem
                      key={cat}
                      value={cat}
                      className="hover:bg-[#D8A] hover:text-black rounded px-2 py-1 transition-all"
                    >
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-sm text-red-600">{errors.category}</p>
              )}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-4 pt-4">
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-[#D8A] to-[#B48] text-black font-medium hover:brightness-110 hover:shadow-lg transition-all"
            >
              {editingTransaction ? 'Update' : 'Add'}
            </Button>
            {editingTransaction && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="border border-[#B48] text-black hover:bg-[#FBEAF2]"
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
