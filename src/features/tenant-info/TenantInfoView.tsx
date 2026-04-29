
import React, { useState, useEffect } from 'react';
import { useProjectData } from '../../providers/ProjectDataProvider';
import TenantInfoList from './TenantInfoList';
import TenantDetail from './TenantDetail';

const TenantInfoView: React.FC = () => {
  const { tenantInfo, isDataLoaded } = useProjectData();
  const [selectedTenantId, setSelectedTenantId] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedTenantId && isDataLoaded && tenantInfo && tenantInfo.length > 0) {
      setSelectedTenantId(tenantInfo[0].id);
    }
  }, [isDataLoaded, tenantInfo, selectedTenantId]);

  if (!isDataLoaded) {
    return <div className="flex items-center justify-center h-full">데이터 로딩 중...</div>;
  }

  if (!tenantInfo || tenantInfo.length === 0) {
    return <div className="flex items-center justify-center h-full">등록된 임차인이 없습니다.</div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div className="lg:col-span-1">
        <TenantInfoList 
          tenants={tenantInfo}
          onTenantSelect={setSelectedTenantId} 
        />
      </div>
      <div className="lg:col-span-3">
        {selectedTenantId ? (
          <TenantDetail tenantId={selectedTenantId} />
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">목록에서 임차인을 선택하세요.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TenantInfoView;
