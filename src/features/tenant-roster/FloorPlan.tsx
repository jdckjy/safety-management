
import React, { useState, useRef, useEffect } from 'react';
import { TenantUnit } from '../../types';

interface FloorPlanProps {
  units: TenantUnit[];
  onUnitSelect: (unitId: string) => void;
  selectedUnitId: string | null;
  floorPlanImage: string;
}

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
            return (
              <path
                key={unit.id}
                d={unit.pathData || ''}
                fill={isSelected ? 'rgba(255, 165, 0, 0.5)' : 'rgba(0, 123, 255, 0.5)'}
                stroke={isSelected ? '#FFA500' : '#007BFF'}
                strokeWidth={isSelected ? 2 : 1}
                onClick={() => onUnitSelect(unit.id)}
                style={{ cursor: 'pointer' }}
              />
            )
          })
        }
      </svg>
    </div>
  );
};

export default FloorPlan;
