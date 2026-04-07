
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Income, Expense } from '../types';

interface FinancialSummaryProps {
  incomeData: Income[];
  expenseData: Expense[];
}

const FinancialSummary: React.FC<FinancialSummaryProps> = ({ incomeData, expenseData }) => {
  const processDataForChart = () => {
    const monthlyData: { [key: string]: { month: string; 수입: number; 지출: number } } = {};

    incomeData.forEach(item => {
      const month = item.date.substring(0, 7); // "YYYY-MM"
      if (!monthlyData[month]) {
        monthlyData[month] = { month, 수입: 0, 지출: 0 };
      }
      monthlyData[month].수입 += item.amount;
    });

    expenseData.forEach(item => {
      const month = item.date.substring(0, 7); // "YYYY-MM"
      if (!monthlyData[month]) {
        monthlyData[month] = { month, 수입: 0, 지출: 0 };
      }
      monthlyData[month].지출 += item.amount;
    });

    return Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month));
  };

  const chartData = processDataForChart();

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">월별 수입 및 지출</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={chartData}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="수입" fill="#8884d8" />
          <Bar dataKey="지출" fill="#82ca9d" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default FinancialSummary;
