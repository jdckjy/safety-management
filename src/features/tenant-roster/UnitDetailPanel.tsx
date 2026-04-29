
import React from 'react';
import { Button } from '../../components/ui/button';
import { Pencil } from 'lucide-react';
import { EnrichedUnit } from './TenantRoster'; // EnrichedUnit 타입을 import

interface UnitDetailPanelProps {
  unit: EnrichedUnit;
  onEdit: () => void; // TenantRoster에서 이미 unit 객체를 알고 있으므로 인자 필요 없음
  onDelete: () => void; // TenantRoster에서 이미 unit.id를 알고 있으므로 인자 필요 없음
  onEditTenant?: () => void; // 선택 사항, tenant가 있을 때만 전달됨
}

const statusMap = {
  OCCUPIED: { text: '계약', className: 'text-green-600' },
  VACANT: { text: '공실', className: 'text-red-600' },
};

const UnitDetailPanel: React.FC<UnitDetailPanelProps> = ({ unit, onEdit, onDelete, onEditTenant }) => {

  const renderDetail = (label: string, value: React.ReactNode) => {
    if (value === null || value === undefined || value === '') return null;
    return (
        <div className="grid grid-cols-3 gap-4 text-sm py-3 border-b border-gray-200">
            <dt className="font-semibold text-gray-500 col-span-1">{label}</dt>
            <dd className="text-gray-800 col-span-2">{value}</dd>
        </div>
    );
  }
  
  const statusInfo = statusMap[unit.status];
  const { tenant, contract } = unit;

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
        {renderDetail('전용 면적(m²)', unit.area_sqm.toFixed(2))}
        
        {/* 임차인 정보 */}
        <div className="grid grid-cols-3 gap-4 text-sm py-3 border-b border-gray-200 items-center">
            <dt className="font-semibold text-gray-500 col-span-1">임차인</dt>
            <dd className="text-gray-800 col-span-2 flex justify-between items-center">
                <span>{tenant ? tenant.companyName : '-'}</span>
                {tenant && onEditTenant && (
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onEditTenant}>
                        <Pencil className="h-4 w-4 text-gray-400" />
                    </Button>
                )}
            </dd>
        </div>

        {/* 계약 및 임차인 상세 정보 (점유 상태일 때만 표시) */}
        {tenant && contract && (
          <>
            {renderDetail('주요 사업', tenant.businessDescription)}
            {renderDetail(
              '상주 인원',
              tenant.residentEmployees ? `남 ${tenant.residentEmployees.male}명 / 여 ${tenant.residentEmployees.female}명` : '-'
            )}
             {renderDetail('계약 기간', `${contract.startDate || ''} ~ ${contract.endDate || ''}`)}
            {renderDetail('월 임대료', contract.monthlyRent ? `${contract.monthlyRent.toLocaleString()} 원` : '-')}
            {renderDetail('보증금', contract.deposit ? `${contract.deposit.toLocaleString()} 원` : '-')}
          </>
        )}

      </dl>

      <div className="p-6 border-t bg-gray-50 rounded-b-lg">
        <div className="flex justify-end space-x-3">
          <Button variant="outline" onClick={onEdit}>호실 정보 수정</Button>
          <Button variant="destructive" onClick={onDelete}>삭제</Button>
        </div>
      </div>
    </div>
  );
};

export default UnitDetailPanel;
