
import React, { useEffect, useRef, useState, useMemo } from 'react';
import { InspectionLog, SeverityLevel, LogStatus } from '../types';
import { MAP_IMAGE_URL, MOCK_FACILITIES } from '../constants';
import L from 'leaflet';
import { 
  Loader2, 
  Globe,
  Maximize2,
  Compass,
  Radar,
  ImageOff,
  Activity,
  Zap,
  Flame,
  Wind,
  Layers,
  ArrowUpCircle,
  Satellite,
  AlertTriangle
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
  const [mapBounds, setMapBounds] = useState<L.LatLngBounds | null>(null);
  const [zoomLevel, setZoomLevel] = useState(17);

  // 지도 초기화
  useEffect(() => {
    if (!mapContainerRef.current || leafletMap.current) return;

    const map = L.map(mapContainerRef.current, {
      center: CENTER,
      zoom: 17,
      zoomControl: false,
      attributionControl: false,
    });

    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 19,
    }).addTo(map);

    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 19,
      opacity: 0.5
    }).addTo(map);

    map.on('click', (e: L.LeafletMouseEvent) => {
      if (viewMode !== 'SATELLITE') return;
      const lat = e.latlng.lat;
      const lng = e.latlng.lng;
      const y = ((CENTER[0] + LAT_RANGE / 2 - lat) / LAT_RANGE) * 100;
      const x = ((lng - (CENTER[1] - LNG_RANGE / 2)) / LNG_RANGE) * 100;
      onMapClick(x, y);
    });

    // 지도 이동/확대 시 마커 위치 갱신을 위한 상태 업데이트
    const updateState = () => {
      setMapBounds(map.getBounds());
      setZoomLevel(map.getZoom());
    };

    map.on('move', updateState);
    map.on('zoomend', updateState);
    
    leafletMap.current = map;
    
    setTimeout(() => {
      map.invalidateSize();
      updateState();
      setIsLoaded(true);
    }, 500);

    return () => {
      if (leafletMap.current) {
        leafletMap.current.remove();
        leafletMap.current = null;
      }
    };
  }, [onMapClick]);

  // 좌표 변환 함수 (Lat/Lng -> Percent)
  const getMarkerPosition = (log: InspectionLog) => {
    if (!leafletMap.current || viewMode === 'BLUEPRINT') {
      return { left: `${log.x}%`, top: `${log.y}%` };
    }

    const lat = (CENTER[0] + LAT_RANGE / 2) - (log.y / 100) * LAT_RANGE;
    const lng = (CENTER[1] - LNG_RANGE / 2) + (log.x / 100) * LNG_RANGE;
    
    const point = leafletMap.current.latLngToContainerPoint([lat, lng]);
    return { left: `${point.x}px`, top: `${point.y}px` };
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
    <div className="relative bg-slate-900 rounded-[3rem] shadow-[0_40px_80px_-15px_rgba(0,0,0,0.5)] overflow-hidden border-[12px] border-slate-900 h-[800px] group">
      
      {/* 1. Leaflet Base Layer (SATELLITE) */}
      <div 
        ref={mapContainerRef} 
        className={`absolute inset-0 z-0 bg-slate-950 transition-opacity duration-500 ${viewMode === 'SATELLITE' ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
      />
      
      {/* 2. Blueprint Layer (BLUEPRINT) */}
      <div 
        className={`absolute inset-0 z-10 transition-all duration-700 ease-in-out bg-[#0f172a] ${viewMode === 'BLUEPRINT' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = ((e.clientX - rect.left) / rect.width) * 100;
          const y = ((e.clientY - rect.top) / rect.height) * 100;
          onMapClick(x, y);
        }}
      >
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[linear-gradient(to_right,#6366f1_1px,transparent_1px),linear-gradient(to_bottom,#6366f1_1px,transparent_1px)] [background-size:30px_30px]" />
        <div className="absolute inset-10 border border-slate-800 rounded-lg bg-[#1e293b] shadow-inner overflow-hidden flex items-center justify-center">
          <img 
            src={MAP_IMAGE_URL} 
            alt="도면" 
            className="w-full h-full object-contain invert grayscale brightness-200 opacity-20"
          />
        </div>
      </div>

      {/* 3. Global Hybrid Marker Layer (항상 최상단) */}
      <div className="absolute inset-0 z-20 pointer-events-none">
        {logs.map(log => {
          if (log.status === LogStatus.FALSE_ALARM) return null;
          
          const pos = getMarkerPosition(log);
          const isHigh = log.severity === SeverityLevel.HIGH && log.status === LogStatus.ACTIVE;
          
          let colorClass = 'bg-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.8)]';
          let ringColor = 'border-indigo-400';
          if (log.severity === SeverityLevel.MEDIUM) {
            colorClass = 'bg-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.8)]';
            ringColor = 'border-amber-400';
          } else if (log.severity === SeverityLevel.HIGH) {
            colorClass = 'bg-red-600 shadow-[0_0_25px_rgba(220,38,38,1)]';
            ringColor = 'border-red-400';
          }

          return (
            <div
              key={log.id}
              className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto"
              style={{ left: pos.left, top: pos.top }}
            >
              <button
                onClick={(e) => { e.stopPropagation(); onPointClick(log); }}
                className={`w-10 h-10 rounded-full border-2 border-white flex items-center justify-center transition-all hover:scale-125 active:scale-95 ${colorClass}`}
              >
                {isHigh && (
                  <>
                    <div className="absolute inset-0 animate-ping rounded-full bg-red-600 opacity-40"></div>
                    <div className="absolute -inset-2 border-2 rounded-full animate-pulse border-red-500/50"></div>
                  </>
                )}
                <div className="text-white relative z-10 drop-shadow-lg">
                  {getCategoryIcon(log.facilityId)}
                </div>
              </button>
            </div>
          );
        })}
      </div>

      {/* 4. UI Overlays */}
      <div className="absolute inset-0 z-30 pointer-events-none flex flex-col justify-between p-8">
        <div className="flex justify-between items-start pointer-events-auto">
          <div className="bg-slate-900/90 backdrop-blur-2xl px-6 py-4 rounded-[1.8rem] border border-slate-700/50 flex items-center gap-5 shadow-2xl">
            <div className={`w-3 h-3 rounded-full ${isLoaded ? 'bg-emerald-500 shadow-[0_0_12px_#10b981]' : 'bg-amber-500 animate-pulse'}`} />
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] leading-none mb-1.5">시스템 프로토콜</p>
              <p className="text-sm font-black text-white uppercase tracking-tight flex items-center gap-2">
                {viewMode === 'SATELLITE' ? <Satellite className="w-4 h-4 text-emerald-400" /> : <Radar className="w-4 h-4 text-red-500" />}
                {viewMode === 'SATELLITE' ? '실시간 위성 관제' : '마스터 전술 도면'}
              </p>
            </div>
          </div>

          <div className="bg-slate-900/90 backdrop-blur-2xl p-1.5 rounded-2xl border border-slate-700/50 flex gap-1 shadow-2xl pointer-events-auto">
            <button 
              onClick={() => setViewMode('SATELLITE')}
              className={`px-5 py-2.5 rounded-xl text-[11px] font-black transition-all ${viewMode === 'SATELLITE' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'}`}
            >
              위성
            </button>
            <button 
              onClick={() => setViewMode('BLUEPRINT')}
              className={`px-5 py-2.5 rounded-xl text-[11px] font-black transition-all ${viewMode === 'BLUEPRINT' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'}`}
            >
              도면
            </button>
          </div>
        </div>

        <div className="flex justify-between items-end">
          <div className="bg-slate-900/90 backdrop-blur-2xl p-5 rounded-[1.8rem] border border-slate-700/50 flex items-center gap-5 shadow-2xl">
            <div className="flex flex-col gap-1.5 text-slate-300 text-left">
              <div className="flex items-center gap-2.5">
                <Compass className="w-4 h-4 text-indigo-400 animate-spin-slow" />
                <span className="text-[11px] font-black uppercase tracking-[0.1em]">공중 자산 스트리밍 활성</span>
              </div>
              <p className="text-[10px] text-slate-500 font-mono uppercase font-bold tracking-tight">응답 지연: 18ms | 노드 상태: 안정 (제주 헬스케어타운)</p>
            </div>
          </div>

          <div className="flex gap-3 pointer-events-auto">
            <button 
              className="p-4 bg-slate-900/90 hover:bg-slate-800 backdrop-blur-2xl rounded-2xl text-slate-400 transition-all border border-slate-700/50 shadow-2xl"
              onClick={() => leafletMap.current?.setView(CENTER, 17)}
            >
              <Maximize2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {!isLoaded && (
        <div className="absolute inset-0 z-50 bg-[#0f172a] flex flex-col items-center justify-center gap-6">
          <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
          <p className="text-[11px] font-black text-indigo-500 uppercase tracking-[0.5em]">위성 링크 동기화 중...</p>
        </div>
      )}
    </div>
  );
};

export default HotSpotMap;
