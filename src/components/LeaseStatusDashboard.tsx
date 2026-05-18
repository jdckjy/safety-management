import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useProjectData } from '@/providers/ProjectDataProvider';
import { Contract, Unit, ComplexFacility } from '@/types';
import { Trash2 } from 'lucide-react';

const LeaseStatusDashboard = () => {
  const { contracts, units, complexFacilities, tenantInfo, deleteContract } = useProjectData();

  const getLeaseItemName = (contract: Contract): string => {
    if (contract.unitId) {
      const unit = units.find(u => u.id === contract.unitId);
      return unit ? `${unit.floor || ''}층 ${unit.unitNumber}호` : '알 수 없는 호실';
    }
    if (contract.facilityId) {
      const facility = complexFacilities.find(f => f.id === contract.facilityId);
      return facility ? facility.name : '알 수 없는 시설';
    }
    return '연결 정보 없음';
  };

  const getTenantName = (tenantId: string): string => {
    const tenant = tenantInfo.find(t => t.id === tenantId);
    return tenant ? tenant.businessName : '알 수 없는 임차인';
  };

  const getItemArea = (contract: Contract): string => {
    let item: Unit | ComplexFacility | undefined;
    if (contract.unitId) {
      item = units.find(u => u.id === contract.unitId);
    } else if (contract.facilityId) {
      item = complexFacilities.find(f => f.id === contract.facilityId);
    }
    return item?.area ? `${item.area.toFixed(2)} m²` : '정보 없음';
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">임대 및 세대 관리</h2>

      {/* ===== DEBUG BUTTON ===== */}
      <Button variant="destructive">이것은 테스트 버튼입니다</Button> 

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {contracts.map(contract => (
          <Card key={contract.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {getLeaseItemName(contract)}
              </CardTitle>
              
              {/* Making the button solid and red for visibility */}
              <Button variant="destructive" size="sm" onClick={() => deleteContract(contract.id)}>
                <Trash2 className="h-4 w-4 mr-2" />
                삭제
              </Button>

            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                <p>계약 기간: {new Date(contract.startDate).toLocaleDateString()} ~ {new Date(contract.endDate).toLocaleDateString()}</p>
                <p>면적: {getItemArea(contract)}</p>
                <p>보증금: {contract.deposit.toLocaleString()} 원</p>
                <p>월 임대료: {contract.rent.toLocaleString()} 원</p>
                <p>임차인: {getTenantName(contract.tenantId)}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default LeaseStatusDashboard;
