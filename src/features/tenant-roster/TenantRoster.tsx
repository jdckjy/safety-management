
import React, { useState } from 'react';
import { useProjectData } from '../../providers/ProjectDataProvider';
import FloorPlan from './FloorPlan';
import UnitDetailPanel from './UnitDetailPanel';
import FloorPlanDrafter from '../floor-plan/FloorPlanDrafter';
import { TenantUnit } from '../../types';
import floor1F from '../../assets/1F.png';
import floor2F from '../../assets/2F.png';
import floor3F from '../../assets/3F.png';

const TenantRoster: React.FC = () => {
  const { tenantUnits, updateTenantUnit } = useProjectData();
  const [selectedFloor, setSelectedFloor] = useState('1F');
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);
  const [isDrafterMode, setDrafterMode] = useState(false);

  const floorPlans: { [key: string]: string } = {
    '1F': floor1F,
    '2F': floor2F,
    '3F': floor3F,
  };

  const handleUnitSelect = (unitId: string) => {
    setSelectedUnitId(unitId);
  };

  const handleUnitUpdate = (updatedUnit: TenantUnit) => {
    updateTenantUnit(updatedUnit);
  };

  const selectedUnit = tenantUnits.find(u => u.id === selectedUnitId) || null;

  if (isDrafterMode) {
    return <FloorPlanDrafter />;
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex space-x-2">
          {Object.keys(floorPlans).map(floor => (
            <button 
              key={floor} 
              onClick={() => setSelectedFloor(floor)}
              className={`px-4 py-2 rounded ${selectedFloor === floor ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
              {floor}
            </button>
          ))}
        </div>
        <button onClick={() => setDrafterMode(true)} className="px-4 py-2 rounded bg-green-500 text-white">
          도면 편집
        </button>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2">
          <FloorPlan 
            units={tenantUnits.filter(u => u.floor === selectedFloor)}
            onUnitSelect={handleUnitSelect}
            selectedUnitId={selectedUnitId}
            floorPlanImage={floorPlans[selectedFloor]}
          />
        </div>
        <div>
          {selectedUnit && 
            <UnitDetailPanel 
              unit={selectedUnit} 
              onUpdate={handleUnitUpdate} 
            />
          }
        </div>
      </div>
    </div>
  );
};

export default TenantRoster;
