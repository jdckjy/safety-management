
// src/features/lease/FloorPlanViewer.tsx

import React from 'react';
import { EditableFloorLayout, Point } from '../../types';

interface FloorPlanViewerProps {
  floorLayouts: EditableFloorLayout[]; // 편집 가능한 전체 층의 레이아웃 데이터
  selectedFloor: string; // 현재 선택된 층 (예: "1층", "2층")
  onUnitClick?: (unitId: string) => void; // 유닛 클릭 시 실행될 콜백 함수
  selectedUnitId?: string; // 현재 선택된 유닛의 ID
}

// Point 배열을 SVG polygon의 points 문자열로 변환하는 헬퍼 함수
const pointsToString = (points: Point[]): string => {
  return points.map(p => `${p.x},${p.y}`).join(' ');
};

const FloorPlanViewer: React.FC<FloorPlanViewerProps> = ({ 
  floorLayouts,
  selectedFloor,
  onUnitClick,
  selectedUnitId,
}) => {
  // 선택된 층에 해당하는 레이아웃 찾기
  const currentFloorLayout = floorLayouts.find(f => f.floor === selectedFloor);

  if (!currentFloorLayout) {
    return <div>선택된 층의 도면 정보가 없습니다.</div>;
  }

  return (
    <svg 
      width="100%" 
      height="100%" 
      viewBox="0 0 1200 1000" // SVG 내부 좌표계 설정 (캔버스 크기)
      preserveAspectRatio="xMidYMid meet"
      style={{ border: '1px solid #ccc' }}
    >
      <g>
        {currentFloorLayout.layout.map(unit => (
          <polygon
            key={unit.id}
            points={pointsToString(unit.points)}
            fill={selectedUnitId === unit.id ? '#ffcc00' : '#e9ecef'} // 선택된 유닛은 노란색으로 강조
            stroke="#495057"
            strokeWidth="2"
            onClick={() => onUnitClick && onUnitClick(unit.id)}
            style={{ cursor: onUnitClick ? 'pointer' : 'default' }}
          />
        ))}
      </g>
    </svg>
  );
};

export default FloorPlanViewer;
