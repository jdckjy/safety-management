
import React from 'react';
import { useProjectData } from '../../providers/ProjectDataProvider';
import { Card } from '../../components/ui/card';

const InsightComponent: React.FC<{ tenantId: string }> = ({ tenantId }) => {
  const { contracts, units } = useProjectData();

  const tenantContracts = (contracts || []).filter(c => c.tenantId === tenantId);
  
  const totalRent = tenantContracts.reduce((sum, contract) => sum + (contract.monthlyRent || 0), 0);
  
  const totalArea = tenantContracts.reduce((sum, contract) => {
    const unit = (units || []).find(u => u.id === contract.unitId);
    return sum + (unit?.area_sqm || 0);
  }, 0);

  const rentToAreaRatio = totalArea > 0 ? (totalRent / totalArea) * 100 : 0;

  return (
    <Card>
      <div>인사이트</div>
      <p>임대료/면적 비율: {rentToAreaRatio.toFixed(2)}%</p>
    </Card>
  );
};

export default InsightComponent;
