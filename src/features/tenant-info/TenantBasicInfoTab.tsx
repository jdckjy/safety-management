
import React, { useState } from 'react';
import { TenantInfo } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Pencil } from 'lucide-react';
import EditTenantDialog from './EditTenantDialog'; // 수정 다이얼로그 임포트
import { useProjectData } from '../../providers/ProjectDataProvider'; // 데이터 프로바이더 임포트

interface TenantBasicInfoTabProps {
  tenant: TenantInfo;
}

const InfoRow: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div className="grid grid-cols-3 gap-4 py-3 border-b border-gray-100">
    <p className="text-sm text-gray-600">{label}</p>
    <div className="col-span-2 text-sm font-medium">{value}</div>
  </div>
);

const TenantBasicInfoTab: React.FC<TenantBasicInfoTabProps> = ({ tenant }) => {
  const [isEditDialogOpen, setEditDialogOpen] = useState(false);
  const { updateTenant } = useProjectData(); // updateTenant 함수 가져오기

  const handleUpdateTenant = (updatedTenant: TenantInfo) => {
    updateTenant(updatedTenant);
    setEditDialogOpen(false); // 다이얼로그 닫기
  };

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
          <InfoRow label="업체(기관)명" value={tenant.companyName} />
          <InfoRow label="사업자등록번호" value={tenant.businessRegistrationNumber} />
          <InfoRow label="대표자명" value={tenant.representativeName} />
          <InfoRow label="담당자 연락처" value={tenant.contact} />
          <InfoRow label="기업 규모" value={tenant.companySize} />
          <InfoRow label="업종 카테고리" value={tenant.businessCategory} />
          <InfoRow label="주요 사업 내용" value={tenant.businessDescription || '-'} />
          <InfoRow label="유치 경로" value={tenant.acquisitionChannel || '-'} />
        </CardContent>
      </Card>

      {isEditDialogOpen && (
        <EditTenantDialog 
          isOpen={isEditDialogOpen}
          onClose={() => setEditDialogOpen(false)}
          tenant={tenant}
          onUpdateTenant={handleUpdateTenant}
        />
      )}
    </>
  );
};

export default TenantBasicInfoTab;
