import React, { useState, useMemo, useEffect } from 'react';
import { Building } from '@/types';
import FloorPlanControls from './FloorPlanControls';
import FloorPlan from './FloorPlan';

interface FloorPlanBrowserProps {
  buildings: Building[];
}

const FloorPlanBrowser: React.FC<FloorPlanBrowserProps> = ({ buildings }) => {
  const [selectedBuildingId, setSelectedBuildingId] = useState<string | null>(null);
  const [selectedFloor, setSelectedFloor] = useState<number>(1);

  // 무한 루프 수정: useEffect의 의존성 배열에서 selectedBuildingId를 제거합니다.
  // 이 로직은 이제 buildings 배열 자체가 변경될 때만 실행됩니다.
  useEffect(() => {
    if (buildings && buildings.length > 0) {
      // 현재 선택된 건물이 전체 목록에 여전히 존재하는지 확인합니다.
      const currentBuildingExists = buildings.some(b => b.id === selectedBuildingId);
      // 만약 선택된 건물이 없거나, 더 이상 목록에 존재하지 않는다면 첫 번째 건물로 리셋합니다.
      if (!selectedBuildingId || !currentBuildingExists) {
        setSelectedBuildingId(buildings[0].id);
        setSelectedFloor(1); // 건물이 바뀌면 1층으로 리셋
      }
    } else {
        // 건물이 없으면 선택도 초기화합니다.
        setSelectedBuildingId(null);
    }
    // 의존성 배열에서 selectedBuildingId 제거
  }, [buildings]);

  const selectedBuilding = useMemo(() => 
    buildings.find(b => b.id === selectedBuildingId), 
    [buildings, selectedBuildingId]
  );

  const handleFloorChange = (floor: number) => {
    setSelectedFloor(floor);
  };
  
  // (나머지 코드는 이전과 동일)
  const currentFloorInfo = useMemo(() => 
    selectedBuilding?.floors.find(f => f.level === selectedFloor), 
    [selectedBuilding, selectedFloor]
  );

  const unitsOnCurrentFloor = useMemo(() => 
    selectedBuilding?.units.filter(unit => unit.floor === selectedFloor) || [], 
    [selectedBuilding, selectedFloor]
  );

  if (!buildings || buildings.length === 0) {
    return (
      <div className="bg-white rounded-5xl p-6 md:p-10 shadow-sm border border-gray-50">
        <h3 className="text-2xl font-bold mb-6">층별 평면도</h3>
        <div className="text-center py-10 text-gray-500">
          <p>등록된 건물 정보가 없습니다.</p>
          <p className="text-sm text-gray-400 mt-2">데이터베이스 시딩 스크립트를 실행해주세요.</p>
        </div>
      </div>
    );
  }
  
  if (!selectedBuilding) {
    return (
        <div className="bg-white rounded-5xl p-6 md:p-10 shadow-sm border border-gray-50">
            <h3 className="text-2xl font-bold mb-6">층별 평면도</h3>
            <div className="text-center py-10 text-gray-500">건물 정보를 불러오는 중입니다...</div>
        </div>
    );
  }

  return (
    <div className="bg-white rounded-5xl p-6 md:p-10 shadow-sm border border-gray-50">
      <h3 className="text-2xl font-bold mb-6">층별 평면도</h3>
      <FloorPlanControls
        floors={selectedBuilding.floors.map(f => f.level)}
        selectedFloor={selectedFloor}
        onFloorChange={handleFloorChange}
      />
      {
        currentFloorInfo ? (
          <FloorPlan 
            imageUrl={currentFloorInfo.floor_plan_url}
            units={unitsOnCurrentFloor}
          />
        ) : (
          <div className="text-center py-10">선택된 층의 평면도 정보가 없습니다.</div>
        )
      }
    </div>
  );
};

export default FloorPlanBrowser;