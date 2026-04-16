
import React from 'react';
import { useProjectData } from '../../providers/ProjectDataProvider';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';

interface TenantInsightPanelProps {
  tenantId: string;
}

const TenantInsightPanel: React.FC<TenantInsightPanelProps> = ({ tenantId }) => {
  const { contracts, tenantUnits } = useProjectData();

  // 1. Calculate the total area for the specific tenant
  const tenantContracts = contracts.filter(c => c.tenantId === tenantId);
  const tenantTotalArea = tenantContracts.reduce((acc, c) => acc + c.area, 0);

  // 2. Calculate the total rentable area of the entire building
  const totalRentableArea = tenantUnits.reduce((acc, unit) => acc + unit.area, 0);

  // 3. Calculate the occupancy contribution percentage
  const occupancyContribution = totalRentableArea > 0 ? (tenantTotalArea / totalRentableArea) * 100 : 0;

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
            전체 임대 가능 면적 ({totalRentableArea.toLocaleString()} ㎡) 중 현재 임차인이 차지하는 비중입니다.
          </p>
          <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-500"
              style={{ width: `${occupancyContribution}%` }}
            ></div>
          </div>
        </div>
        {/* Future insights can be added here */}
      </CardContent>
    </Card>
  );
};

export default TenantInsightPanel;
