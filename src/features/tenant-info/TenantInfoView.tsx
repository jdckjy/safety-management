
/**
 * @file src/features/tenant-info/TenantInfoView.tsx
 * @description 임차인 정보 관리의 메인 뷰 컴포넌트입니다.
 * - 임차인 목록 조회, 검색, 및 신규 등록 기능을 제공합니다.
 * - 특정 임차인 선택 시 상세 뷰(TenantDetailView)로 전환됩니다.
 */

import React, { useState, useMemo } from 'react';
import { useProjectData } from '../../providers/ProjectDataProvider';
import { Input } from "../../components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table"
import { Badge } from "../../components/ui/badge";
import { Button } from '../../components/ui/button';
import { TenantInfo } from '../../types';
import TenantDetailView from './TenantDetailView';
import AddTenantDialog from './AddTenantDialog';

const TenantInfoView: React.FC = () => {
  // ==================================================================================
  // State and Data Hooks
  // ==================================================================================
  
  const { tenantInfo, contracts, addTenant } = useProjectData();
  
  /** @state {string} filter - 목록 검색을 위한 필터 문자열 */
  const [filter, setFilter] = useState('');
  /** @state {string | null} selectedTenantId - 사용자가 선택한 임차인의 ID. null이면 목록 뷰를 표시. */
  const [selectedTenantId, setSelectedTenantId] = useState<string | null>(null);
  /** @state {boolean} isAddDialogOpen - 신규 임차인 등록 다이얼로그의 열림/닫힘 상태 */
  const [isAddDialogOpen, setAddDialogOpen] = useState(false);

  // ==================================================================================
  // Memoized Logic
  // ==================================================================================

  /**
   * @memo filteredTenants
   * @description 검색 필터(filter)에 따라 임차인 목록을 동적으로 필터링합니다.
   * tenantInfo나 filter 값이 변경될 때만 재계산하여 성능을 최적화합니다.
   */
  const filteredTenants = useMemo(() => {
    if (!filter) return tenantInfo; // 검색어가 없으면 전체 목록 반환
    
    return tenantInfo.filter(tenant =>
      tenant.companyName.toLowerCase().includes(filter.toLowerCase()) ||
      tenant.representativeName.toLowerCase().includes(filter.toLowerCase())
    );
  }, [tenantInfo, filter]);

  /**
   * @memo tenantContractStatus
   * @description 각 임차인의 계약 상태를 계산하여 Map으로 관리합니다.
   * 활성 계약이 하나라도 존재하면 '계약중'으로 간주합니다.
   * contracts 데이터가 변경될 때만 재계산됩니다.
   */
  const tenantContractStatus = useMemo(() => {
    const statusMap = new Map<string, boolean>();
    contracts.forEach(contract => {
      // 이미 계약이 있다고 표시된 임차인은 건너뜀
      if (!statusMap.has(contract.tenantId)) {
        statusMap.set(contract.tenantId, true);
      }
    });
    return statusMap;
  }, [contracts]);

  // ==================================================================================
  // Event Handlers
  // ==================================================================================

  /**
   * @handler handleAddTenant
   * @description AddTenantDialog에서 신규 임차인 정보를 받아와 데이터 컨텍스트에 추가합니다.
   * @param {TenantInfo} newTenant - 새로 생성된 임차인 객체
   */
  const handleAddTenant = (newTenant: TenantInfo) => {
    addTenant(newTenant);
  };

  /**
   * @handler handleRowClick
   * @description 테이블 행 클릭 시 해당 임차인의 상세 뷰를 엽니다.
   * @param {string} tenantId - 선택된 임차인의 ID
   */
  const handleRowClick = (tenantId: string) => {
    setSelectedTenantId(tenantId);
  };

  /**
   * @handler handleBackToList
   * @description 상세 뷰에서 목록 뷰로 돌아갑니다.
   */
  const handleBackToList = () => {
    setSelectedTenantId(null);
  };

  // ==================================================================================
  // Conditional Rendering
  // ==================================================================================

  // 선택된 임차인이 있으면 상세 뷰를 렌더링합니다.
  if (selectedTenantId) {
    return <TenantDetailView tenantId={selectedTenantId} onBack={handleBackToList} />;
  }

  // ==================================================================================
  // Main Render
  // ==================================================================================

  return (
    <div className="p-4">
      {/* 1. 헤더: 페이지 제목 및 신규 등록 버튼 */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">임차인 관리</h1>
        <Button onClick={() => setAddDialogOpen(true)}>신규 임차인 등록</Button>
      </div>

      {/* 2. 검색 바 */}
      <div className="mb-4">
        <Input
          placeholder="업체명 또는 대표자명으로 검색..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      </div>

      {/* 3. 임차인 목록 테이블 */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>업체(기관)명</TableHead>
              <TableHead>대표자명</TableHead>
              <TableHead>사업자등록번호</TableHead>
              <TableHead>연락처</TableHead>
              <TableHead>계약 상태</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTenants.length > 0 ? (
              filteredTenants.map((tenant) => (
                <TableRow key={tenant.id} onClick={() => handleRowClick(tenant.id)} className="cursor-pointer hover:bg-gray-50">
                  <TableCell className="font-medium">{tenant.companyName}</TableCell>
                  <TableCell>{tenant.representativeName}</TableCell>
                  <TableCell>{tenant.businessRegistrationNumber}</TableCell>
                  <TableCell>{tenant.contact}</TableCell>
                  <TableCell>
                    <Badge variant={tenantContractStatus.has(tenant.id) ? 'success' : 'outline'}>
                      {tenantContractStatus.has(tenant.id) ? '계약중' : '계약없음'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  검색 결과가 없습니다.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* 4. 신규 임차인 등록 다이얼로그 */}
      <AddTenantDialog 
        isOpen={isAddDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        onAddTenant={handleAddTenant}
      />
    </div>
  );
};

export default TenantInfoView;
