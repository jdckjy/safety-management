
import React, { useState, useEffect, useRef } from 'react';
import { select } from 'd3-selection';
import { drag } from 'd3-drag';
import { TenantUnit, EditableUnitLayout, Point } from '../../types';

interface FloorPlanProps {
  units: TenantUnit[];
  onUnitSelect: (unitId: string) => void;
  selectedUnitId: string | null;
  backgroundUrl: string;
  onUnitCreate: (newUnit: EditableUnitLayout) => void;
  selectedFloor: string;
  layout: EditableUnitLayout[];
  setLayout: (newLayout: EditableUnitLayout[]) => void;
}

export const FloorPlan: React.FC<FloorPlanProps> = ({ 
  units, onUnitSelect, selectedUnitId, backgroundUrl, onUnitCreate, selectedFloor, 
  layout, 
  setLayout 
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isCreationMode, setIsCreationMode] = useState(false);
  const [newPolygonPoints, setNewPolygonPoints] = useState<Point[]>([]);

  useEffect(() => {
    if (!isEditMode || !svgRef.current) return;
    const svg = select(svgRef.current);
    const handleDrag = drag<SVGCircleElement, unknown>()
      .on('drag', function(event) {
        const [polygonIndex, vertexIndex] = this.id.split('-').map(Number);
        const newLayout = JSON.parse(JSON.stringify(layout));
        newLayout[polygonIndex].points[vertexIndex] = { x: event.x, y: event.y };
        setLayout(newLayout);
      });
    svg.selectAll('.vertex-handle').call(handleDrag as any);
  }, [isEditMode, layout, setLayout]);

  const handleEditModeChange = (checked: boolean) => {
    setIsEditMode(checked);
    if (checked) {
      setIsCreationMode(false);
      setNewPolygonPoints([]);
    }
  };

  const handleCreationModeChange = (checked: boolean) => {
    setIsCreationMode(checked);
    if (checked) {
      setIsEditMode(false);
    }
  };

  const handleSvgClick = (event: React.MouseEvent<SVGSVGElement>) => {
    if (!isCreationMode || !svgRef.current) return;
    const svg = svgRef.current;
    const pt = svg.createSVGPoint();
    pt.x = event.clientX;
    pt.y = event.clientY;
    const svgPoint = pt.matrixTransform(svg.getScreenCTM()?.inverse());
    setNewPolygonPoints(prev => [...prev, { x: svgPoint.x, y: svgPoint.y }]);
  };

  const handleSaveNewPolygon = () => {
    if (newPolygonPoints.length < 3) {
      alert('폴리곤은 최소 3개 이상의 점이 필요합니다.');
      return;
    }
    const newUnitId = `NEW-${selectedFloor}-${Date.now()}`;
    const newPolygon: EditableUnitLayout = {
      id: newUnitId,
      points: newPolygonPoints,
    };

    setLayout([...layout, newPolygon]);
    
    // [원상 복구] 상세 정보 패널 업데이트 기능을 다시 활성화합니다.
    onUnitCreate(newPolygon); 

    setNewPolygonPoints([]);
    setIsCreationMode(false);
  };
  
  const handleCancelDrawing = () => {
    setNewPolygonPoints([]);
    setIsCreationMode(false);
  };

  const getUnitStatusColor = (unitId: string) => {
    const unit = units.find(u => u.id === unitId);
    if (!unit) return '#8A2BE2';
    return unit.status === '임대' ? '#FFD700' : '#DC143C';
  };

  const handleExport = () => {
    console.log(JSON.stringify({ floor: selectedFloor, layout: layout }, null, 2));
    alert('현재 층의 좌표 데이터가 콘솔에 출력되었습니다.');
  };

  const pointsToString = (points: Point[]) => points.map(p => `${p.x},${p.y}`).join(' ');

  return (
    <div className="relative w-full h-full isolate">
       <div className="absolute top-4 right-4 z-50 flex flex-col items-end space-y-2">
        <div className="flex items-center space-x-4 bg-gray-800/80 backdrop-blur-sm text-white p-3 rounded-xl shadow-lg">
          <label className="flex items-center cursor-pointer select-none">
            <span className="mr-2 font-bold text-sm tracking-wider">EDIT</span>
            <input type="checkbox" checked={isEditMode} onChange={e => handleEditModeChange(e.target.checked)} className="form-checkbox h-5 w-5"/>
          </label>
          <label className="flex items-center cursor-pointer select-none">
            <span className="mr-2 font-bold text-sm tracking-wider">CREATE</span>
            <input type="checkbox" checked={isCreationMode} onChange={e => handleCreationModeChange(e.target.checked)} className="form-checkbox h-5 w-5"/>
          </label>
        </div>
        {isCreationMode && (
          <div className="bg-blue-900/80 text-white p-3 rounded-lg shadow-lg text-sm">
            <p className='mb-2'>도면을 클릭하여 폴리곤을 그리세요.</p>
            {newPolygonPoints.length > 0 && (
                <div className="flex space-x-2">
                    <button onClick={handleSaveNewPolygon} className="px-3 py-1 bg-green-600 rounded-md">Save</button>
                    <button onClick={handleCancelDrawing} className="px-3 py-1 bg-red-600 rounded-md">Cancel</button>
                </div>
            )}
          </div>
        )}
        {isEditMode && <button onClick={handleExport} className="px-4 py-2 bg-indigo-600 text-white rounded-md shadow-lg">Export</button>}
      </div>

      <svg ref={svgRef} onClick={handleSvgClick} className="absolute top-0 left-0 w-full h-full" viewBox="0 0 1000 880">
        <image href={backgroundUrl} width="1000" height="880" />
        {layout.map((poly, polygonIndex) => (
          <g key={poly.id}>
            <polygon
              points={pointsToString(poly.points)}
              fill={getUnitStatusColor(poly.id)}
              fillOpacity={0.5}
              stroke={selectedUnitId === poly.id ? '#00FFFF' : '#FFFFFF'}
              strokeWidth={selectedUnitId === poly.id ? 4 : 2}
              onClick={(e) => { if (!isCreationMode) { e.stopPropagation(); onUnitSelect(poly.id); } }}
              className="cursor-pointer transition-all"
            />
            {isEditMode && poly.points.map((point, vertexIndex) => (
              <circle
                key={`${polygonIndex}-${vertexIndex}`}
                id={`${polygonIndex}-${vertexIndex}`}
                className="vertex-handle"
                cx={point.x} cy={point.y} r={8} fill="#007BFF"
              />
            ))}
          </g>
        ))}
        {isCreationMode && newPolygonPoints.length > 0 && (
          <g>
            <polyline points={pointsToString(newPolygonPoints)} fill="none" stroke="#00FF00" strokeWidth="3" strokeDasharray="5,5" />
            {newPolygonPoints.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r="6" fill="#00FF00" />)}
            {newPolygonPoints.length > 1 && <line x1={newPolygonPoints[newPolygonPoints.length-1].x} y1={newPolygonPoints[newPolygonPoints.length-1].y} x2={newPolygonPoints[0].x} y2={newPolygonPoints[0].y} stroke="#00FF00" strokeWidth="2" strokeDasharray="3,3"/>}
          </g>
        )}
      </svg>
    </div>
  );
};
