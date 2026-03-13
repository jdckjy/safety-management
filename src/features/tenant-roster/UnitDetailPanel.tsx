
import React from 'react';
import { TenantUnit } from '../../types';
import { Button } from '../../components/ui/button';

interface UnitDetailPanelProps {
  unit: TenantUnit;
  onEdit: (unit: TenantUnit) => void;
  onDelete: (unitId: string) => void;
}

const UnitDetailPanel: React.FC<UnitDetailPanelProps> = ({ unit, onEdit, onDelete }) => {

  const renderDetail = (label: string, value: React.ReactNode) => (
    <div className="grid grid-cols-3 gap-4 text-sm py-3 border-b border-gray-200">
        <dt className="font-semibold text-gray-500 col-span-1">{label}</dt>
        <dd className="text-gray-800 col-span-2">{value || '-'}</dd>
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow-lg h-full flex flex-col">
      <div className="p-6 border-b">
        <h3 className="text-2xl font-bold text-gray-800">{unit.name}</h3>
        <p className={`text-sm font-semibold mt-1 ${unit.status === '입주' ? 'text-green-600' : unit.status === '공실' ? 'text-red-600' : 'text-yellow-600'}`}>
            {unit.status}
        </p>
      </div>

      <dl className="flex-grow p-6 overflow-y-auto">
        {renderDetail('층', unit.floor)}
        {renderDetail('면적(m²)', unit.area.toFixed(2))}
        {renderDetail('임차인', unit.tenant)}
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
