import React, { useState } from 'react';
import { EnrichedUnit, Unit } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface InteractiveFloorPlanProps {
  units: EnrichedUnit[];
  simulatedOccupiedIds: Set<string>;
  simulatedVacantIds: Set<string>;
  onUnitClick: (unit: Unit) => void;
}

const getStatusBorderColor = (unit: Unit, simulatedOccupiedIds: Set<string>, simulatedVacantIds: Set<string>): string => {
  if (simulatedOccupiedIds.has(unit.id)) {
    return 'border-l-4 border-l-blue-500'; // Newly occupied in simulation
  }
  if (simulatedVacantIds.has(unit.id)) {
    return 'border-l-4 border-l-yellow-500'; // Newly vacant in simulation
  }

  switch (unit.status) {
    case 'occupied':
      return 'border-l-4 border-l-slate-600'; // Originally occupied
    case 'vacant':
      return 'border-l-4 border-l-slate-300'; // Originally vacant
    case 'notice':
      return 'border-l-4 border-l-red-500'; // Originally notice
    default:
      return 'border-l-4 border-l-gray-200';
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

  const maxArea = Math.max(...unitsByFloor.map(u => u.area_sqm), 1);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-bold text-slate-800">도면 시뮬레이션 ({currentFloor}F)</CardTitle>
          <div className="flex space-x-2">
            {floors.map(floor => (
              <Button
                key={floor}
                size="sm"
                variant={currentFloor === floor ? 'secondary' : 'outline'}
                onClick={() => setCurrentFloor(floor)}
                className="font-sans"
              >
                {floor}F
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <div className="p-4 bg-slate-50/80 rounded-lg flex-1 flex flex-col justify-center">
           <div className="text-center text-xs text-slate-400 mb-4">CENTRAL CORRIDOR</div>
           <div className="flex flex-wrap items-start gap-2 justify-center">
            {unitsByFloor.map(unit => {
                const width = 80 + (unit.area_sqm / maxArea) * 80; 
                const tenantName = unit.tenant ? unit.tenant.companyName || unit.tenant.businessName : '공실';
                return (
                  <div
                    key={unit.id}
                    onClick={() => onUnitClick(unit)}
                    style={{ width: `${width}px` }}
                    className={`bg-white rounded-md cursor-pointer transition-all duration-200 hover:shadow-xl hover:scale-105 shadow-md ${getStatusBorderColor(
                      unit,
                      simulatedOccupiedIds,
                      simulatedVacantIds
                    )}`}
                  >
                    <div className="p-3">
                        <div className="font-bold text-slate-700 text-sm truncate">{tenantName}</div>
                        <div className="text-xs text-slate-500 truncate">{unit.name} | {unit.area_sqm.toFixed(1)} ㎡</div>
                    </div>
                  </div>
                )
            })}
          </div>
           <div className="text-center text-xs text-slate-400 mt-4">ENTRANCE / LOBBY</div>
             <div className="flex justify-center items-center space-x-4 text-xs mt-6">
                 <div className="flex items-center"><span className="w-3 h-1.5 rounded-full bg-slate-300 mr-1.5"></span>공실</div>
                <div className="flex items-center"><span className="w-3 h-1.5 rounded-full bg-slate-600 mr-1.5"></span>임대</div>
                <div className="flex items-center"><span className="w-3 h-1.5 rounded-full bg-red-500 mr-1.5"></span>임대만료예정</div>
                <div className="flex items-center"><span className="w-3 h-1.5 rounded-full bg-blue-500 mr-1.5"></span>시뮬레이션(입주)</div>
                <div className="flex items-center"><span className="w-3 h-1.5 rounded-full bg-yellow-500 mr-1.5"></span>시뮬레이션(퇴거)</div>
            </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default InteractiveFloorPlan;
