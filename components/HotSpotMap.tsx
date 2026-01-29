
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { InspectionLog, SeverityLevel, LogStatus } from '../types';
import { MAP_IMAGE_URL, MOCK_FACILITIES } from '../constants';
import L from 'leaflet';
import { 
  Loader2, 
  Maximize2,
  Compass,
  Activity,
  Zap,
  Flame,
  Wind,
  Layers,
  ArrowUpCircle,
  GripVertical
} from 'lucide-react';

interface HotSpotMapProps {
  logs: InspectionLog[];
  onPointClick: (log: InspectionLog) => void;
  onMapClick: (x: number, y: number) => void;
}

type MapViewMode = 'SATELLITE' | 'BLUEPRINT';

const CENTER: [number, number] = [33.2842, 126.5651];
const LAT_RANGE = 0.012; 
const LNG_RANGE = 0.018; 

const HotSpotMap: React.FC<HotSpotMapProps> = ({ logs, onPointClick, onMapClick }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<L.Map | null>(null);
  
  const [viewMode, setViewMode] = useState<MapViewMode>('SATELLITE');
  const [isLoaded, setIsLoaded] = useState(false);
  const [mapUpdateTick, setMapUpdateTick] = useState(0);

  // 택티컬 줌 관련 상태
  const [isZooming, setIsZooming] = useState(false);
  const zoomStartY = useRef(0);
  const zoomStartLevel = useRef(0);

  // 1. 지도 초기화
  useEffect(() => {
    if (!mapContainerRef.current || leafletMap.current) return;

    const map = L.map(mapContainerRef.current, {
      center: CENTER,
      zoom: 17,
      zoomControl: false,
      attributionControl: false,
      scrollWheelZoom: true, // 휠은 유지
    });

    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 19,
    }).addTo(map);

    map.on('click', (e: L.LeafletMouseEvent) => {
      if (viewMode !== 'SATELLITE') return;
      const lat = e.latlng.lat;
      const lng = e.latlng.lng;
      const y = ((CENTER[0] + LAT_RANGE / 2 - lat) / LAT_RANGE) * 100;
      const x = ((lng - (CENTER[1] - LNG_RANGE / 2)) / LNG_RANGE) * 100;
      onMapClick(x, y);
    });

    const triggerUpdate = () => setMapUpdateTick(t => t + 1);
    map.on('move zoom viewreset resize', triggerUpdate);
    
    leafletMap.current = map;
    
    setTimeout(() => {
      map.invalidateSize();
      setIsLoaded(true);
      triggerUpdate();
    }, 800);

    return () => {
      if (leafletMap.current) {
        leafletMap.current.remove();
        leafletMap.current = null;
      }
    };
  }, [onMapClick, viewMode]);

  // 2. 택티컬 줌 (Vertical Drag Zoom) 로직
  const onZoomMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    if (!leafletMap.current) return;
    setIsZooming(true);
    zoomStartY.current = e.clientY;
    zoomStartLevel.current = leafletMap.current.getZoom();
    document.body.style.cursor = 'ns-resize';
  }, []);

  const onZoomMouseMove = useCallback((e: MouseEvent) => {
    if (!isZooming || !leafletMap.current) return;
    
    // 수직 이동량 계산 (위로 드래그 = 마이너스 deltaY)
    const deltaY = e.clientY - zoomStartY.current;
    
    // 50px 이동당 1단계 줌 변경으로 설정
    // 위로 드래그(deltaY < 0) -> Zoom Out (축소)
    // 아래로 드래그(deltaY > 0) -> Zoom In (확대)
    const zoomDelta = deltaY / 100; 
    const nextZoom = Math.max(14, Math.min(19, zoomStartLevel.current + zoomDelta));
    
    leafletMap.current.setZoom(nextZoom, { animate: false });
  }, [isZooming]);

  const onZoomMouseUp = useCallback(() => {
    setIsZooming(false);
    document.body.style.cursor = '';
  }, []);

  useEffect(() => {
    if (isZooming) {
      window.addEventListener('mousemove', onZoomMouseMove);
      window.addEventListener('mouseup', onZoomMouseUp);
    } else {
      window.removeEventListener('mousemove', onZoomMouseMove);
      window.removeEventListener('mouseup', onZoomMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', onZoomMouseMove);
      window.removeEventListener('mouseup', onZoomMouseUp);
    };
  }, [isZooming, onZoomMouseMove, onZoomMouseUp]);

  // 3. 마커 위치 계산
  const getMarkerPosition = (log: InspectionLog) => {
    if (viewMode === 'BLUEPRINT') return { left: `${log.x}%`, top: `${log.y}%` };
    if (!leafletMap.current) return { left: `${log.x}%`, top: `${log.y}%` };

    const lat = (CENTER[0] + LAT_RANGE / 2) - (log.y / 100) * LAT_RANGE;
    const lng = (CENTER[1] - LNG_RANGE / 2) + (log.x / 100) * LNG_RANGE;
    
    try {
      const point = leafletMap.current.latLngToContainerPoint([lat, lng]);
      return { left: `${point.x}px`, top: `${point.y}px` };
    } catch (e) {
      return { left: `${log.x}%`, top: `${log.y}%` };
    }
  };

  const getCategoryIcon = (facilityId: string) => {
    const f = MOCK_FACILITIES.find(fac => fac.id === facilityId);
    if (!f) return <Activity className="w-4 h-4" />;
    switch(f.category) {
      case 'Fire': return <Flame className="w-4 h-4" />;
      case 'Electrical': return <Zap className="w-4 h-4" />;
      case 'HVAC': return <Wind className="w-4 h-4" />;
      case 'Elevator': return <ArrowUpCircle className="w-4 h-4" />;
      default: return <Layers className="w-4 h-4" />;
    }
  };

  return (
    <div className="relative h-[750px] bg-slate-950 rounded-[3rem] shadow-2xl border-[12px] border-slate-900 overflow-hidden">
      {/* 위성 지도 */}
      <div 
        ref={mapContainerRef} 
        className={`absolute inset-0 z-0 bg-slate-950 transition-opacity duration-500 ${viewMode === 'SATELLITE' ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
      />
      
      {/* 도면 */}
      <div 
        className={`absolute inset-0 z-10 transition-all duration-700 ease-in-out bg-[#0f172a] ${viewMode === 'BLUEPRINT' ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={(e) => {
          if (viewMode !== 'BLUEPRINT') return;
          const rect = e.currentTarget.getBoundingClientRect();
          const x = ((e.clientX - rect.left) / rect.width) * 100;
          const y = ((e.clientY - rect.top) / rect.height) * 100;
          onMapClick(x, y);
        }}
      >
        <div className="absolute inset-10 border border-slate-800 rounded-lg bg-[#1e293b] shadow-inner flex items-center justify-center">
          <img src={MAP_IMAGE_URL} alt="도면" className="w-full h-full object-contain invert grayscale brightness-200 opacity-20" />
        </div>
      </div>

      {/* 마커 레이어 */}
      <div className="absolute inset-0 z-20 pointer-events-none" key={mapUpdateTick}>
        {logs.map(log => {
          if (log.status === LogStatus.FALSE_ALARM) return null;
          const pos = getMarkerPosition(log);
          const isHigh = log.severity === SeverityLevel.HIGH && log.status === LogStatus.ACTIVE;
          
          let colorClass = 'bg-indigo-600';
          if (log.severity === SeverityLevel.MEDIUM) colorClass = 'bg-amber-500';
          else if (log.severity === SeverityLevel.HIGH) colorClass = 'bg-red-600';

          return (
            <div
              key={log.id}
              className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto"
              style={{ left: pos.left, top: pos.top }}
            >
              <button
                onClick={(e) => { e.stopPropagation(); onPointClick(log); }}
                className={`w-10 h-10 rounded-full border-2 border-white flex items-center justify-center transition-transform hover:scale-125 shadow-xl ${colorClass}`}
              >
                {isHigh && <div className="absolute inset-0 animate-ping rounded-full bg-red-600 opacity-40"></div>}
                <div className="text-white">{getCategoryIcon(log.facilityId)}</div>
              </button>
            </div>
          );
        })}
      </div>

      {/* UI 컨트롤 오버레이 */}
      <div className="absolute inset-0 z-30 pointer-events-none flex flex-col justify-between p-8">
        <div className="flex justify-between items-start pointer-events-auto gap-4">
          <div className="bg-slate-900/90 backdrop-blur-xl px-6 py-4 rounded-[1.5rem] border border-slate-700/50 flex items-center gap-4 shadow-2xl">
            <div className={`w-3 h-3 rounded-full ${isLoaded ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-amber-500 animate-pulse'}`} />
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Status</p>
              <p className="text-xs font-black text-white uppercase tracking-tight">
                {viewMode === 'SATELLITE' ? 'Satellite Live' : 'Strategic Map'}
              </p>
            </div>
          </div>
          <div className="bg-slate-900/90 backdrop-blur-xl p-1 rounded-xl border border-slate-700/50 flex gap-1 shadow-2xl">
            <button onClick={() => setViewMode('SATELLITE')} className={`px-4 py-2 rounded-lg text-[10px] font-black transition-all ${viewMode === 'SATELLITE' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}>위성</button>
            <button onClick={() => setViewMode('BLUEPRINT')} className={`px-4 py-2 rounded-lg text-[10px] font-black transition-all ${viewMode === 'BLUEPRINT' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}>도면</button>
          </div>
        </div>

        <div className="flex justify-between items-end">
          <div className="flex bg-slate-900/90 backdrop-blur-xl px-4 py-3 rounded-xl border border-slate-700/50 items-center gap-3">
            <Compass className="w-4 h-4 text-indigo-400 animate-spin-slow" />
            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Jeju Node Linked</span>
          </div>
          <div className="flex gap-4 items-center">
             {/* 택티컬 줌 핸들 */}
            <div 
              onMouseDown={onZoomMouseDown}
              className="group pointer-events-auto flex flex-col items-center gap-2 px-3 py-6 bg-slate-900/90 backdrop-blur-xl rounded-full border border-slate-700/50 shadow-2xl cursor-ns-resize active:bg-indigo-600 transition-colors"
            >
              <p className="text-[8px] font-black text-slate-500 uppercase vertical-text">Zoom</p>
              <GripVertical className="w-4 h-4 text-slate-400 group-hover:text-white" />
            </div>
            
            <button 
              className="p-4 bg-slate-900/90 hover:bg-slate-800 backdrop-blur-xl rounded-2xl text-slate-400 transition-all border border-slate-700/50 shadow-2xl pointer-events-auto"
              onClick={() => leafletMap.current?.setView(CENTER, 17)}
            >
              <Maximize2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {!isLoaded && (
        <div className="absolute inset-0 z-50 bg-[#0f172a] flex flex-col items-center justify-center gap-4">
          <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
          <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em]">Syncing SAT-Link...</p>
        </div>
      )}

      <style>{`
        .vertical-text {
          writing-mode: vertical-rl;
          text-orientation: mixed;
          transform: rotate(180deg);
        }
      `}</style>
    </div>
  );
};

export default HotSpotMap;
