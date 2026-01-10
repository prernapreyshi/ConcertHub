import { Transaction } from '@/types/transaction';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface MonthlyExpensesChartProps {
  transactions: Transaction[];
}

export const MonthlyExpensesChart = ({ transactions }: MonthlyExpensesChartProps) => {
  const processMonthlyData = () => {
    const monthlyData: Record<string, { month: string; expenses: number; income: number }> = {};

    transactions.forEach((transaction) => {
      const date = new Date(transaction.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthLabel = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
      });

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { month: monthLabel, expenses: 0, income: 0 };
      }

      if (transaction.type === 'expense') {
        monthlyData[monthKey].expenses += transaction.amount;
      } else {
        monthlyData[monthKey].income += transaction.amount;
      }
    });

    return Object.entries(monthlyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([, data]) => data)
      .slice(-6); // Last 6 months
  };

  const data = processMonthlyData();

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white text-black border border-[#D8A] rounded-lg p-3 shadow-md">
          <p className="font-semibold">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.dataKey === 'expenses' ? 'Expenses' : 'Income'}: ₹{entry.value.toFixed(2)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (data.length === 0) {
    return (
      <Card className="bg-[#FBEAF2] text-black border border-[#B48] shadow-md rounded-xl">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Monthly Overview</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-lg font-semibold">No data to display</h3>
          <p className="text-sm">Add some transactions to see your monthly overview</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-[#FBEAF2] text-black border border-[#B48] shadow-md rounded-xl">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Monthly Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
              <XAxis dataKey="month" stroke="#333" fontSize={12} />
              <YAxis stroke="#333" fontSize={12} tickFormatter={(value) => `₹${value}`} />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="expenses"
                fill="#B48"
                radius={[4, 4, 0, 0]}
                name="Expenses"
              />
              <Bar
                dataKey="income"
                fill="#2ECC71"
                radius={[4, 4, 0, 0]}
                name="Income"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className="text-center p-3 rounded-lg bg-[#FFDDE8] border border-[#B48]">
            <p className="text-sm font-medium text-[#B48]">Total Expenses</p>
            <p className="text-lg font-bold">
              ₹{data.reduce((sum, month) => sum + month.expenses, 0).toFixed(2)}
            </p>
          </div>
          <div className="text-center p-3 rounded-lg bg-[#DFF5E1] border border-[#2ECC71]">
            <p className="text-sm font-medium text-[#2ECC71]">Total Income</p>
            <p className="text-lg font-bold">
              ₹{data.reduce((sum, month) => sum + month.income, 0).toFixed(2)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
