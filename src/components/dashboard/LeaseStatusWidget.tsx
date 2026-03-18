
import React, { useMemo } from 'react';
import { useProjectData } from '@/providers/ProjectDataProvider';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { UNIT_STATUS } from '@/constants';

const LeaseStatusWidget: React.FC = () => {
  const { tenantUnits } = useProjectData();

  const leaseRateStats = useMemo(() => {
    const units = tenantUnits || [];
    if (units.length === 0) return { rate: 0, occupied: 0, vacant: 0, totalRentable: 0 };

    const occupiedArea = units
      .filter(u => u.status === UNIT_STATUS.OCCUPIED)
      .reduce((sum, u) => sum + u.area, 0);

    const inDiscussionArea = units
      .filter(u => u.status === UNIT_STATUS.IN_DISCUSSION)
      .reduce((sum, u) => sum + u.area, 0);
      
    const vacantArea = units
      .filter(u => u.status === UNIT_STATUS.VACANT)
      .reduce((sum, u) => sum + u.area, 0);

    const totalRentableArea = occupiedArea + inDiscussionArea + vacantArea;
    
    if (totalRentableArea === 0) return { rate: 0, occupied: occupiedArea, vacant: vacantArea + inDiscussionArea, totalRentable: totalRentableArea };

    const rate = (occupiedArea / totalRentableArea) * 100;

    return {
      rate: parseFloat(rate.toFixed(1)),
      occupied: occupiedArea,
      vacant: vacantArea + inDiscussionArea,
      totalRentable: totalRentableArea
    };
  }, [tenantUnits]);

  const chartData = [
    { name: '임대', value: leaseRateStats.occupied },
    { name: '공실/협의중', value: leaseRateStats.vacant },
  ];

  const COLORS = ['#4f46e5', '#e0e7ff']; // indigo-600, indigo-100

  return (
    <div className="bg-white p-6 rounded-2xl shadow-md h-full flex flex-col">
      <h3 className="text-lg font-semibold text-gray-900">임대 현황 요약</h3>
      <div className="flex-grow flex flex-col items-center justify-center mt-4">
        <div className="relative h-48 w-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <defs>
                <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                  <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="rgba(0,0,0,0.1)" />
                </filter>
              </defs>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={75}
                startAngle={90}
                endAngle={450}
                paddingAngle={0}
                dataKey="value"
                stroke="none"
                filter="url(#shadow)"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                cursor={{fill: 'transparent'}}
                formatter={(value: number) => [`${value.toLocaleString()} m²`, '면적']}
                contentStyle={{ 
                  background: 'rgba(31, 41, 55, 0.9)', 
                  border: 'none', 
                  borderRadius: '8px', 
                  color: 'white',
                  fontSize: '12px'
                }}
                labelStyle={{ fontWeight: 'bold' }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
            <span className="text-4xl font-bold text-gray-800">{leaseRateStats.rate}<span className="text-2xl text-gray-500">%</span></span>
            <span className="text-sm text-gray-500">임대율</span>
          </div>
        </div>
        
        <div className="w-full mt-6 space-y-3">
           <div className="flex justify-between items-center text-sm">
              <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-indigo-600"></div>
                  <span className="text-gray-600">임대 면적</span>
              </div>
              <span className="font-semibold text-gray-800">{leaseRateStats.occupied.toLocaleString()} m²</span>
           </div>
            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-indigo-100"></div>
                  <span className="text-gray-600">공실/협의중</span>
              </div>
              <span className="font-semibold text-gray-800">{leaseRateStats.vacant.toLocaleString()} m²</span>
           </div>
           <div className="border-t border-gray-200 my-3"></div>
            <div className="flex justify-between items-center text-sm font-bold">
              <span className="text-gray-800">총 임대가능 면적</span>
              <span className="text-gray-800">{leaseRateStats.totalRentable.toLocaleString()} m²</span>
           </div>
        </div>
      </div>
    </div>
  );
};

export default LeaseStatusWidget;
