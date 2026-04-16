
import React from 'react';
import { TenantUnit, TenantInfo, TenantUnitStatus } from '../../types';
import { Button } from '../../components/ui/button';
import { useProjectData } from '../../providers/ProjectDataProvider';

interface UnitDetailPanelProps {
  unit: TenantUnit;
  onEdit: (unit: TenantUnit) => void;
  onDelete: (unitId: string) => void;
}

const statusMap: { [key in TenantUnitStatus]: { text: string; className: string } } = {
  OCCUPIED: { text: '입주', className: 'text-green-600' },
  VACANT: { text: '공실', className: 'text-red-600' },
  IN_DISCUSSION: { text: '협의중', className: 'text-yellow-600' },
  NON_RENTABLE: { text: '비임대', className: 'text-gray-500' },
};


const UnitDetailPanel: React.FC<UnitDetailPanelProps> = ({ unit, onEdit, onDelete }) => {
  const { tenantInfo } = useProjectData();

  const tenantName = React.useMemo(() => {
    if (!unit.tenant) {
      return '-';
    }
    const tenant = (tenantInfo || []).find((t: TenantInfo) => t.id === unit.tenant);
    return tenant ? tenant.companyName : unit.tenant;
  }, [unit.tenant, tenantInfo]);

  const renderDetail = (label: string, value: React.ReactNode) => (
    <div className="grid grid-cols-3 gap-4 text-sm py-3 border-b border-gray-200">
        <dt className="font-semibold text-gray-500 col-span-1">{label}</dt>
        <dd className="text-gray-800 col-span-2">{value || '-'}</dd>
    </div>
  );
  
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
        {renderDetail('임차인', tenantName)}
        {renderDetail('월임대료', unit.rent ? `${unit.rent.toLocaleString()} 원` : '-')}
        {renderDetail('보증금', unit.deposit ? `${unit.deposit.toLocaleString()} 원` : '-')}
        {renderDetail('계약일', unit.contractDate)}
        {renderDetail('입주일', unit.moveInDate)}
        {renderDetail('만기일', unit.moveOutDate)}
      </dl>

      <div className="p-6 border-t bg-gray-50 rounded-b-lg">
        <div className="flex justify-end space-x-3">
          <Button variant="outline" onClick={() => onEdit(unit)}>정보 수정</Button>
          <Button variant="destructive" onClick={() => onDelete(unit.id)}>삭제</Button>
        </div>
      </div>
    </div>
  );
};

export default UnitDetailPanel;
