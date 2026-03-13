
import React, { useState, useRef } from 'react';
import { TenantUnit } from '../../types';

interface FloorPlanProps {
  units: TenantUnit[];
  onUnitSelect: (unitId: string) => void;
  selectedUnitId: string | null;
  floorPlanImage: string;
}

const getStatusColor = (status: TenantUnit['status']) => {
    switch (status) {
        case '입주': return 'rgba(74, 222, 128, 0.6)';   // Green-400
        case '공실': return 'rgba(248, 113, 113, 0.6)';   // Red-400
        case '협의중': return 'rgba(251, 191, 36, 0.6)'; // Amber-400
        case '비임대': return 'rgba(156, 163, 175, 0.6)'; // Gray-400
        default: return 'rgba(156, 163, 175, 0.5)';
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
