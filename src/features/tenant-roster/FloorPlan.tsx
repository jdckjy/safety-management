import React, { useState, useRef } from 'react';
import { EnrichedUnit } from './TenantRoster'; // EnrichedUnit 타입을 import 합니다.

interface FloorPlanProps {
  units: EnrichedUnit[]; // props 타입을 EnrichedUnit으로 변경합니다.
  onUnitSelect: (unitId: string) => void;
  selectedUnitId: string | null;
  floorPlanImage: string;
}

// 새로운 status ('OCCUPIED', 'VACANT')에 맞게 함수를 단순화합니다.
const getStatusColor = (status: EnrichedUnit['status']) => {
    switch (status) {
        case 'OCCUPIED': return 'rgba(74, 222, 128, 0.6)';   // Green-400 (계약)
        case 'VACANT': return 'rgba(248, 113, 113, 0.6)';   // Red-400 (공실)
        default: return 'rgba(156, 163, 175, 0.5)'; // 기본 회색
    }
};

const FloorPlan: React.FC<FloorPlanProps> = ({ units, onUnitSelect, selectedUnitId, floorPlanImage }) => {
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  const svgRef = useRef<SVGSVGElement>(null);

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth, naturalHeight } = e.currentTarget;
    setImageDimensions({ width: naturalWidth, height: naturalHeight });
  };

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <img 
        src={floorPlanImage} 
        alt="Floor plan" 
        onLoad={handleImageLoad} 
        style={{ width: '100%' }}
      />
      <svg 
        ref={svgRef}
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
        viewBox={`0 0 ${imageDimensions.width || 1000} ${imageDimensions.height || 700}`}>
        {
          units.map(unit => {
            const isSelected = unit.id === selectedUnitId;
            const color = getStatusColor(unit.status);

            return (
              <path
                key={unit.id}
                d={unit.pathData || ''}
                fill={isSelected ? 'rgba(255, 165, 0, 0.7)' : color}
                stroke={isSelected ? '#FFA500' : '#a0aec0'}
                strokeWidth={isSelected ? 3 : 1}
                onClick={() => onUnitSelect(unit.id)}
                style={{ cursor: 'pointer', transition: 'fill 0.2s' }}
              />
            )
          })
        }
      </svg>
    </div>
  );
};

export default FloorPlan;
