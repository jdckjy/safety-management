
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface TaskStatusChartProps {
  completed: number;
  inProgress: number;
  pending: number;
}

export const TaskStatusChart: React.FC<TaskStatusChartProps> = ({ completed, inProgress, pending }) => {
  const data = [
    { name: 'Completed', value: completed },
    { name: 'In Progress', value: inProgress },
    { name: 'Pending', value: pending },
  ];

  const COLORS = ['#22c55e', '#f59e0b', '#e5e7eb'];

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius="60%"
          outerRadius="80%"
          fill="#8884d8"
          paddingAngle={5}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
};
