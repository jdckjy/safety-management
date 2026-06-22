import React, { useState } from 'react';
import { EnrichedUnit, Unit } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface InteractiveFloorPlanProps {
  units: EnrichedUnit[];
  simulatedOccupiedIds: Set<string>;
  simulatedVacantIds: Set<string>;
  onUnitClick: (unit: Unit) => void;
  className?: string;
}

const getUnitStyle = (unit: Unit, simulatedOccupiedIds: Set<string>, simulatedVacantIds: Set<string>): string => {
  if (simulatedOccupiedIds.has(unit.id)) {
    return 'bg-blue-500 text-white ring-4 ring-offset-1 ring-blue-500'; // Sim-occupied
  }
  if (simulatedVacantIds.has(unit.id)) {
    return 'bg-amber-400 text-white ring-4 ring-offset-1 ring-amber-400'; // Sim-vacant
  }

  switch (unit.status) {
    case 'occupied':
      return 'bg-[#1A4F95] text-white'; // Leased
    case 'vacant':
      return 'bg-slate-200 text-slate-700'; // Vacant
    case 'notice':
      return 'bg-red-500 text-white'; // Notice
    default:
      return 'bg-slate-100 text-slate-800';
  }
};

const LegendItem: React.FC<{ color: string; label: string }> = ({ color, label }) => (
    <div className="flex items-center gap-2">
        <div className={`w-4 h-4 rounded-sm ${color}`}></div>
        <span className="text-xs text-slate-600">{label}</span>
    </div>
);

const InteractiveFloorPlan: React.FC<InteractiveFloorPlanProps> = ({
  units,
  simulatedOccupiedIds,
  simulatedVacantIds,
  onUnitClick,
  className,
}) => {
  const floors = [...new Set(units.map(u => u.floor))].sort((a, b) => parseInt(a) - parseInt(b));
  const [currentFloor, setCurrentFloor] = useState(floors[0] || '1');

  const unitsByFloor = units.filter(unit => unit.floor === currentFloor);
  const maxArea = Math.max(...unitsByFloor.map(u => u.area_sqm), 1);

  return (
    <Card className={`shadow-sm flex flex-col ${className}`}>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl font-bold text-slate-800">도면 시뮬레이션 ({currentFloor}F)</CardTitle>
          <div className="flex space-x-1">
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
      <CardContent className="flex-1 flex flex-col justify-center bg-slate-50/30 p-4 space-y-4">
        <div className="text-center text-xs text-slate-400 font-medium tracking-widest">CENTRAL CORRIDOR</div>
        <TooltipProvider delayDuration={200}>
          <div className="flex flex-wrap items-center gap-2 justify-center">
            {unitsByFloor.map(unit => {
                const width = 80 + (unit.area_sqm / maxArea) * 80; 
                const tenantName = unit.tenant ? unit.tenant.companyName || unit.tenant.businessName : '공실';
                
                return (
                  <Tooltip key={unit.id}>
                    <TooltipTrigger asChild>
                      <div
                        onClick={() => onUnitClick(unit)}
                        style={{ width: `${width}px` }}
                        className={`rounded-md cursor-pointer transition-transform duration-200 hover:-translate-y-1 p-3 shadow-sm ${getUnitStyle(unit, simulatedOccupiedIds, simulatedVacantIds)}`}
                      >
                        <div className="font-bold text-sm truncate">{tenantName}</div>
                        <div className="text-xs opacity-80 truncate">{unit.name} | {unit.area_sqm.toFixed(1)} ㎡</div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="bg-slate-800 text-white border-slate-800">
                        <p className="font-bold">{tenantName} ({unit.name})</p>
                        <p>면적: {unit.area_sqm.toFixed(1)} ㎡</p>
                        <p>상태: {unit.status}</p>
                        {unit.tenant && <p>업종: {unit.tenant.industry}</p>}
                    </TooltipContent>
                  </Tooltip>
                )
            })}
          </div>
        </TooltipProvider>
        <div className="text-center text-xs text-slate-400 font-medium tracking-widest">ENTRANCE / LOBBY</div>
        
        <div className="flex justify-center items-center flex-wrap gap-x-4 gap-y-2 pt-4">
            <LegendItem color="bg-slate-200" label="공실" />
            <LegendItem color="bg-[#1A4F95]" label="임대" />
            <LegendItem color="bg-red-500" label="임대만료예정" />
            <LegendItem color="bg-blue-500" label="시뮬레이션 (입주)" />
            <LegendItem color="bg-amber-400" label="시뮬레이션 (퇴거)" />
        </div>
      </CardContent>
    </Card>
  );
};

export default InteractiveFloorPlan;
