
/**
 * @file src/features/tenant-info/TenantDetailView.tsx
 * @description 특정 임차인의 상세 정보를 표시하는 컴포넌트입니다.
 * - 기본 정보, 계약 현황, 서류 관리 탭을 제공합니다.
 * - 임차인 정보 요약 및 인사이트 패널을 포함합니다.
 * - 임차인 삭제 기능을 제공합니다.
 */

import React, { useState, useMemo } from 'react';
import { useProjectData } from '../../providers/ProjectDataProvider';
import { Button } from '../../components/ui/button';
import { ArrowLeft, Building2, Trash2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"
import TenantBasicInfoTab from './TenantBasicInfoTab';
import TenantContractsTab from './TenantContractsTab';
import TenantDocumentsTab from './TenantDocumentsTab';
import TenantInsightPanel from './TenantInsightPanel';
import { Badge } from '../../components/ui/badge';
import DeleteTenantDialog from './DeleteTenantDialog';

/**
 * @interface TenantDetailViewProps
 * @description TenantDetailView 컴포넌트의 props 타입을 정의합니다.
 */
interface TenantDetailViewProps {
  /** @property {string} tenantId - 상세 정보를 조회할 임차인의 고유 ID */
  tenantId: string;
  /** @property {() => void} onBack - '목록으로 돌아가기' 버튼 클릭 시 호출될 콜백 함수 */
  onBack: () => void;
}

const TenantDetailView: React.FC<TenantDetailViewProps> = ({ tenantId, onBack }) => {
  // ==================================================================================
  // State and Data Hooks
  // ==================================================================================

  const { tenantInfo, contracts, units, deleteTenant } = useProjectData();
  
  /** @state {boolean} isDeleteDialogOpen - 임차인 삭제 확인 다이얼로그의 열림/닫힘 상태 */
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  /** @variable {TenantInfo | undefined} tenant - 현재 선택된 임차인의 정보 객체 */
  const tenant = useMemo(() => tenantInfo.find(t => t.id === tenantId), [tenantInfo, tenantId]);

  // ==================================================================================
  // Memoized Derived Data (For Summary Panel)
  // ==================================================================================

  const tenantContracts = useMemo(() => contracts.filter(c => c.tenantId === tenantId), [contracts, tenantId]);

  const totalArea = useMemo(() => 
    tenantContracts.reduce((acc, contract) => {
      const unit = units.find(u => u.id === contract.unitId);
      return acc + (unit ? Number(unit.area_sqm) || 0 : 0);
    }, 0),
    [tenantContracts, units]
  );
  
  const contractStatus = useMemo(() => tenantContracts.length > 0 ? 'active' : 'inactive', [tenantContracts]);

  // ==================================================================================
  // Event Handlers
  // ==================================================================================

  const handleDeleteConfirm = () => {
    if (tenant) {
      deleteTenant(tenant.id);
      setDeleteDialogOpen(false);
      onBack();
    }
  };

  // ==================================================================================
  // Render Logic
  // ==================================================================================

  if (!tenant) {
    return (
      <div className="p-4 text-center">
        <p className="mb-4">임차인 정보를 찾을 수 없습니다.</p>
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          목록으로 돌아가기
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            목록으로 돌아가기
          </Button>
          <Button variant="destructive" onClick={() => setDeleteDialogOpen(true)}>
            <Trash2 className="mr-2 h-4 w-4" />
            임차인 삭제
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <aside className="lg:col-span-1 bg-white p-6 rounded-lg shadow-md flex flex-col items-center text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Building2 className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-xl font-bold mb-2">{tenant.businessName}</h2>
            <Badge variant={contractStatus === 'active' ? 'success' : 'outline'}>
              {contractStatus === 'active' ? '계약중' : '계약없음'}
            </Badge>
            <div className="w-full text-left mt-6 space-y-4">
              <div>
                <p className="text-sm text-gray-500">총 점유 면적</p>
                <p className="text-lg font-semibold">{totalArea.toLocaleString()} ㎡</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">활성 계약 수</p>
                <p className="text-lg font-semibold">{tenantContracts.length} 건</p>
              </div>
            </div>
          </aside>

          <main className="lg:col-span-2">
            <Tabs defaultValue="basic-info">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic-info">기본정보</TabsTrigger>
                <TabsTrigger value="contracts">계약현황</TabsTrigger>
                <TabsTrigger value="documents">서류관리</TabsTrigger>
              </TabsList>
              <TabsContent value="basic-info">
                <div className="bg-white p-6 rounded-lg shadow-md mt-4">
                  <TenantBasicInfoTab tenantId={tenant.id} />
                </div>
              </TabsContent>
              <TabsContent value="contracts">
                <div className="bg-white p-6 rounded-lg shadow-md mt-4">
                  <TenantContractsTab tenantId={tenant.id} />
                </div>
              </TabsContent>
              <TabsContent value="documents">
                <div className="bg-white p-6 rounded-lg shadow-md mt-4">
                  <TenantDocumentsTab tenantId={tenant.id} />
                </div>
              </TabsContent>
            </Tabs>
          </main>

          <aside className="lg:col-span-1">
            <TenantInsightPanel tenantId={tenant.id} />
          </aside>
        </div>
      </div>

      <DeleteTenantDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        tenantName={tenant.businessName}
      />
    </>
  );
};

export default TenantDetailView;
