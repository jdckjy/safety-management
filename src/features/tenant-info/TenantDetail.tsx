
import React from 'react';
import { useProjectData } from '../../providers/ProjectDataProvider';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import TenantBasicInfoTab from './TenantBasicInfoTab';
import TenantContractsTab from './TenantContractsTab';
import TenantDocumentsTab from './TenantDocumentsTab';
import TenantInsightPanel from './TenantInsightPanel';
import { Unit } from '../../types';

interface TenantDetailProps {
  tenantId: string;
}

const TenantDetail: React.FC<TenantDetailProps> = ({ tenantId }) => {
  const { tenantInfo, contracts, units, isDataLoaded } = useProjectData();

  if (!isDataLoaded) {
    return <div className="flex items-center justify-center h-full">데이터 로딩 중...</div>;
  }

  const tenant = (tenantInfo || []).find(t => t.id === tenantId);
  const allTenantContracts = (contracts || []).filter(c => c.tenantId === tenantId);

  const activeContracts = allTenantContracts.filter(c => {
    try {
      return new Date(c.endDate) >= new Date();
    } catch (e) {
      console.error(`[Data Error] 계약 ID ${c.id}의 endDate 형식이 잘못되었습니다:`, c.endDate, e);
      return false;
    }
  });

  const unitsMap: { [key: string]: Unit } = (units || []).reduce((map, unit) => {
    map[unit.id] = unit;
    return map;
  }, {} as { [key: string]: Unit });

  const totalArea = (activeContracts || []).reduce((sum, contract) => {
    const unit = unitsMap[contract.unitId];
    if (unit) {
      const area = parseFloat(String(unit.area_sqm || '0'));
      return sum + (isNaN(area) ? 0 : area);
    }
    return sum;
  }, 0);

  const totalRentableArea = (units || []).reduce((acc, unit) => {
    const area = parseFloat(String(unit.area_sqm || '0'));
    return acc + (isNaN(area) ? 0 : area);
  }, 0);

  if (!tenant) {
    return <div className="flex items-center justify-center h-full">임차인 정보를 찾을 수 없습니다.</div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1 space-y-6">
        <Card className="flex flex-col items-center justify-center text-center p-6">
          <img src={`https://avatar.vercel.sh/${tenant.id}.png`} alt={tenant.companyName} className="w-24 h-24 rounded-full mb-4" />
          <h2 className="text-2xl font-bold">{tenant.companyName}</h2>
          <Badge variant={activeContracts.length > 0 ? "secondary" : "outline"} className="mt-2">
            {activeContracts.length > 0 ? '계약중' : '계약만료'}
          </Badge>
          <div className="mt-6 w-full text-left">
            <div className="flex justify-between py-2 border-b">
              <span className="text-sm text-gray-500">총 점유 면적</span>
              <span className="font-semibold">{totalArea.toFixed(2)} ㎡</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-sm text-gray-500">활성 계약 수</span>
              <span className="font-semibold">{(activeContracts || []).length} 건</span>
            </div>
          </div>
        </Card>
        <TenantInsightPanel 
          activeContracts={activeContracts} 
          totalRentableArea={totalRentableArea} 
          units={units}
        />
      </div>

      <div className="lg:col-span-2">
        <Tabs defaultValue="basic-info">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic-info">기본정보</TabsTrigger>
            <TabsTrigger value="contracts">계약현황</TabsTrigger>
            <TabsTrigger value="documents">서류관리</TabsTrigger>
          </TabsList>
          <TabsContent value="basic-info" className="mt-4">
            <TenantBasicInfoTab tenant={tenant} />
          </TabsContent>
          <TabsContent value="contracts" className="mt-4">
            <TenantContractsTab contracts={allTenantContracts} units={units} />
          </TabsContent>
          <TabsContent value="documents" className="mt-4">
            <TenantDocumentsTab tenantId={tenantId} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default TenantDetail;
