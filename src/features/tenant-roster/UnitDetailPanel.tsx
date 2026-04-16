
import React from 'react';
import { TenantUnit, TenantInfo, TenantUnitStatus } from '../../types';
import { Button } from '../../components/ui/button';
import { useProjectData } from '../../providers/ProjectDataProvider';
import { Pencil } from 'lucide-react';

interface UnitDetailPanelProps {
  unit: TenantUnit;
  onEdit: (unit: TenantUnit) => void;
  onDelete: (unitId: string) => void;
  onEditTenant: (tenantId: string) => void; // 임차인 수정 핸들러 추가
}

const statusMap: { [key in TenantUnitStatus]: { text: string; className: string } } = {
  OCCUPIED: { text: '입주', className: 'text-green-600' },
  VACANT: { text: '공실', className: 'text-red-600' },
  IN_DISCUSSION: { text: '협의중', className: 'text-yellow-600' },
  NON_RENTABLE: { text: '비임대', className: 'text-gray-500' },
};


const UnitDetailPanel: React.FC<UnitDetailPanelProps> = ({ unit, onEdit, onDelete, onEditTenant }) => {
  const { tenantInfo } = useProjectData();

  const tenant = React.useMemo(() => {
    if (!unit.tenant) return null;
    return (tenantInfo || []).find((t: TenantInfo) => t.id === unit.tenant) || null;
  }, [unit.tenant, tenantInfo]);

  const tenantName = tenant ? tenant.companyName : (unit.tenant || '-');

  const renderDetail = (label: string, value: React.ReactNode) => {
    if (!value) return null; // 값이 없으면 렌더링하지 않음
    return (
        <div className="grid grid-cols-3 gap-4 text-sm py-3 border-b border-gray-200">
            <dt className="font-semibold text-gray-500 col-span-1">{label}</dt>
            <dd className="text-gray-800 col-span-2">{value}</dd>
        </div>
    );
  }
  
  const statusInfo = statusMap[unit.status] || { text: unit.status, className: 'text-gray-500' };

  return (
    <div className="bg-white rounded-lg shadow-lg h-full flex flex-col">
      <div className="p-6 border-b">
        <h3 className="text-2xl font-bold text-gray-800">{unit.name}</h3>
        <p className={`text-sm font-semibold mt-1 ${statusInfo.className}`}>
            {statusInfo.text}
        </p>
      </div>

      <dl className="flex-grow p-6 overflow-y-auto">
        {renderDetail('층', unit.floor)}
        {renderDetail('면적(m²)', unit.area.toFixed(2))}
        
        {/* 임차인 정보 + 수정 버튼 */}
        <div className="grid grid-cols-3 gap-4 text-sm py-3 border-b border-gray-200 items-center">
            <dt className="font-semibold text-gray-500 col-span-1">임차인</dt>
            <dd className="text-gray-800 col-span-2 flex justify-between items-center">
                <span>{tenantName}</span>
                {tenant && (
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEditTenant(tenant.id)}>
                        <Pencil className="h-4 w-4 text-gray-400" />
                    </Button>
                )}
            </dd>
        </div>

        {/* 추가된 임차인 정보 */}
        {tenant && (
          <>
            {renderDetail('주요 사업', tenant.businessDescription)}
            {renderDetail(
              '상주 인원',
              tenant.residentEmployees ? `남 ${tenant.residentEmployees.male}명 / 여 ${tenant.residentEmployees.female}명` : null
            )}
            {renderDetail('유치 경로', tenant.acquisitionChannel)}
          </>
        )}

        {renderDetail('월임대료', unit.rent ? `${unit.rent.toLocaleString()} 원` : null)}
        {renderDetail('보증금', unit.deposit ? `${unit.deposit.toLocaleString()} 원` : null)}
        {renderDetail('계약일', unit.contractDate)}
        {renderDetail('입주일', unit.moveInDate)}
        {renderDetail('만기일', unit.moveOutDate)}
        
        {unit.remarks && (
            <div className="grid grid-cols-1 gap-1 text-sm py-3">
                <dt className="font-semibold text-gray-500 col-span-1">비고</dt>
                <dd className="text-gray-700 col-span-1 whitespace-pre-wrap bg-gray-50 p-3 rounded-md">{unit.remarks}</dd>
            </div>
        )}
      </dl>

      <div className="p-6 border-t bg-gray-50 rounded-b-lg">
        <div className="flex justify-end space-x-3">
          <Button variant="outline" onClick={() => onEdit(unit)}>호실 정보 수정</Button>
          <Button variant="destructive" onClick={() => onDelete(unit.id)}>삭제</Button>
        </div>
      </div>
    </div>
  );
};

export default UnitDetailPanel;
