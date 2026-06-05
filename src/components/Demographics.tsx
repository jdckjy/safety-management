import { ResponsiveContainer, BarChart, XAxis, YAxis, Bar, Tooltip } from 'recharts';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-lg">
        <p className="text-lg font-semibold text-gray-800">{`${label}`}</p>
        <p className="text-sm text-gray-600">{`인구: ${new Intl.NumberFormat().format(payload[0].value as number)} 명`}</p>
      </div>
    );
  }
  return null;
};

const Demographics = () => {
  const data = [
    { name: '서울', value: 9424835 },
    { name: '부산', value: 3317829 },
    { name: '대구', value: 2363691 },
    { name: '인천', value: 2967314 },
    { name: '광주', value: 1431050 },
    { name: '대전', value: 1446072 },
    { name: '울산', value: 1110663 },
    { name: '세종', value: 383591 },
    { name: '경기', value: 13589432 },
    { name: '강원', value: 1536498 },
    { name: '충북', value: 1595058 },
    { name: '충남', value: 2123709 },
    { name: '전북', value: 1769607 },
    { name: '전남', value: 1817697 },
    { name: '경북', value: 2600492 },
    { name: '경남', value: 3280493 },
    { name: '제주', value: 678159 },
  ];

  return (
    <div className="w-full h-full p-6 bg-gray-50">
      <h1 className="text-2xl font-bold mb-4">대한민국 인구 통계</h1>
      <div className="w-full h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="value" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Demographics;
