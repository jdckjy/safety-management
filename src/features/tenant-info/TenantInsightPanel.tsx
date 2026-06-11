
import React, { useMemo } from 'react';
import { useProjectData } from '../../providers/ProjectDataProvider';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Unit, Contract, TenantInfo } from '../../types';

interface TenantInsightPanelProps {
  tenantId: string;
}

const TenantInsightPanel: React.FC<TenantInsightPanelProps> = ({ tenantId }) => {
  const { tenantInfo, contracts, units } = useProjectData();

  const tenant = useMemo(() => 
    (tenantInfo || []).find(t => t.id === tenantId)
  , [tenantInfo, tenantId]);

  const activeContracts = useMemo(() => 
    (contracts || []).filter(c => c.tenantId === tenantId && new Date(c.endDate) >= new Date())
  , [contracts, tenantId]);

  const unitsMap: { [key: string]: Unit } = useMemo(() => 
    (units || []).reduce((map, unit) => {
      map[unit.id] = unit;
      return map;
    }, {} as { [key: string]: Unit })
  , [units]);

  const tenantTotalArea = useMemo(() => 
    activeContracts.reduce((sum, contract) => {
      const unit = unitsMap[contract.unitId];
      if (unit) {
        const area = parseFloat(String(unit.area_sqm || '0'));
        return sum + (isNaN(area) ? 0 : area);
      }
      return sum;
    }, 0)
  , [activeContracts, unitsMap]);

  const totalRentableArea = useMemo(() => 
    (units || []).reduce((acc, unit) => {
      const area = parseFloat(String(unit.area_sqm || '0'));
      return acc + (isNaN(area) ? 0 : area);
    }, 0)
  , [units]);

  const occupancyContribution = totalRentableArea > 0 ? (tenantTotalArea / totalRentableArea) * 100 : 0;

  if (!tenant) {
    return null; // 혹은 로딩/에러 상태 표시
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>인사이트</CardTitle>
        <CardDescription>{tenant.businessName}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <div className="flex justify-between items-baseline mb-1">
            <h4 className="text-sm font-semibold text-gray-600">점유율 기여도</h4>
            <span className="text-lg font-bold text-blue-600">{occupancyContribution.toFixed(2)}%</span>
          </div>
          <p className="text-xs text-gray-500 mb-2">
            전체 임대 가능 면적 ({totalRentableArea.toLocaleString()} ㎡) 중 현재 임차인이 차지하는 비중입니다.
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
