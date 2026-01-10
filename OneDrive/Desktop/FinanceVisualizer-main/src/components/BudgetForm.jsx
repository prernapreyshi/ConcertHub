import React, { useState } from 'react';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface BudgetFormProps {
  onSave: (key: string, amount: number) => void;
  selectedMonth: string;
  selectedYear: string;
}

const predefinedCategories = [
  'Food',
  'Transportation',
  'Utilities',
  'Entertainment',
  'Healthcare',
  'Education',
  'Shopping',
  'Others',
];

const BudgetForm: React.FC<BudgetFormProps> = ({
  onSave,
  selectedMonth,
  selectedYear,
}) => {
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!category || !amount) return;

    const key = `${category}-${selectedYear}-${selectedMonth}`;
    onSave(key, parseFloat(amount));
    setAmount('');
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-[#FBEAF2] p-6 rounded-xl space-y-4 text-black border border-[#B48] shadow-md"
    >
      {/* Category Select */}
      <div className="space-y-2">
        <Label className="font-semibold">Category</Label>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="bg-[#FBEAF2] border border-[#B48] text-black rounded-lg focus:ring-2 focus:ring-[#D8A]">
            <SelectValue placeholder="Select Category" />
          </SelectTrigger>
          <SelectContent className="bg-[#FBEAF2] text-black border border-[#B48] rounded-lg">
            {predefinedCategories.map((c) => (
              <SelectItem
                key={c}
                value={c}
                className="hover:bg-[#28a36c] hover:text-white focus:bg-[#28a36c] focus:text-white cursor-pointer px-3 py-2 rounded transition-all"
              >
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Budget Amount */}
      <div className="space-y-2">
        <Label className="font-semibold">Budget Amount (₹)</Label>
        <Input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-[#B48] text-black focus:ring-2 focus:ring-[#D8A] bg-white"
          placeholder="Enter budget"
          min="0"
          required
        />
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        className="bg-[#B48] text-white px-4 py-2 rounded-lg hover:bg-[#a1376b] transition-all"
      >
        Save Budget
      </Button>
    </form>
  );
};

export default BudgetForm;
