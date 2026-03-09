
// src/features/lease/FloorPlanDrafter.tsx

import React, { useState, useRef, MouseEvent, useMemo } from 'react';
import { Point, EditableUnitLayout, EditableFloorLayout } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from "@/components/ui/use-toast";

// [핵심 수정] 올바른 경로에서 이미지 파일을 임포트합니다.
import floor1F from '@/assets/1F.png';
import floor2F from '@/assets/2F.png';
import floor3F from '@/assets/3F.png';

// [핵심 수정] 임포트한 이미지 변수를 사용하도록 수정합니다.
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
    const svgPoint = svgRef.current.createSVGPoint();
    svgPoint.x = event.clientX;
    svgPoint.y = event.clientY;
    const transformedPoint = svgPoint.matrixTransform(svgRef.current.getScreenCTM()?.inverse());
    setCurrentPoints(prev => [...prev, { x: transformedPoint.x, y: transformedPoint.y }]);
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

  return (
    <div>
      {/* 컨트롤 패널 */}
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
      
      {/* 도면 컨테이너 */}
      <div className="relative w-full h-auto border rounded-md overflow-hidden" style={{ aspectRatio: '1200 / 900' }}>
        <img src={floorImageUrls[selectedFloor]} alt={`${selectedFloor} 도면`} className="absolute top-0 left-0 w-full h-full object-cover" />
        <svg ref={svgRef} className="absolute top-0 left-0 w-full h-full" viewBox="0 0 1200 900" preserveAspectRatio="xMidYMid meet" onClick={handleSvgClick}>
          {/* 저장된 폴리곤들 표시 */}
          {drawnUnitsOnCurrentFloor.map(unit => (
            <polygon key={unit.id} points={unit.points.map(p => `${p.x},${p.y}`).join(' ')} fill="rgba(255, 193, 7, 0.4)" stroke="rgba(255, 152, 0, 1)" strokeWidth="2" />
          ))}

          {/* 현재 그리는 폴리곤 표시 */}
          <polygon points={currentPoints.map(p => `${p.x},${p.y}`).join(' ')} fill={status === 'finished' ? "rgba(76, 175, 80, 0.5)" : "rgba(59, 130, 246, 0.3)"} stroke={status === 'finished' ? "#4CAF50" : "#3B82F6"} strokeWidth="2" />
          {currentPoints.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r="5" fill="#3B82F6" stroke="white" strokeWidth="1.5" />)}
        </svg>
      </div>
    </div>
  );
};

export default FloorPlanDrafter;
