import React, { useState } from 'react';
import { Unit } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface InteractiveFloorPlanProps {
  units: Unit[];
  simulatedOccupiedIds: Set<string>;
  simulatedVacantIds: Set<string>;
  onUnitClick: (unit: Unit) => void;
}

const getStatusColor = (unit: Unit, simulatedOccupiedIds: Set<string>, simulatedVacantIds: Set<string>): string => {
  if (simulatedOccupiedIds.has(unit.id)) {
    return 'bg-blue-400 text-white'; // Newly occupied in simulation
  }
  if (simulatedVacantIds.has(unit.id)) {
    return 'bg-yellow-400 text-slate-800'; // Newly vacant in simulation
  }

  switch (unit.status) {
    case 'occupied':
      return 'bg-slate-600 text-white'; // Originally occupied
    case 'vacant':
      return 'bg-slate-200 text-slate-700'; // Originally vacant
    case 'notice':
      return 'bg-red-500 text-white'; // Originally notice
    default:
      return 'bg-gray-300';
  }
};

const InteractiveFloorPlan: React.FC<InteractiveFloorPlanProps> = ({
  units,
  simulatedOccupiedIds,
  simulatedVacantIds,
  onUnitClick,
}) => {
  const floors = [...new Set(units.map(u => u.floor))].sort((a, b) => parseInt(a) - parseInt(b));
  const [currentFloor, setCurrentFloor] = useState(floors[0] || '1');

  const unitsByFloor = units.filter(unit => unit.floor === currentFloor);

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-base font-semibold text-slate-700">도면 기반 시뮬레이션</CardTitle>
          <div className="flex space-x-2">
            {floors.map(floor => (
              <Button
                key={floor}
                size="sm"
                variant={currentFloor === floor ? 'secondary' : 'ghost'}
                onClick={() => setCurrentFloor(floor)}
              >
                {floor}F
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="p-4 bg-slate-50 border-dashed border-2 border-slate-200 rounded-lg min-h-[400px]">
          <div className="text-center mb-4">
            <p className="text-sm text-slate-500">
              {currentFloor}층 도면 (실제 SVG 연동 시 시각화 예정)
            </p>
             <div className="flex justify-center items-center space-x-4 text-xs mt-2">
                <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-slate-200 mr-1.5"></span>공실</div>
                <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-slate-600 mr-1.5"></span>임대</div>
                <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-red-500 mr-1.5"></span>임대만료예정</div>
                <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-blue-400 mr-1.5"></span>시뮬레이션(입주)</div>
                <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-yellow-400 mr-1.5"></span>시뮬레이션(퇴거)</div>
            </div>
          </div>
          {/* SVG will be rendered here. For now, showing a list of clickable units as a placeholder */}
          <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
            {unitsByFloor.map(unit => (
              <div
                key={unit.id}
                onClick={() => onUnitClick(unit)}
                className={`p-2 rounded-md cursor-pointer text-xs text-center transition-all duration-200 hover:scale-105 shadow ${getStatusColor(
                  unit,
                  simulatedOccupiedIds,
                  simulatedVacantIds
                )}`}
              >
                <div className="font-bold">{unit.id}</div>
                <div className="text-xxs">{unit.area_sqm.toFixed(1)} ㎡</div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default InteractiveFloorPlan;
