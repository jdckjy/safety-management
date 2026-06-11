
import React, { useMemo } from 'react';
import { useProjectData } from '@/providers/ProjectDataProvider';
import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const LeaseStatusWidget: React.FC = () => {
  const { units } = useProjectData(); // contracts는 더 이상 직접 필요하지 않습니다.

  const leaseRateStats = useMemo(() => {
    const allUnits = units || [];

    if (allUnits.length === 0) {
      return { rate: 0, occupied: 0, vacant: 0, totalRentable: 0 };
    }

    // ProjectDataProvider에서 이미 계산된 unit.status를 사용합니다.
    const occupiedArea = allUnits
      .filter(u => u.status === 'occupied') // 'occupied' 상태인 유닛만 필터링
      .reduce((sum, u) => sum + (u.area_sqm || 0), 0);

    const totalRentableArea = allUnits.reduce((sum, u) => sum + (u.area_sqm || 0), 0);
    const vacantArea = totalRentableArea - occupiedArea;
    const rate = totalRentableArea > 0 ? (occupiedArea / totalRentableArea) * 100 : 0;

    return {
      rate: parseFloat(rate.toFixed(1)),
      occupied: parseFloat(occupiedArea.toFixed(2)),
      vacant: parseFloat(vacantArea.toFixed(2)),
      totalRentable: parseFloat(totalRentableArea.toFixed(2)),
    };
  }, [units]); // 종속성 배열에서 contracts 제거

  const data = [
    { name: '임대 면적', value: leaseRateStats.occupied },
    { name: '공실/리모델링', value: leaseRateStats.vacant },
  ];

  const OCCUPIED_COLOR = '#3B82F6';
  const VACANT_COLOR = '#DBEAFE';

  if (leaseRateStats.totalRentable === 0) {
    data[0].value = 0;
    data[1].value = 1;
  }

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
                data={data}
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
                <Cell key="cell-occupied" fill={OCCUPIED_COLOR} />
                <Cell key="cell-vacant" fill={VACANT_COLOR} />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
            <span className="text-4xl font-bold text-gray-800">{leaseRateStats.rate.toFixed(0)}<span className="text-2xl text-gray-500">%</span></span>
            <span className="text-sm text-gray-500">임대율</span>
          </div>
        </div>
        
        <div className="w-full mt-6 space-y-3">
          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: OCCUPIED_COLOR }}></div>
              <span className="text-gray-600">임대 면적</span>
            </div>
            <span className="font-semibold text-gray-800">{leaseRateStats.occupied.toLocaleString()} m²</span>
          </div>

          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: VACANT_COLOR }}></div>
              <span className="text-gray-600">공실/리모델링</span>
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
