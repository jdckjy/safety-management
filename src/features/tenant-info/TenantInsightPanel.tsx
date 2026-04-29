
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Unit, Contract } from '../../types';

interface TenantInsightPanelProps {
  activeContracts: Contract[];
  totalRentableArea: number;
  units: Unit[];
}

const TenantInsightPanel: React.FC<TenantInsightPanelProps> = ({ activeContracts, totalRentableArea, units }) => {

  const unitsMap: { [key: string]: Unit } = (units || []).reduce((map, unit) => {
    map[unit.id] = unit;
    return map;
  }, {} as { [key: string]: Unit });

  const tenantTotalArea = (activeContracts || []).reduce((sum, contract) => {
    const unit = unitsMap[contract.unitId];
    if (unit) {
      const area = parseFloat(String(unit.area_sqm || '0'));
      return sum + (isNaN(area) ? 0 : area);
    }
    return sum;
  }, 0);

  const safeTotalRentableArea = totalRentableArea || 0;
  const occupancyContribution = safeTotalRentableArea > 0 ? (tenantTotalArea / safeTotalRentableArea) * 100 : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>인사이트</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <div className="flex justify-between items-baseline mb-1">
            <h4 className="text-sm font-semibold text-gray-600">점유율 기여도</h4>
            <span className="text-lg font-bold text-blue-600">{occupancyContribution.toFixed(2)}%</span>
          </div>
          <p className="text-xs text-gray-500 mb-2">
            전체 임대 가능 면적 ({safeTotalRentableArea.toLocaleString()} ㎡) 중 현재 임차인이 차지하는 비중입니다.
          </p>
          <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500"
              style={{ width: `${occupancyContribution}%` }}
            ></div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TenantInsightPanel;
