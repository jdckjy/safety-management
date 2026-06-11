
import React, { useState, useMemo, useEffect } from 'react';
import { Building, EnrichedUnit } from '@/types';
import { useProjectData } from '../../providers/ProjectDataProvider';
import FloorPlanControls from './FloorPlanControls';
import FloorPlan from './FloorPlan';
import UnitDetailPanel from '../tenant-roster/UnitDetailPanel';

interface FloorPlanBrowserProps {
  buildings: Building[];
}

const FloorPlanBrowser: React.FC<FloorPlanBrowserProps> = ({ buildings }) => {
  const { tenantInfo, contracts } = useProjectData();
  const [selectedBuildingId, setSelectedBuildingId] = useState<string | null>(null);
  const [selectedFloor, setSelectedFloor] = useState<number>(1);
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);

  useEffect(() => {
    if (buildings && buildings.length > 0) {
      const currentBuildingExists = buildings.some(b => b.id === selectedBuildingId);
      if (!selectedBuildingId || !currentBuildingExists) {
        setSelectedBuildingId(buildings[0].id);
        setSelectedFloor(1);
        setSelectedUnitId(null);
      }
    } else {
      setSelectedBuildingId(null);
      setSelectedUnitId(null);
    }
  }, [buildings, selectedBuildingId]);

  const selectedBuilding = useMemo(() => 
    buildings.find(b => b.id === selectedBuildingId), 
    [buildings, selectedBuildingId]
  );

  const handleFloorChange = (floor: number) => {
    setSelectedFloor(floor);
    setSelectedUnitId(null);
  };
  
  const handleUnitSelect = (unitId: string) => {
    setSelectedUnitId(prevId => prevId === unitId ? null : unitId);
  };

  const currentFloorInfo = useMemo(() => 
    selectedBuilding?.floors.find(f => f.level === selectedFloor), 
    [selectedBuilding, selectedFloor]
  );

  const unitsOnCurrentFloor = useMemo(() => 
    selectedBuilding?.units.filter(unit => String(unit.floor) === String(selectedFloor)) || [], 
    [selectedBuilding, selectedFloor]
  );

  const enrichedUnits = useMemo<EnrichedUnit[]>(() => {
    if (!unitsOnCurrentFloor) return [];
    return unitsOnCurrentFloor.map(unit => {
      const unitContracts = (contracts || []).filter(c => c.unitId === unit.id);
      const latestContract = unitContracts.sort((a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime())[0];
      const tenant = latestContract ? (tenantInfo || []).find(t => t.id === latestContract.tenantId) : undefined;
      return { ...unit, tenant, contract: latestContract };
    });
  }, [unitsOnCurrentFloor, tenantInfo, contracts]);

  const selectedUnit = useMemo<EnrichedUnit | undefined>(() =>
    enrichedUnits.find(unit => unit.id === selectedUnitId),
    [enrichedUnits, selectedUnitId]
  );

  if (!buildings || buildings.length === 0) {
    return <div className="bg-white rounded-lg shadow-md p-6"><h3 className="text-xl font-bold mb-4">층별 평면도</h3><div className="text-center py-10 text-gray-500">등록된 건물 정보가 없습니다.</div></div>;
  }
  
  if (!selectedBuilding) {
    return <div className="bg-white rounded-lg shadow-md p-6"><h3 className="text-xl font-bold mb-4">층별 평면도</h3><div className="text-center py-10 text-gray-500">건물 정보를 불러오는 중입니다...</div></div>;
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div className="xl:col-span-2 bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold mb-4">{selectedBuilding.name}</h3>
        
        {/* ===== DEBUG OUTPUT START ===== */}
        <div className="bg-gray-100 p-2 rounded-md my-4">
          <h4 className="font-bold text-sm mb-1">[DEBUG] Enriched Units Data:</h4>
          <pre className="text-xs overflow-auto max-h-48 bg-white p-2 border">{
            JSON.stringify(enrichedUnits, null, 2)
          }</pre>
        </div>
        {/* ===== DEBUG OUTPUT END ===== */}

        <FloorPlanControls
          floors={selectedBuilding.floors.map(f => f.level)}
          selectedFloor={selectedFloor}
          onFloorChange={handleFloorChange}
        />
        {currentFloorInfo ? (
          <FloorPlan 
            imageUrl={currentFloorInfo.floor_plan_url}
            units={enrichedUnits}
            selectedUnitId={selectedUnitId}
            onUnitSelect={handleUnitSelect}
            currentFloor={selectedFloor}
          />
        ) : (
          <div className="text-center py-10">선택된 층의 평면도 정보가 없습니다.</div>
        )}
      </div>
      
      <div className="xl:col-span-1">
        {selectedUnit ? (
          <UnitDetailPanel
            unit={selectedUnit}
            onEdit={() => alert(`Edit: ${selectedUnit.name}`)}
            onDelete={() => alert(`Delete: ${selectedUnit.name}`)}
          />
        ) : (
          <div className="bg-white rounded-lg shadow-lg h-full flex items-center justify-center p-6">
            <div className="text-center">
              <p className="text-lg font-semibold text-gray-700">호실을 선택해주세요</p>
              <p className="text-sm text-gray-500 mt-1">평면도에서 호실을 클릭하면 상세 정보가 표시됩니다.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FloorPlanBrowser;
