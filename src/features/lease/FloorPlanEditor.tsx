
// src/features/lease/FloorPlanEditor.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { Stage, Layer, Line, Circle } from 'react-konva';
import { KonvaEventObject } from 'konva/lib/Node';
import { Undo2, Redo2 } from 'lucide-react';
import { Button } from '@/components/ui/button'; // <<< ADDED THIS LINE
import { EditableUnitLayout, Point } from '../../types';
import { calculatePolygonArea } from '../../utils/geometry';

// ====================================================================
// == useHistory Hook for Undo/Redo
// ====================================================================

const useHistory = <T,>(initialState: T) => {
  const [state, setState] = useState({
    past: [] as T[],
    present: initialState,
    future: [] as T[],
  });

  const canUndo = state.past.length > 0;
  const canRedo = state.future.length > 0;

  const undo = useCallback(() => {
    if (!canUndo) return;
    const { past, present, future } = state;
    const previous = past[past.length - 1];
    const newPast = past.slice(0, past.length - 1);
    setState({ past: newPast, present: previous, future: [present, ...future] });
  }, [canUndo, state]);

  const redo = useCallback(() => {
    if (!canRedo) return;
    const { past, present, future } = state;
    const next = future[0];
    const newFuture = future.slice(1);
    setState({ past: [...past, present], present: next, future: newFuture });
  }, [canRedo, state]);

  const set = useCallback((newState: T) => {
    const { present } = state;
    if (JSON.stringify(newState) === JSON.stringify(present)) return;
    setState({ past: [...state.past, present], present: newState, future: [] });
  }, [state]);

  const reset = useCallback((newState: T) => {
    setState({ past: [], present: newState, future: [] });
  }, []);

  return { state: state.present, set, undo, redo, canUndo, canRedo, reset };
};


// ====================================================================
// == Helper Components (Unchanged)
// ====================================================================

interface VertexCircleProps {
  point: Point;
  index: number;
  handleDragMove: (index: number, e: KonvaEventObject<DragEvent>) => void;
  handleDragEnd: () => void;
  handleRightClick: (index: number, e: KonvaEventObject<MouseEvent>) => void;
}

const VertexCircle: React.FC<VertexCircleProps> = ({ point, index, handleDragMove, handleDragEnd, handleRightClick }) => (
  <Circle
    x={point.x} y={point.y} radius={8} fill="#ffffff" stroke="#4a90e2" strokeWidth={2}
    draggable
    onDragMove={(e) => handleDragMove(index, e)}
    onDragEnd={handleDragEnd}
    onContextMenu={(e) => handleRightClick(index, e)}
  />
);

interface MidpointCircleProps {
  p1: Point; p2: Point; index: number;
  handleAddPoint: (index: number, newPoint: Point) => void;
}

const MidpointCircle: React.FC<MidpointCircleProps> = ({ p1, p2, index, handleAddPoint }) => {
  const midpoint = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
  return (
    <Circle
      x={midpoint.x} y={midpoint.y} radius={5} fill="#4ade80" opacity={0.6} hitStrokeWidth={12}
      onMouseEnter={e => e.target.getStage()!.container().style.cursor = 'crosshair'}
      onMouseLeave={e => e.target.getStage()!.container().style.cursor = 'default'}
      onClick={() => handleAddPoint(index, midpoint)}
    />
  );
};


// ====================================================================
// == Main FloorPlanEditor Component
// ====================================================================

interface FloorPlanEditorProps {
  unitLayout: EditableUnitLayout;
  initialArea: number;
  onSave: (newPoints: Point[], newArea: number) => void;
  onCancel: () => void;
}

const AREA_SCALE_FACTOR = 1 / 1000;

const FloorPlanEditor: React.FC<FloorPlanEditorProps> = ({ unitLayout, initialArea, onSave, onCancel }) => {
  const { state: points, set: setPoints, undo, redo, canUndo, canRedo, reset } = useHistory(unitLayout.points);
  const [currentArea, setCurrentArea] = useState<number>(initialArea);

  useEffect(() => reset(unitLayout.points), [unitLayout, reset]);

  useEffect(() => {
    const newArea = calculatePolygonArea(points, AREA_SCALE_FACTOR);
    setCurrentArea(newArea);
  }, [points]);
  
  const [isDragging, setIsDragging] = useState(false);
  const [tempPoints, setTempPoints] = useState(points);

  useEffect(() => {
      if(!isDragging) {
          setTempPoints(points)
      }
  }, [points, isDragging])


  const handleDragMove = (index: number, e: KonvaEventObject<DragEvent>) => {
    if(!isDragging) setIsDragging(true)
    const newPoints = [...tempPoints];
    newPoints[index] = { x: Math.round(e.target.x()), y: Math.round(e.target.y()) };
    setTempPoints(newPoints)
  };
  
  const handleDragEnd = () => {
      setIsDragging(false)
      setPoints(tempPoints)
  }

  const handleAddPoint = (index: number, newPoint: Point) => {
    const newPoints = [...points];
    newPoints.splice(index + 1, 0, newPoint);
    setPoints(newPoints);
  };

  const handleRightClick = (index: number, e: KonvaEventObject<MouseEvent>) => {
    e.evt.preventDefault();
    if (points.length > 3) {
      const newPoints = points.filter((_, i) => i !== index);
      setPoints(newPoints);
    }
  };
  
  const displayPoints = isDragging ? tempPoints : points
  const flatPoints = displayPoints.flatMap(p => [p.x, p.y]);

  return (
    <div>
      <div style={{ border: '1px solid #ccc', borderRadius: '8px', overflow: 'hidden' }}>
        <Stage width={800} height={600} viewBox="0 0 1200 1000" preserveAspectRatio="xMidYMid meet">
          <Layer>
            <Line points={flatPoints} stroke="#4a90e2" strokeWidth={3} closed={true} fill="#e9f2fa" />
            {displayPoints.map((point, index) => (
              <VertexCircle key={`v-${index}`} point={point} index={index} handleDragMove={handleDragMove} handleDragEnd={handleDragEnd} handleRightClick={handleRightClick} />
            ))}
            {!isDragging && displayPoints.map((point, index) => (
              <MidpointCircle key={`m-${index}`} p1={point} p2={displayPoints[(index + 1) % displayPoints.length]} index={index} handleAddPoint={handleAddPoint} />
            ))}
          </Layer>
        </Stage>
      </div>

      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold text-lg">면적 계산 결과</h4>
          <div className="flex justify-between items-center mt-2">
              <span className="text-sm text-gray-600">기존 면적:</span>
              <span className="font-mono text-sm">{initialArea.toFixed(2)} ㎡</span>
          </div>
          <div className="flex justify-between items-center mt-1">
              <span className="text-sm text-blue-600 font-semibold">수정된 면적:</span>
              <span className="font-mono text-lg font-bold text-blue-600">{currentArea.toFixed(2)} ㎡</span>
          </div>
      </div>
      
      <div className="text-xs text-gray-500 mt-2 text-center">提示: 점을 우클릭하여 삭제하거나, 녹색 점을 클릭하여 새 점을 추가하세요.</div>

      <div className="flex justify-between items-center mt-4">
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={undo} disabled={!canUndo}><Undo2 size={16} className="mr-1"/> 실행 취소</Button>
          <Button variant="outline" size="sm" onClick={redo} disabled={!canRedo}><Redo2 size={16} className="mr-1"/> 다시 실행</Button>
        </div>
        <div className="flex space-x-2">
            <Button variant="secondary" onClick={onCancel}>취소</Button>
            <Button onClick={() => onSave(points, currentArea)}>저장</Button>
        </div>
      </div>
    </div>
  );
};

export default FloorPlanEditor;
