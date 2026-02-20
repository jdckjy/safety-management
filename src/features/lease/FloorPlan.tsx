
import React from 'react';
import { Unit } from '@/types';

interface FloorPlanProps {
  imageUrl: string;
  units: Unit[];
}

const FloorPlan: React.FC<FloorPlanProps> = ({ imageUrl, units }) => {

  const getStatusColor = (status: 'occupied' | 'vacant') => {
    return status === 'occupied' ? 'bg-red-500' : 'bg-green-500';
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      <img src={imageUrl} alt="Floor plan" className="w-full h-auto rounded-lg" />
      <div className="absolute top-0 left-0 w-full h-full">
        {units.map(unit => (
          <div 
            key={unit.id}
            className={`absolute w-10 h-10 ${getStatusColor(unit.status)} rounded-full flex items-center justify-center text-white font-bold text-xs`}
            style={{ 
              left: `${unit.position_x}%`,
              top: `${unit.position_y}%`,
            }}
            title={`${unit.tenant_name || '공실'} (${unit.area_sqm} sqm)`}
          >
            {unit.id.slice(-2)}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FloorPlan;
