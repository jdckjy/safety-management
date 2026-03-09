
import * as fabric from 'fabric';
import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as Popover from '@radix-ui/react-popover';
import { LEASE_STATUS, LEASE_STATUS_DISPLAY_NAMES, LeaseStatus } from '../../constants';

type CustomFabricPolygon = fabric.Polygon & {
  customData: {
    id: string;
    leaseStatus: LeaseStatus;
  };
}

const STATUS_COLORS: { [key in LeaseStatus]: string } = {
  [LEASE_STATUS.VACANT]: 'rgba(76, 175, 80, 0.4)',
  [LEASE_STATUS.NEGOTIATING]: 'rgba(255, 193, 7, 0.4)',
  [LEASE_STATUS.LEASED]: 'rgba(244, 67, 54, 0.4)',
  [LEASE_STATUS.NOT_FOR_LEASE]: 'rgba(158, 158, 158, 0.4)',
};

const FloorPlanDrafter: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);

  const [isCanvasReady, setCanvasReady] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [points, setPoints] = useState<fabric.Point[]>([]);
  const [selectedPolygon, setSelectedPolygon] = useState<CustomFabricPolygon | null>(null);
  const [popoverPosition, setPopoverPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (canvasRef.current && !fabricCanvasRef.current) {
      const canvas = new fabric.Canvas(canvasRef.current, {
        width: 800,
        height: 600,
        backgroundColor: '#f8f8f8',
        selection: true,
      });
      fabricCanvasRef.current = canvas;
      setCanvasReady(true);
      return () => {
        if (imageUrl) URL.revokeObjectURL(imageUrl);
        if (fabricCanvasRef.current) {
          fabricCanvasRef.current.dispose();
        }
        fabricCanvasRef.current = null;
      };
    }
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (imageUrl) URL.revokeObjectURL(imageUrl);
    setImageUrl(URL.createObjectURL(file));
  };

  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!imageUrl || !canvas) return;

    const imgElement = new Image();
    imgElement.src = imageUrl;
    imgElement.onload = () => {
      const fabricImg = new fabric.Image(imgElement);
      const currentCanvas = fabricCanvasRef.current;
      if (!currentCanvas) return;
      currentCanvas.backgroundImage = fabricImg;
      fabricImg.set({
        scaleX: (currentCanvas.width || 1) / (fabricImg.width || 1),
        scaleY: (currentCanvas.height || 1) / (fabricImg.height || 1),
      });
      currentCanvas.renderAll();
    };
    imgElement.onerror = () => {
        console.error("Browser: Failed to load image from URL.");
    };
  }, [imageUrl]);

  const stopDrawing = useCallback(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    setIsDrawing(false);
    setPoints([]);
    canvas.defaultCursor = 'default';
    canvas.renderAll();
  }, []);

  const createPolygon = useCallback(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas || points.length < 3) {
      stopDrawing();
      return;
    }
    const newPolygon = new fabric.Polygon(points, {
      fill: STATUS_COLORS[LEASE_STATUS.VACANT],
      stroke: 'rgba(0,0,0,0.5)',
      strokeWidth: 2,
      objectCaching: false,
      selectable: true,
    }) as CustomFabricPolygon;
    newPolygon.customData = { id: `poly_${Date.now()}`, leaseStatus: LEASE_STATUS.VACANT };
    canvas.add(newPolygon);
    stopDrawing();
  }, [points, stopDrawing]);
  
  const startDrawing = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    setIsDrawing(true);
    setPoints([]);
    canvas.defaultCursor = 'crosshair';
    // [최후의 조치] 컴파일러의 `boolean` 타입 추론 오류를 막기 위해 메서드 체이닝을 분리합니다.
    canvas.discardActiveObject();
    canvas.renderAll();
  };

  // [최후의 조치] 고장난 타입스크립트 컴파일러를 우회하기 위해 `any` 타입을 사용합니다.
  const handleCanvasClick = useCallback((options: any) => {
    if (!isDrawing || !options.pointer) return;
    const pointer = options.pointer;
    const startPoint = points[0];

    if (points.length > 1 && startPoint && Math.abs(pointer.x - startPoint.x) < 10 && Math.abs(pointer.y - startPoint.y) < 10) {
      createPolygon();
    } else {
      setPoints(prevPoints => [...prevPoints, new fabric.Point(pointer.x, pointer.y)]);
    }
  }, [isDrawing, points, createPolygon]);

  const updateLeaseStatus = (newStatus: LeaseStatus) => {
    const canvas = fabricCanvasRef.current;
    if (!selectedPolygon || !canvas) return;
    selectedPolygon.customData.leaseStatus = newStatus;
    selectedPolygon.set('fill', STATUS_COLORS[newStatus]);
    canvas.renderAll();
    setSelectedPolygon(null);
  };

  const deleteSelectedPolygon = () => {
    const canvas = fabricCanvasRef.current;
    if (!selectedPolygon || !canvas) return;
    canvas.remove(selectedPolygon);
    canvas.renderAll();
    setSelectedPolygon(null);
  };

  // [최후의 조치] 고장난 타입스크립트 컴파일러를 우회하기 위해 `any` 타입을 사용합니다.
  const handleObjectSelection = useCallback((options: any) => {
    const canvas = fabricCanvasRef.current;
    const target = options.target as CustomFabricPolygon;
    if (target?.type === 'polygon' && target.customData && canvas?.getElement()) {
      const canvasElement = canvas.getElement();
      const canvasRect = canvasElement.getBoundingClientRect();
      const boundingRect = target.getBoundingRect();
      setPopoverPosition({
        top: canvasRect.top + boundingRect.top + window.scrollY,
        left: canvasRect.left + boundingRect.left + window.scrollX + boundingRect.width / 2,
      });
      setSelectedPolygon(target);
    } else {
      setSelectedPolygon(null);
    }
  }, []);

  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    
    canvas.on('mouse:down', handleCanvasClick);
    canvas.on('selection:created', handleObjectSelection);
    canvas.on('selection:updated', handleObjectSelection);
    canvas.on('selection:cleared', () => setSelectedPolygon(null));
    
    return () => {
        const currentCanvas = fabricCanvasRef.current;
        if (currentCanvas) {
            currentCanvas.off('mouse:down', handleCanvasClick);
            currentCanvas.off('selection:created', handleObjectSelection);
            currentCanvas.off('selection:updated', handleObjectSelection);
            currentCanvas.off('selection:cleared');
        }
    };
  }, [isCanvasReady, handleCanvasClick, handleObjectSelection]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isDrawing) {
        stopDrawing();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDrawing, stopDrawing]);

  return (
    <div className="p-4 font-sans">
      <h1 className="text-2xl font-bold mb-4">도면 저작 도구</h1>
      <div className="space-x-2 mb-4">
        <label className="px-4 py-2 bg-gray-200 text-gray-700 rounded cursor-pointer hover:bg-gray-300">
          도면 이미지 업로드
          <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
        </label>
        <button onClick={startDrawing} disabled={!isCanvasReady || isDrawing} className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-400">
          {isDrawing ? 'ESC로 취소' : '폴리곤 그리기'}
        </button>
      </div>
      <Popover.Root open={!!selectedPolygon} onOpenChange={(open) => !open && setSelectedPolygon(null)}>
        <Popover.Trigger asChild>
          <div style={{ position: 'absolute', left: popoverPosition.left, top: popoverPosition.top }} />
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content
            side="top"
            align="center"
            sideOffset={10}
            className="bg-white rounded-lg shadow-xl border border-gray-200 p-3 z-50 flex flex-col space-y-2 w-48"
            onOpenAutoFocus={(e) => e.preventDefault()}
          >
            <p className="text-sm font-semibold text-gray-700 text-center mb-1">임대 상태 변경</p>
            {Object.values(LEASE_STATUS).map(status => (
              <button
                key={status}
                onClick={() => updateLeaseStatus(status)}
                className="w-full text-left px-3 py-1.5 text-sm rounded-md hover:bg-gray-100 transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                {LEASE_STATUS_DISPLAY_NAMES[status]}
              </button>
            ))}
            <hr className="my-1" />
            <button
              onClick={deleteSelectedPolygon}
              className="w-full text-left px-3 py-1.5 text-sm rounded-md text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-400"
            >
              폴리곤 삭제
            </button>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
      <canvas ref={canvasRef} className="border border-gray-400 rounded-lg shadow-inner" />
    </div>
  );
};

export default FloorPlanDrafter;
