import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Transaction } from "@/types/transaction";

const COLORS = ['#000', '#B48', '#D8A', '#FF8042', '#36A2EB', '#FF6384', '#2ECC71', '#8E44AD'];

interface Props {
  transactions: Transaction[];
}

const CategoryPieChart: React.FC<Props> = ({ transactions }) => {
  const categoryTotals = transactions
    .filter((t) => t.type === "expense")
    .reduce((acc: Record<string, number>, curr) => {
      acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
      return acc;
    }, {});

  const data = Object.entries(categoryTotals).map(([name, value]) => ({
    name,
    value,
  }));

  if (data.length === 0) {
    return (
      <div className="text-center text-black bg-[#FBEAF2] p-6 rounded-xl shadow-md">
        <div className="text-4xl mb-2">📊</div>
        <h3 className="text-lg font-semibold">No category data yet</h3>
        <p className="text-sm text-muted-foreground">
          Add some expense transactions to see insights here
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[#FBEAF2] text-black p-6 rounded-2xl shadow-xl transition-all duration-300">
      <h2 className="text-center text-lg font-bold mb-4 tracking-wide">
         Category-wise Expenses
      </h2>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            outerRadius={100}
            labelLine={false}
            label={({ name, percent }) =>
              `${name} (${(percent * 100).toFixed(0)}%)`
            }
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ backgroundColor: "#fff", color: "#000", borderRadius: "8px", boxShadow: "0 0 10px rgba(0,0,0,0.1)" }}
            itemStyle={{ color: "#000", fontWeight: 500 }}
            formatter={(value: number, name: string) => [`₹${value.toFixed(2)}`, name]}
          />
          <Legend
            wrapperStyle={{ color: "#000" }}
            layout="horizontal"
            align="center"
            verticalAlign="bottom"
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CategoryPieChart;
