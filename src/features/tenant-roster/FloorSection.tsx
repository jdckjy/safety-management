
import React from 'react';
import { TenantUnit } from '../../types';
import { Button } from '../../components/ui/button';
import { Plus } from 'lucide-react';

interface FloorSectionProps {
  floor: string;
  units: TenantUnit[];
  onAddUnit: (floor: string) => void;
  onEditUnit: (unit: TenantUnit) => void;
}

const FloorSection: React.FC<FloorSectionProps> = ({ floor, units, onAddUnit, onEditUnit }) => {
  return (
    <div className="border rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">{floor}층</h2>
        <Button variant="outline" size="sm" onClick={() => onAddUnit(floor)}>
          <Plus className="mr-2 h-4 w-4" />
          호실 추가
        </Button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {units.map(unit => (
          <div 
            key={unit.id}
            className="border rounded-lg p-3 text-center cursor-pointer hover:bg-gray-100"
            onClick={() => onEditUnit(unit)}
          >
            <p className="font-semibold">{unit.name}</p>
            <p className="text-sm text-gray-500">{unit.status}</p>
            {unit.tenantName && <p className="text-sm">{unit.tenantName}</p>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FloorSection;
