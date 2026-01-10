import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface BudgetComparisonChartProps {
  budgets: Record<string, number>;
  actualSpending: Record<string, number>;
}

const BudgetComparisonChart: React.FC<BudgetComparisonChartProps> = ({
  budgets,
  actualSpending,
}) => {
  const data = Object.keys(budgets)
    .sort()
    .map((category) => ({
      category,
      Budget: budgets[category],
      Spent: actualSpending[category] || 0,
    }));

  return (
    <div className="bg-[#FBEAF2] border border-[#B48] p-4 rounded-xl shadow-md text-black">
      <h3 className="text-lg font-bold mb-4 text-center">
        📊 Budget vs Actual Spending
      </h3>

      {data.length === 0 ? (
        <div className="text-center text-sm text-gray-700 py-6">
          No budget data available. Set a budget to view comparison.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 30 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="category" />
            <YAxis />
            <Tooltip
              contentStyle={{ backgroundColor: '#fff', color: '#000' }}
              itemStyle={{ color: '#000' }}
            />
            <Legend />
            <Bar dataKey="Budget" fill="#B48" radius={[5, 5, 0, 0]} />
            <Bar dataKey="Spent" fill="#000" radius={[5, 5, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default BudgetComparisonChart;
