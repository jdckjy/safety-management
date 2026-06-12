
import React, { useState, useMemo } from 'react';
import { TenantInfo } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Pencil } from 'lucide-react';
import { useProjectData } from '../../providers/ProjectDataProvider';
import EditTenantDialog from './EditTenantDialog';

interface TenantBasicInfoTabProps {
  tenantId: string;
}

const InfoRow: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div className="grid grid-cols-3 gap-4 py-3 border-b border-gray-100">
    <p className="text-sm text-gray-600">{label}</p>
    <div className="col-span-2 text-sm font-medium">{value || '-'}</div>
  </div>
);

const TenantBasicInfoTab: React.FC<TenantBasicInfoTabProps> = ({ tenantId }) => {
  const [isEditDialogOpen, setEditDialogOpen] = useState(false);
  const { tenantInfo, setTenantInfo } = useProjectData(); 
  const tenant = useMemo(() => tenantInfo.find(t => t.id === tenantId), [tenantInfo, tenantId]);

  const handleSave = (updatedTenant: TenantInfo) => {
    const updatedTenantInfo = tenantInfo.map(t => 
      t.id === updatedTenant.id ? updatedTenant : t
    );
    setTenantInfo(updatedTenantInfo);
  };

  if (!tenant) {
    return <div>기본 정보를 찾을 수 없습니다.</div>;
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg font-bold">기본 정보</CardTitle>
          <Button variant="outline" size="sm" onClick={() => setEditDialogOpen(true)}>
            <Pencil className="w-4 h-4 mr-2" />
            수정
          </Button>
        </CardHeader>
        <CardContent>
          <InfoRow label="업체(기관)명" value={tenant.companyName || tenant.businessName} />
          <InfoRow label="대표자명" value={tenant.representativeName || tenant.ownerName} />
          <InfoRow label="담당자 연락처" value={tenant.contact} />
          <InfoRow label="업종 카테고리" value={tenant.businessCategory || tenant.businessType} />
        </CardContent>
      </Card>
      <EditTenantDialog
        tenant={tenant}
        isOpen={isEditDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        onSave={handleSave}
      />
    </>
  );
};

export default TenantBasicInfoTab;
