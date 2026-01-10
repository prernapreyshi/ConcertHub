export interface Transaction {
  id: string;
  amount: number;
  date: string;
  description: string;
  type: 'income' | 'expense';
}

export interface TransactionFormData {
  amount: number;
  date: string;
  description: string;
  type: 'income' | 'expense';
}