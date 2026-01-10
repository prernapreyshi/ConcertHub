import { Transaction } from '@/types/transaction';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface TransactionListProps {
  transactions: Transaction[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
}

export const TransactionList = ({
  transactions,
  onEdit,
  onDelete,
}: TransactionListProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatAmount = (amount: number, type: 'income' | 'expense') => {
    const sign = type === 'income' ? '+' : '-';
    return `${sign}₹${amount.toFixed(2)}`;
  };

  if (transactions.length === 0) {
    return (
      <Card className="bg-[#FBEAF2] border border-[#B48] text-black shadow-md rounded-xl">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="text-6xl mb-4">💳</div>
          <h3 className="text-lg font-semibold">No transactions yet</h3>
          <p className="text-sm text-gray-700">
            Start by adding your first transaction above
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-[#FBEAF2] border border-[#B48] text-black shadow-md rounded-xl">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Recent Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between p-4 rounded-lg border border-[#B48] bg-white/60 hover:shadow-md transition-all duration-200"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-2xl">
                    {transaction.type === 'income' ? '💰' : '💸'}
                  </span>
                  <div>
                    <h4 className="font-medium text-black">
                      {transaction.description}
                    </h4>
                    <p className="text-sm text-gray-700">
                      {formatDate(transaction.date)}
                    </p>
                    <p className="text-xs text-gray-600 italic">
                      Category: <span className="text-[#B48]">{transaction.category}</span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Badge
                  variant="outline"
                  className={`px-2 py-1 text-sm font-bold rounded-full border-0 shadow-sm ${
                    transaction.type === 'income'
                      ? 'bg-[#D8A] text-black'
                      : 'bg-[#B48] text-white'
                  }`}
                >
                  {formatAmount(transaction.amount, transaction.type)}
                </Badge>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(transaction)}
                    className="border-[#D8A] text-black hover:bg-[#D8A]/20 transition"
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDelete(transaction.id)}
                    className="border-red-400 text-red-600 hover:bg-red-100 transition"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
