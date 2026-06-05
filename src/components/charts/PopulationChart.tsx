import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { PopulationData } from '../../types/population';

interface PopulationChartProps {
  data: PopulationData[];
}

// Y축 단위를 '만 명'으로 포맷하는 함수
const formatYAxis = (tickItem: number) => {
  return `${(tickItem / 10000).toLocaleString()}만`;
};

export default function PopulationChart({ data }: PopulationChartProps) {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart
        data={data}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="period" />
        <YAxis 
          tickFormatter={formatYAxis} 
          domain={[660000, 685000]}
          allowDataOverflow={true}
        />
        <Tooltip formatter={(value: number) => `${value.toLocaleString()} 명`} />
        <Legend />
        <Line type="monotone" dataKey="value" name="제주도 인구" stroke="#8884d8" activeDot={{ r: 8 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}