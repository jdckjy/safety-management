
// src/features/lease/FloorPlanDrafter.tsx

import React, { useState, useRef, MouseEvent, useMemo } from 'react';
import { Point, EditableUnitLayout, EditableFloorLayout } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from "@/components/ui/use-toast";

import floor1F from '@/assets/1F.png';
import floor2F from '@/assets/2F.png';
import floor3F from '@/assets/3F.png';

const floorImageUrls: { [key: string]: string } = {
  '1층': floor1F,
  '2층': floor2F,
  '3층': floor3F,
};

type DrawingStatus = 'idle' | 'drawing' | 'finished';

const FloorPlanDrafter: React.FC = () => {
  const [floorLayouts, setFloorLayouts] = useState<EditableFloorLayout[]>([]);
  const [selectedFloor, setSelectedFloor] = useState('1층');
  const [currentPoints, setCurrentPoints] = useState<Point[]>([]);
  const [unitId, setUnitId] = useState('');
  const [status, setStatus] = useState<DrawingStatus>('idle');

  const svgRef = useRef<SVGSVGElement>(null);
  const { toast } = useToast();

  const drawnUnitsOnCurrentFloor = useMemo(() => {
    return floorLayouts.find(f => f.floor === selectedFloor)?.layout || [];
  }, [floorLayouts, selectedFloor]);

  const handleFloorChange = (floor: string) => {
    setSelectedFloor(floor);
    setStatus('idle');
    setCurrentPoints([]);
    setUnitId('');
  };

  const handleStartDrawing = () => {
    if (!unitId) {
      toast({ title: "오류", description: "저장할 유닛의 ID를 먼저 입력해주세요.", variant: "destructive" });
      return;
    }
    if (drawnUnitsOnCurrentFloor.some(u => u.id === unitId)) {
      toast({ title: "오류", description: `이미 존재하는 유닛 ID입니다: ${unitId}`, variant: "destructive" });
      return;
    }
    setStatus('drawing');
    setCurrentPoints([]);
  };

  const handleSvgClick = (event: MouseEvent<SVGSVGElement>) => {
    if (status !== 'drawing' || !svgRef.current) return;

    const svg = svgRef.current;
    const svgBounds = svg.getBoundingClientRect();

    if (svgBounds.width === 0 || svgBounds.height === 0) {
      toast({ title: "오류", description: "도면 정보를 읽는 데 실패했습니다. 다시 시도해주세요.", variant: "destructive" });
      return;
    }

    // [최종 수정] 가장 안정적인 방법으로 viewBox 속성을 직접 파싱합니다.
    const viewBoxAttr = svg.getAttribute('viewBox');
    if (!viewBoxAttr) {
        toast({ title: "오류", description: "SVG 좌표계 정보를 찾을 수 없습니다.", variant: "destructive" });
        return;
    }
    const viewBoxParts = viewBoxAttr.split(' ').map(Number);
    const viewBox = { x: viewBoxParts[0], y: viewBoxParts[1], width: viewBoxParts[2], height: viewBoxParts[3] };

    if (viewBoxParts.some(isNaN) || viewBox.width === 0 || viewBox.height === 0) {
        toast({ title: "오류", description: "SVG 좌표계가 올바르지 않습니다.", variant: "destructive" });
        return;
    }

    const relativeX = event.clientX - svgBounds.left;
    const relativeY = event.clientY - svgBounds.top;

    const scaleX = viewBox.width / svgBounds.width;
    const scaleY = viewBox.height / svgBounds.height;

    const svgX = Math.round(relativeX * scaleX + viewBox.x);
    const svgY = Math.round(relativeY * scaleY + viewBox.y);

    if (isNaN(svgX) || isNaN(svgY)) {
      console.error("FATAL: NaN coordinate detected after all guards.");
      toast({ title: "치명적 오류", description: "좌표 계산 중 예상치 못한 오류가 발생했습니다. 페이지를 새로고침해주세요.", variant: "destructive" });
      return;
    }

    setCurrentPoints(prev => [...prev, { x: svgX, y: svgY }]);
  };

  const handleFinishDrawing = () => {
    if (currentPoints.length < 3) {
      toast({ title: "오류", description: "폴리곤을 그리려면 최소 3개 이상의 점이 필요합니다.", variant: "destructive" });
      return;
    }
    setStatus('finished');
  };

  const handleUndo = () => {
    setCurrentPoints(prev => prev.slice(0, -1));
  };

  const handleSaveUnit = () => {
    const newUnit: EditableUnitLayout = { id: unitId, points: currentPoints };

    setFloorLayouts(prevLayouts => {
      const existingFloor = prevLayouts.find(f => f.floor === selectedFloor);
      if (existingFloor) {
        return prevLayouts.map(f => 
          f.floor === selectedFloor 
            ? { ...f, layout: [...f.layout, newUnit] } 
            : f
        );
      } else {
        return [...prevLayouts, { floor: selectedFloor, layout: [newUnit] }];
      }
    });

    toast({ title: "저장 완료", description: `유닛 [${unitId}]이(가) ${selectedFloor}에 저장되었습니다.` });
    setStatus('idle');
    setCurrentPoints([]);
    setUnitId(''); 
  };

  const handleExport = () => {
    const exportData = JSON.stringify(floorLayouts, null, 2);
    navigator.clipboard.writeText(`export const editableFloorPlanLayouts: EditableFloorLayout[] = ${exportData};`);
    toast({ title: "데이터 복사됨", description: "생성된 좌표 데이터가 클립보드에 복사되었습니다." });
    console.log(exportData);
  };

  const getSanitizedPoints = (points: Point[]) => 
    points.filter(p => p && typeof p.x === 'number' && typeof p.y === 'number' && !isNaN(p.x) && !isNaN(p.y)).map(p => `${p.x},${p.y}`).join(' ');

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-4 border rounded-lg bg-gray-50">
        <div className="flex space-x-2 p-1 bg-gray-200 rounded-lg">
          {Object.keys(floorImageUrls).map(floor => (
            <Button key={floor} variant={selectedFloor === floor ? 'default' : 'ghost'} onClick={() => handleFloorChange(floor)} className="flex-1">{floor}</Button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Input placeholder="유닛 ID 입력 (예: MSC-1F-05)" value={unitId} onChange={e => setUnitId(e.target.value)} disabled={status !== 'idle'} />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {status === 'idle' && <Button onClick={handleStartDrawing} className="flex-grow">새 유닛 그리기</Button>}
          {status === 'drawing' && <Button onClick={handleFinishDrawing} variant="secondary" className="flex-grow">그리기 완료</Button>}
          {status === 'finished' && <Button onClick={handleSaveUnit} variant="default" className="flex-grow">이 유닛 저장</Button>}
          <Button onClick={handleUndo} disabled={currentPoints.length === 0 || status !== 'drawing'}>되돌리기</Button>
          <Button onClick={handleExport} disabled={floorLayouts.length === 0}>데이터 복사</Button>
        </div>
      </div>
      
      <div className="relative w-full h-auto border rounded-md overflow-hidden" style={{ aspectRatio: '1200 / 900' }}>
        <img src={floorImageUrls[selectedFloor]} alt={`${selectedFloor} 도면`} className="absolute top-0 left-0 w-full h-full object-cover" />
        <svg ref={svgRef} className="absolute top-0 left-0 w-full h-full" viewBox="0 0 1200 900" preserveAspectRatio="xMidYMid meet" onClick={handleSvgClick}>
          {drawnUnitsOnCurrentFloor.map(unit => (
            <polygon key={unit.id} points={getSanitizedPoints(unit.points)} fill="rgba(255, 193, 7, 0.4)" stroke="rgba(255, 152, 0, 1)" strokeWidth="2" />
          ))}

          <polygon points={getSanitizedPoints(currentPoints)} fill={status === 'finished' ? "rgba(76, 175, 80, 0.5)" : "rgba(59, 130, 246, 0.3)"} stroke={status === 'finished' ? "#4CAF50" : "#3B82F6"} strokeWidth="2" />
          {currentPoints.map((p, i) => 
            p && typeof p.x === 'number' && typeof p.y === 'number' && !isNaN(p.x) && !isNaN(p.y) && <circle key={i} cx={p.x} cy={p.y} r="5" fill="#3B82F6" stroke="white" strokeWidth="1.5" />
          )}
        </svg>
      </div>
    </div>
  );
};

export default FloorPlanDrafter;
