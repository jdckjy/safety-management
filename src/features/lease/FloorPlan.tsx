
import React, { useState } from 'react';
import { EnrichedUnit } from '../../types';

interface FloorPlanProps {
  imageUrl: string;
  units: EnrichedUnit[];
  selectedUnitId: string | null;
  onUnitSelect: (unitId: string) => void;
  currentFloor: number;
}

const statusColors: { [key: string]: { bg: string; text: string } } = {
  occupied: { bg: 'rgba(255, 0, 0, 0.4)', text: 'white' }, // Red for occupied
  vacant: { bg: 'rgba(0, 255, 0, 0.4)', text: 'black' },   // Green for vacant
  'under-renovation': { bg: 'rgba(128, 128, 128, 0.4)', text: 'white' }, // Gray for under-renovation
};

const FloorPlan: React.FC<FloorPlanProps> = ({ imageUrl, units, selectedUnitId, onUnitSelect, currentFloor }) => {
  const [tooltip, setTooltip] = useState<{ content: string; x: number; y: number } | null>(null);

  const handleMouseOver = (unit: EnrichedUnit, e: React.MouseEvent<SVGPathElement, MouseEvent>) => {
    const rect = (e.target as SVGPathElement).getBoundingClientRect();
    setTooltip({
      content: `${unit.name}: ${unit.tenant?.businessName || unit.status}`,
      x: rect.left + window.scrollX + rect.width / 2,
      y: rect.top + window.scrollY - 10,
    });
  };

  const handleMouseOut = () => {
    setTooltip(null);
  };

  return (
    <div className="relative w-full h-auto" style={{ minHeight: '500px' }}>
      <img src={imageUrl} alt={`Floor ${currentFloor}`} className="w-full h-auto" />
      <svg className="absolute top-0 left-0 w-full h-full" viewBox="0 0 1024 768">
        {units.map((unit) => {
          const colorInfo = statusColors[unit.status] || statusColors.vacant;
          return (
            <g key={unit.id}>
              <path
                d={unit.pathData}
                fill={selectedUnitId === unit.id ? 'rgba(255, 204, 0, 0.7)' : colorInfo.bg}
                stroke="#333"
                strokeWidth="2"
                onClick={() => onUnitSelect(unit.id)}
                onMouseOver={(e) => handleMouseOver(unit, e)}
                onMouseOut={handleMouseOut}
                className="cursor-pointer transition-all duration-200 hover:fill-yellow-400/80"
              />
              <text
                x={unit.position_x} 
                y={unit.position_y} 
                textAnchor="middle"
                dominantBaseline="middle"
                fill={colorInfo.text}
                fontSize="12"
                fontWeight="bold"
                pointerEvents="none"
              >
                {unit.name}
              </text>
            </g>
          );
        })}
      </svg>
      {tooltip && (
        <div 
          className="absolute bg-gray-800 text-white text-xs rounded py-1 px-2 pointer-events-none z-10 whitespace-nowrap"
          style={{ top: `${tooltip.y}px`, left: `${tooltip.x}px`, transform: 'translate(-50%, -100%)' }}
        >
          {tooltip.content}
        </div>
      )}
    </div>
  );
};

export default FloorPlan;
