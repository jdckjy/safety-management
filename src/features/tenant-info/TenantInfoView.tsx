
import React, { useState, useEffect } from 'react';
import { useProjectData } from '../../providers/ProjectDataProvider';
import TenantInfoList from './TenantInfoList';
import TenantDetail from './TenantDetail';
import { Button } from '../../components/ui/button';
import { PlusCircle } from 'lucide-react';
import AddTenantDialog from './AddTenantDialog'; 
import { TenantInfo } from '../../types';
import { Card, CardContent } from '../../components/ui/card';

const TenantInfoView: React.FC = () => {
  const { tenantInfo, isDataLoaded, addTenant } = useProjectData();
  const [selectedTenantId, setSelectedTenantId] = useState<string | null>(null);
  const [isAddTenantDialogOpen, setIsAddTenantDialogOpen] = useState(false);

  useEffect(() => {
    if (isDataLoaded && (!selectedTenantId || !tenantInfo.some(t => t.id === selectedTenantId)) && tenantInfo.length > 0) {
        setSelectedTenantId(tenantInfo[0].id);
    }
  }, [isDataLoaded, tenantInfo, selectedTenantId]);

  const handleAddTenant = (newTenant: TenantInfo) => {
    addTenant(newTenant);
    setSelectedTenantId(newTenant.id);
    setIsAddTenantDialogOpen(false); // Close dialog on successful addition
  };

  if (!isDataLoaded) {
    return <div className="flex items-center justify-center h-full"><p>데이터 로딩 중...</p></div>;
  }

  if (!tenantInfo || tenantInfo.length === 0) {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <h3 className="text-xl font-semibold mb-2">등록된 임차인이 없습니다.</h3>
            <p className="text-gray-500 mb-4">새로운 임차인을 등록하여 관리를 시작하세요.</p>
            <Button onClick={() => setIsAddTenantDialogOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                신규 임차인 등록
            </Button>
            <AddTenantDialog 
                isOpen={isAddTenantDialogOpen}
                onClose={() => setIsAddTenantDialogOpen(false)}
                onAddTenant={handleAddTenant}
            />
        </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-4 h-[calc(100vh-200px)]">
      <div className="md:col-span-1 lg:col-span-1">
        <Card className="h-full">
          <CardContent className="p-2">
            <div className="flex justify-between items-center mb-2 px-2">
              <h2 className="text-md font-semibold">임차인 목록</h2>
              <Button variant="ghost" size="sm" onClick={() => setIsAddTenantDialogOpen(true)}>
                  <PlusCircle className="h-5 w-5" />
              </Button>
            </div>
            <TenantInfoList 
              tenants={tenantInfo}
              selectedTenantId={selectedTenantId}
              onTenantSelect={setSelectedTenantId} 
            />
          </CardContent>
        </Card>
      </div>
      
      <div className="md:col-span-3 lg:col-span-4 h-full">
        {selectedTenantId ? (
          <TenantDetail tenantId={selectedTenantId} />
        ) : (
          <div className="flex items-center justify-center h-full bg-gray-50 rounded-lg">
            <p className="text-gray-500">목록에서 임차인을 선택하세요.</p>
          </div>
        )}
      </div>

      <AddTenantDialog 
        isOpen={isAddTenantDialogOpen}
        onClose={() => setIsAddTenantDialogOpen(false)}
        onAddTenant={handleAddTenant}
      />
    </div>
  );
};

export default TenantInfoView;
