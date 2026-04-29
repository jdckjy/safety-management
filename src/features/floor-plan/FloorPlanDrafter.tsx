
import React, { useState, useRef, useEffect } from 'react';
import { useProjectData } from '../../providers/ProjectDataProvider';
import floor1F from '../../assets/1F.png';
import floor2F from '../../assets/2F.png';
import floor3F from '../../assets/3F.png';
import { Unit } from '../../types'; // TenantUnit에서 Unit으로 변경

interface FloorPlanDrafterProps {}

const floorImages: { [key: string]: string } = {
    '1F': floor1F,
    '2F': floor2F,
    '3F': floor3F,
};

const FloorPlanDrafter: React.FC<FloorPlanDrafterProps> = () => {
  // tenantUnits 대신 units를 사용하고, 안전을 위해 기본값으로 빈 배열을 할당합니다.
  const { units = [], updateUnit } = useProjectData(); 
  const [selectedFloor, setSelectedFloor] = useState('1F');
  const [points, setPoints] = useState<number[]>([]);
  const [selectedUnitId, setSelectedUnitId] = useState<string>('');
  const svgRef = useRef<SVGSVGElement>(null);
  const [imageUrl, setImageUrl] = useState(floorImages[selectedFloor]);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    setImageUrl(floorImages[selectedFloor]);
    setSelectedUnitId(''); // 층 변경 시 유닛 선택 초기화
    setPoints([]); // 층 변경 시 포인트 초기화
  }, [selectedFloor]);

  useEffect(() => {
    if (!selectedUnitId) {
      setPoints([]);
      return;
    }

    const selectedUnit = units.find(u => u.id === selectedUnitId);
    if (selectedUnit && selectedUnit.pathData) {
      const parsedPoints = selectedUnit.pathData
        .replace(/[MLZ]/g, '')
        .trim()
        .split(/[\s,]+/)
        .filter(Boolean)
        .map(Number);
      setPoints(parsedPoints);
    } else {
      setPoints([]);
    }
  }, [selectedUnitId, units]);

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth, naturalHeight } = e.currentTarget;
    setImageDimensions({ width: naturalWidth, height: naturalHeight });
  };

  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!selectedUnitId) {
        alert('먼저 유닛을 선택해주세요.');
        return;
    }

    if (svgRef.current) {
        const svgPoint = svgRef.current.createSVGPoint();
        svgPoint.x = e.clientX;
        svgPoint.y = e.clientY;
        
        const ctm = svgRef.current.getScreenCTM();
        if (!ctm) return;

        try {
            const transformedPoint = svgPoint.matrixTransform(ctm.inverse());
            let newX = transformedPoint.x;
            let newY = transformedPoint.y;

            // Snap-to-axis logic
            if (points.length >= 2) {
                const lastX = points[points.length - 2];
                const lastY = points[points.length - 1];
                const snapThreshold = 10; // Snap distance in SVG coordinates

                const deltaX = Math.abs(newX - lastX);
                const deltaY = Math.abs(newY - lastY);

                if (deltaX < snapThreshold && deltaX < deltaY) {
                    newX = lastX; // Snap vertically
                } else if (deltaY < snapThreshold) {
                    newY = lastY; // Snap horizontally
                }
            }
            
            setPoints([...points, newX, newY]);
        } catch (error) {
            console.error("Could not invert CTM", error);
        }
    }
  };

  const handleSave = () => {
    if (!selectedUnitId) {
        alert('저장할 유닛이 선택되지 않았습니다.');
        return;
    }
    if (points.length < 4) {
        alert('유닛의 영역은 최소 2개 이상의 점으로 그려져야 합니다.');
        return;
    }

    const unitToUpdate = units.find(unit => unit.id === selectedUnitId);
    if (!unitToUpdate) {
        alert('선택된 유닛 정보를 찾을 수 없습니다.');
        return;
    }

    const pathData = `M ${points[0]} ${points[1]} ` + points.slice(2).reduce((acc, val, i) => acc + (i % 2 === 0 ? 'L ' : ' ') + val + ' ', '') + 'Z';
    
    // TenantUnit 대신 Unit 타입 사용
    const updatedUnit: Unit = { 
        ...unitToUpdate, 
        pathData 
    };

    updateUnit(updatedUnit); // updateTenantUnit 대신 updateUnit 사용
    alert('저장되었습니다!');
  };
  
  const unitsForFloor = units.filter(u => u.floor === selectedFloor);

  return (
    <div className="p-4">
        <div className="flex justify-between items-center mb-4">
            <div className="flex space-x-2">
              {Object.keys(floorImages).map(floor => (
                <button 
                  key={floor} 
                  onClick={() => setSelectedFloor(floor)}
                  className={`px-4 py-2 rounded ${selectedFloor === floor ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
                  {floor}
                </button>
              ))}
            </div>
        </div>

        <h2 className="text-xl font-bold mb-2">도면 편집기 ({selectedFloor})</h2>
        <div className="mb-4">
            <label htmlFor="unit-select" className="mr-2">수정할 유닛:</label>
            <select id="unit-select" value={selectedUnitId} onChange={(e) => setSelectedUnitId(e.target.value)} className="p-2 border rounded">
                <option value="">유닛 선택</option>
                {unitsForFloor.map(unit => <option key={unit.id} value={unit.id}>{`${unit.name}`}</option>)}
            </select>
        </div>
      <div style={{ position: 'relative', width: '100%' }}>
        <img 
          src={imageUrl} 
          alt={`${selectedFloor} plan`} 
          onLoad={handleImageLoad}
          style={{ width: '100%', opacity: 0.7 }}
        />
        <svg 
          ref={svgRef} 
          onClick={handleSvgClick}
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }} 
          viewBox={`0 0 ${imageDimensions.width || 1000} ${imageDimensions.height || 700}`}
        >
            {units.filter(u => u.floor === selectedFloor && u.pathData && u.id !== selectedUnitId).map(unit => (
                <path key={unit.id} d={unit.pathData} fill="rgba(0, 0, 255, 0.3)" stroke="#0000FF" strokeWidth="1" />
            ))}
            {/* Show existing path for the selected unit if not being edited */}
            {units.find(u => u.id === selectedUnitId)?.pathData && points.length === 0 && (
                <path d={units.find(u => u.id === selectedUnitId)!.pathData!} fill="rgba(255, 165, 0, 0.4)" stroke="#FFA500" strokeWidth="1" />
            )}
            {/* Show path being actively drawn or edited */}
            {points.length > 0 && <polyline points={points.join(' ')} fill="rgba(255, 0, 0, 0.4)" stroke="lime" strokeWidth="2"/>}
        </svg>
      </div>
      {selectedUnitId && (
        <div className="mt-4">
            <button onClick={handleSave} className="px-4 py-2 rounded bg-blue-500 text-white">저장</button>
            <button onClick={() => setPoints([])} className="px-4 py-2 rounded bg-gray-300 ml-2">초기화</button>
        </div>
      )}
    </div>
  );
};

export default FloorPlanDrafter;
