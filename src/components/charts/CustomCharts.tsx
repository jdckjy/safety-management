
import React from 'react';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart as RechartsBarChart, 
  Bar, 
  LineChart as RechartsLineChart, 
  Line, 
  XAxis, 
  Tooltip, 
  Area 
} from 'recharts';

// 1. DonutChart Component
interface DonutChartProps {
  value: number;
  strokeColor?: string;
  strokeWidth?: number;
}

export const DonutChart: React.FC<DonutChartProps> = ({ value, strokeColor = '#8884d8', strokeWidth = 20 }) => {
  const data = [
    { name: 'value', value: value },
    { name: 'remaining', value: 100 - value },
  ];
  const innerRadiusPercent = 100 - strokeWidth;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          dataKey="value"
          innerRadius={`${innerRadiusPercent}%`}
          outerRadius={"100%"}
          startAngle={90}
          endAngle={-270}
          stroke="none"
        >
          <Cell fill={strokeColor} />
          <Cell fill="#f3f4f6" /> 
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
};

// 2. LineChart Component
interface LineChartProps {
  data: number[];
  labels: string[];
  lineColor?: string;
  areaColor?: string;
}

export const LineChart: React.FC<LineChartProps> = ({ data, labels, lineColor = '#8884d8', areaColor = '#8884d8' }) => {
  const chartData = labels.map((label, index) => ({ name: label, value: data[index] || 0 }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsLineChart data={chartData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
        <Tooltip contentStyle={{ fontSize: '12px', padding: '4px 8px'}} />
        <Area type="monotone" dataKey="value" stroke={lineColor} fillOpacity={0.2} fill={areaColor} />
      </RechartsLineChart>
    </ResponsiveContainer>
  );
};

// 3. BarChart Component
interface BarChartProps {
  data: number[];
  labels: string[];
  barColor?: string;
}

export const BarChart: React.FC<BarChartProps> = ({ data, labels, barColor = '#8884d8' }) => {
  const chartData = labels.map((label, index) => ({ name: label, value: data[index] || 0 }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsBarChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: -10 }}>
         <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} />
        <Bar dataKey="value" fill={barColor} radius={[4, 4, 0, 0]} />
      </RechartsBarChart>
    </ResponsiveContainer>
  );
};
