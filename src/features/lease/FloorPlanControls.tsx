
import React from 'react';

interface FloorPlanControlsProps {
  floors: number[];
  selectedFloor: number;
  onFloorChange: (floor: number) => void;
}

const FloorPlanControls: React.FC<FloorPlanControlsProps> = ({ floors, selectedFloor, onFloorChange }) => {
  const baseStyle = "px-4 py-2 rounded-md font-semibold text-sm transition-colors";
  const activeStyle = "bg-blue-600 text-white";
  const inactiveStyle = "bg-gray-200 text-gray-700 hover:bg-gray-300";

  return (
    <div className="flex items-center justify-center space-x-2 mb-6">
      {floors.map(floor => (
        <button
          key={floor}
          onClick={() => onFloorChange(floor)}
          className={`${baseStyle} ${selectedFloor === floor ? activeStyle : inactiveStyle}`}
        >
          {floor}층
        </button>
      ))}
    </div>
  );
};

export default FloorPlanControls;
