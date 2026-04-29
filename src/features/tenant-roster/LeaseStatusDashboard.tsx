
// src/features/tenant-roster/LeaseStatusDashboard.tsx
import React, { useMemo } from 'react';
import { useProjectData } from '../../providers/ProjectDataProvider';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

const COLORS = {
  OCCUPIED: '#8884d8', // 보라색
  VACANT: '#82ca9d',   // 녹색
};

const LeaseStatusDashboard: React.FC = () => {
  const { units, contracts } = useProjectData();

  const leaseStatus = useMemo(() => {
    if (!units || !contracts) {
      return { occupiedCount: 0, vacantCount: 0, occupiedArea: 0, vacantArea: 0 };
    }

    const occupiedUnitIds = new Set(contracts.map(c => c.unitId));

    let occupiedCount = 0;
    let vacantCount = 0;
    let occupiedArea = 0;
    let vacantArea = 0;

    units.forEach(unit => {
      if (occupiedUnitIds.has(unit.id)) {
        occupiedCount++;
        occupiedArea += unit.area_sqm;
      } else {
        vacantCount++;
        vacantArea += unit.area_sqm;
      }
    });

    return { occupiedCount, vacantCount, occupiedArea, vacantArea };
  }, [units, contracts]);

  const totalUnits = (leaseStatus.occupiedCount + leaseStatus.vacantCount) || 1;
  const totalArea = (leaseStatus.occupiedArea + leaseStatus.vacantArea) || 1;

  const occupancyRateByCount = (leaseStatus.occupiedCount / totalUnits) * 100;
  const occupancyRateByArea = (leaseStatus.occupiedArea / totalArea) * 100;

  const chartData = [
    { name: '계약', value: leaseStatus.occupiedCount, area: leaseStatus.occupiedArea },
    { name: '공실', value: leaseStatus.vacantCount, area: leaseStatus.vacantArea },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>임대 현황</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 text-center">
          <div>
            <p className="text-sm text-muted-foreground">총 호실</p>
            <p className="text-2xl font-bold">{totalUnits}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">계약</p>
            <p className="text-2xl font-bold">{leaseStatus.occupiedCount}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">공실</p>
            <p className="text-2xl font-bold">{leaseStatus.vacantCount}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">점유율 (호실 기준)</p>
            <p className="text-2xl font-bold">{occupancyRateByCount.toFixed(1)}%</p>
          </div>
        </div>
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                <Cell key={`cell-occupied`} fill={COLORS.OCCUPIED} />
                <Cell key={`cell-vacant`} fill={COLORS.VACANT} />
              </Pie>
              <Tooltip formatter={(value, name) => [`${value}개`, name]} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 text-center">
           <div>
            <p className="text-sm text-muted-foreground">총 면적(m²)</p>
            <p className="text-2xl font-bold">{totalArea.toFixed(0)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">계약 면적(m²)</p>
            <p className="text-2xl font-bold">{leaseStatus.occupiedArea.toFixed(0)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">공실 면적(m²)</p>
            <p className="text-2xl font-bold">{leaseStatus.vacantArea.toFixed(0)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">점유율 (면적 기준)</p>
            <p className="text-2xl font-bold">{occupancyRateByArea.toFixed(1)}%</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LeaseStatusDashboard;
