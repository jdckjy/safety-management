
import React, { useState, useMemo } from 'react';
import { useProjectData } from '../../providers/ProjectDataProvider';
import { TenantUnit } from '../../types';
import UnitEditModal from './UnitEditModal';
import FloorPlan from './FloorPlan';
import UnitDetailPanel from './UnitDetailPanel';
import { Button } from '../../components/ui/button';
import FloorPlanDrafter from '../floor-plan/FloorPlanDrafter';

// 수정된 이미지 경로 임포트
import floor1F from '../../assets/1F.png';
import floor2F from '../../assets/2F.png';
import floor3F from '../../assets/3F.png';

const TenantRoster: React.FC = () => {
  const { tenantUnits, deleteTenantUnit } = useProjectData();
  const [selectedFloor, setSelectedFloor] = useState('1F');
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Partial<TenantUnit> | null>(null);
  const [isDrafterMode, setDrafterMode] = useState(false);

  const floorPlanImages: { [key: string]: string } = {
    '1F': floor1F,
    '2F': floor2F,
    '3F': floor3F,
  };

  const unitsOnSelectedFloor = useMemo(() => 
    tenantUnits.filter(u => u.floor === selectedFloor),
    [tenantUnits, selectedFloor]
  );

  const selectedUnit = useMemo(() => 
    (selectedUnitId ? tenantUnits.find(u => u.id === selectedUnitId) : null) || null,
    [tenantUnits, selectedUnitId]
  );

  const handleUnitSelect = (unitId: string) => {
    setSelectedUnitId(prevId => (prevId === unitId ? null : unitId));
  };

  const handleEdit = (unit: TenantUnit) => {
    setEditingUnit(unit);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingUnit(null);
    setIsModalOpen(true);
  };

  const handleDelete = (unitId: string) => {
    if (window.confirm('정말로 이 유닛을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      if (selectedUnitId === unitId) {
        setSelectedUnitId(null);
      }
      deleteTenantUnit(unitId);
    }
  };

  if (isDrafterMode) {
    return <FloorPlanDrafter />;
  }

  return (
    <div className="h-full flex flex-col p-4 gap-4">
      <UnitEditModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        unit={editingUnit}
        floor={selectedFloor}
      />

      <div className="flex justify-between items-center">
        <div className="flex space-x-2">
          {Object.keys(floorPlanImages).map(floor => (
            <Button 
              key={floor} 
              onClick={() => { setSelectedFloor(floor); setSelectedUnitId(null); }}
              variant={selectedFloor === floor ? 'default' : 'outline'}>
              {floor}
            </Button>
          ))}
        </div>
        <div className="flex space-x-2">
          <Button onClick={handleAddNew} variant="default">신규 유닛 추가</Button>
          <Button onClick={() => setDrafterMode(true)} variant="secondary">도면 편집</Button>
        </div>
      </div>

      <div className="flex-grow grid grid-cols-1 md:grid-cols-3 gap-4" style={{ minHeight: 0 }}>
        <div className="md:col-span-2 bg-white p-4 rounded-lg shadow-md">
           <FloorPlan 
              units={unitsOnSelectedFloor}
              onUnitSelect={handleUnitSelect}
              selectedUnitId={selectedUnitId}
              floorPlanImage={floorPlanImages[selectedFloor]}
            />
        </div>

        <div className="md:col-span-1 h-full">
          {selectedUnit ? (
            <UnitDetailPanel 
              unit={selectedUnit} 
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ) : (
            <div className="bg-white rounded-lg shadow-lg h-full flex items-center justify-center">
              <p className="text-gray-500">도면에서 유닛을 선택해주세요.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TenantRoster;
