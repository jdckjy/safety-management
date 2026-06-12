
import React, { useState } from 'react';
import { useProjectData } from '../../providers/ProjectDataProvider';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import TenantBasicInfoTab from './TenantBasicInfoTab';
import TenantContractsTab from './TenantContractsTab';
import TenantDocumentsTab from './TenantDocumentsTab';
import TenantInsightPanel from './TenantInsightPanel';
import EditTenantDialog from './EditTenantDialog';
import { ArrowLeft, Edit } from 'lucide-react';
import { TenantInfo } from '../../types';

interface TenantDetailProps {
  tenantId: string;
  onBackToList: () => void;
}

const TenantDetail: React.FC<TenantDetailProps> = ({ tenantId, onBackToList }) => {
  const { tenantInfo, setTenantInfo, isDataLoaded } = useProjectData();
  const [isEditDialogOpen, setEditDialogOpen] = useState(false);

  if (!isDataLoaded) {
    return <div className="flex items-center justify-center h-full">데이터 로딩 중...</div>;
  }

  const tenant = (tenantInfo || []).find(t => t.id === tenantId);

  const handleSave = (updatedTenant: TenantInfo) => {
    const updatedTenantInfo = tenantInfo.map(t => 
      t.id === updatedTenant.id ? updatedTenant : t
    );
    setTenantInfo(updatedTenantInfo);
    setEditDialogOpen(false); 
  };

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
                <CardTitle className="text-xl">{tenant.businessName}</CardTitle>
            </div>
            <Button variant="outline" onClick={() => setEditDialogOpen(true)}>
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
                            <TenantBasicInfoTab tenantId={tenantId} />
                        </TabsContent>
                        <TabsContent value="contracts" className="mt-4">
                            <TenantContractsTab tenantId={tenantId} />
                        </TabsContent>
                        <TabsContent value="documents" className="mt-4">
                            <TenantDocumentsTab tenantId={tenantId} />
                        </TabsContent>
                    </Tabs>
                </div>

                {/* Right Sidebar (Insight) */}
                <div className="lg:col-span-1">
                    <TenantInsightPanel tenantId={tenantId} />
                </div>
            </div>
        </CardContent>
        <EditTenantDialog
          tenant={tenant}
          isOpen={isEditDialogOpen}
          onClose={() => setEditDialogOpen(false)}
          onSave={handleSave}
        />
    </Card>
  );
};

export default TenantDetail;
