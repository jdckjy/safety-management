
import React from 'react';
import { useProjectData } from '../../providers/ProjectDataProvider';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import TenantBasicInfoTab from './TenantBasicInfoTab';
import TenantContractsTab from './TenantContractsTab';
import TenantDocumentsTab from './TenantDocumentsTab';
import TenantInsightPanel from './TenantInsightPanel';
import { Unit } from '../../types';
import { ArrowLeft, Edit } from 'lucide-react';

interface TenantDetailProps {
  tenantId: string;
  onBackToList: () => void;
}

const TenantDetail: React.FC<TenantDetailProps> = ({ tenantId, onBackToList }) => {
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

  const totalRentableArea = (units || []).reduce((acc, unit) => {
    const area = parseFloat(String(unit.area_sqm || '0'));
    return acc + (isNaN(area) ? 0 : area);
  }, 0);

  if (!tenant) {
    return (
        <div className="flex flex-col items-center justify-center h-full">
            <p className="mb-4">임차인 정보를 찾을 수 없습니다.</p>
            <Button onClick={onBackToList} variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4"/>
                목록으로 돌아가기
            </Button>
        </div>
    );
  }

  return (
    <Card className="h-full flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between border-b p-4">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={onBackToList}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <CardTitle className="text-xl">{tenant.companyName}</CardTitle>
            </div>
            <Button variant="outline">
                <Edit className="mr-2 h-4 w-4" />
                수정
            </Button>
        </CardHeader>

        <CardContent className="flex-grow p-4 md:p-6 overflow-y-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content (Tabs) */}
                <div className="lg:col-span-2">
                    <Tabs defaultValue="basic-info" className="w-full">
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

                {/* Right Sidebar (Insight) */}
                <div className="lg:col-span-1">
                    <TenantInsightPanel 
                        tenant={tenant}
                        activeContracts={activeContracts} 
                        totalRentableArea={totalRentableArea} 
                        units={units}
                    />
                </div>
            </div>
        </CardContent>
    </Card>
  );
};

export default TenantDetail;
