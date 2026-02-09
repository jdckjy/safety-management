
import React, { useState, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import { LatLngExpression, LatLng, Map as LeafletMap } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Crosshair, Navigation, Activity, Edit, Trash2 } from 'lucide-react';
import L from 'leaflet';
import NewNodeModal from './NewNodeModal';
import { Facility, HotSpot } from '../types';

// --- 타입 정의 ---
interface HotSpotMapProps {
  facilities: Facility[];
  hotspots: HotSpot[];
  onAddHotspot: (newHotspotData: Omit<HotSpot, 'id'>) => void;
  onUpdateHotspot: (updatedHotspot: HotSpot) => void;
  onDeleteHotspot: (hotspotId: string) => void;
}

// --- 컴포넌트 ---

// 위험도에 따른 마커 스타일 설정
const riskLevelConfig = {
  low: { color: 'bg-blue-500', pulse: false, name: '낮음' },
  medium: { color: 'bg-amber-500', pulse: false, name: '중간' },
  high: { color: 'bg-red-500', pulse: true, name: '높음' },
};

const createCustomDivIcon = (riskLevel: HotSpot['riskLevel']) => {
  const config = riskLevelConfig[riskLevel];
  const pulseHtml = config.pulse ? '<span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>' : '';

  return L.divIcon({
    html: `
      <div class="relative flex justify-center items-center w-8 h-8">
        ${pulseHtml}
        <div class="relative flex items-center justify-center w-5 h-5 rounded-full ${config.color} border-2 border-white shadow-md">
           <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="text-white"><path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </div>
      </div>
    `,
    className: '', 
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16]
  });
};

// 지도 이벤트 및 상태 관리를 위한 헬퍼 컴포넌트
const MapController: React.FC<any> = ({ onMapClick, onMouseMove, onZoomEnd }) => {
  const map = useMap();
  useEffect(() => {
      onZoomEnd(map.getZoom());
  }, []);

  useMapEvents({
    click(e) { onMapClick(e.latlng); },
    mousemove: onMouseMove,
    zoomend: () => onZoomEnd(map.getZoom()),
  });

  return null;
};


const HotSpotMap: React.FC<HotSpotMapProps> = ({ facilities, hotspots, onAddHotspot, onUpdateHotspot, onDeleteHotspot }) => {
  const [viewMode, setViewMode] = useState<'satellite' | 'blueprint'>('satellite');
  const [mouseCoords, setMouseCoords] = useState<{ lat: number, lng: number } | null>(null);
  const [zoomLevel, setZoomLevel] = useState(16);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newNodeCoords, setNewNodeCoords] = useState<LatLng | null>(null);
  const [editingHotspot, setEditingHotspot] = useState<HotSpot | null>(null);
  
  const mapRef = useRef<LeafletMap>(null);
  
  const initialPosition: LatLngExpression = [33.285186, 126.560624]; 

  useEffect(() => {
    // 탭이 활성화되어 컴포넌트가 마운트될 때 지도가 깨지는 현상을 방지합니다.
    // 잠시 후 지도 크기를 다시 계산하여 올바르게 표시되도록 합니다.
    const timer = setTimeout(() => {
      if (mapRef.current) {
        mapRef.current.invalidateSize();
      }
    }, 100);

    return () => clearTimeout(timer);
  }, []); // 컴포넌트가 마운트될 때 한 번만 실행됩니다.

  const handleMapClick = (latlng: LatLng) => {
    setEditingHotspot(null);
    setNewNodeCoords(latlng);
    setIsModalOpen(true);
  };

  const handleEditClick = (e: React.MouseEvent, hotspot: HotSpot) => {
    e.stopPropagation(); // 이벤트 버블링 방지
    setEditingHotspot(hotspot);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (e: React.MouseEvent, hotspotId: string) => {
    e.stopPropagation(); // 이벤트 버블링 방지
    if (window.confirm('정말로 이 노드를 삭제하시겠습니까?')) {
      onDeleteHotspot(hotspotId);
    }
  };

  const handleRegister = (data: Omit<HotSpot, 'id'> | HotSpot) => {
    if ('id' in data) { // 수정
      onUpdateHotspot(data as HotSpot);
    } else { // 생성
      onAddHotspot(data as Omit<HotSpot, 'id'>);
    }
    setIsModalOpen(false);
  };
  
  return (
    <div className="relative w-full h-full bg-black text-white rounded-3xl overflow-hidden">
      <MapContainer ref={mapRef} center={initialPosition} zoom={zoomLevel} style={{ height: '100%', width: '100%' }} zoomControl={false}>
        {viewMode === 'satellite' ? (
          <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" attribution='Esri' />
        ) : (
          <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" attribution='CARTO' className="leaflet-tile-blueprint" />
        )}
        
        {hotspots.map(spot => (
          <Marker 
            key={spot.id} 
            position={spot.position} 
            icon={createCustomDivIcon(spot.riskLevel)}
          >
            <Popup>
              <div className="bg-slate-800 text-white p-1 rounded-lg shadow-lg border border-slate-700 w-64">
                 <div className="p-3">
                    <p className="font-bold text-base mb-2 border-b border-slate-600 pb-2">{spot.facilityName}</p>
                    <p className="text-sm mb-1"><span className="font-semibold text-gray-400">상세내용:</span> {spot.details}</p>
                    <p className="text-sm mb-1"><span className="font-semibold text-gray-400">대응타입:</span> {spot.responseType}</p>
                    <p className={`text-sm font-bold`}>
                      <span className="font-semibold text-gray-400">위험도:</span> 
                      <span className={`ml-1 ${riskLevelConfig[spot.riskLevel].color.replace('bg-', 'text-')}`}>{riskLevelConfig[spot.riskLevel].name}</span>
                    </p>
                 </div>
                 <div className="flex justify-end gap-2 bg-slate-700/50 p-2 rounded-b-md">
                    <button onClick={(e) => handleEditClick(e, spot)} className="flex items-center gap-1 text-xs px-2 py-1 bg-gray-600 hover:bg-gray-500 rounded"><Edit size={12}/>수정</button>
                    <button onClick={(e) => handleDeleteClick(e, spot.id)} className="flex items-center gap-1 text-xs px-2 py-1 bg-red-800 hover:bg-red-700 rounded"><Trash2 size={12}/>삭제</button>
                 </div>
              </div>
            </Popup>
          </Marker>
        ))}

        <MapController 
          onMapClick={handleMapClick}
          onMouseMove={(e:any) => setMouseCoords(e.latlng)}
          onZoomEnd={(zoom:number) => setZoomLevel(zoom)}
        />
      </MapContainer>

      <NewNodeModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onRegister={handleRegister}
        location={newNodeCoords}
        facilities={facilities}
        editingHotspot={editingHotspot}
      />

      {/* --- UI 오버레이 --- */}
      <div className="absolute top-6 left-6 z-[1000] flex items-center gap-4 pointer-events-none">
        {/* ... (기존 UI) ... */}
      </div>
      <div className="absolute top-6 right-6 z-[1000] flex items-center gap-4 pointer-events-none">
        <div className="bg-slate-900/80 backdrop-blur-xl p-3 rounded-xl border border-white/20 text-xs flex items-center gap-6">
            <div className="flex items-center gap-2"><Crosshair size={14} /><span>X: {mouseCoords?.lng.toFixed(4)}, Y: {mouseCoords?.lat.toFixed(4)}</span></div>
            <div className="flex items-center gap-2"><Navigation size={14} /><span>ZOOM: {zoomLevel.toFixed(2)}</span></div>
            <div className="flex items-center gap-2"><Activity size={14} /><span>STATUS: OPERATIONAL</span></div>
        </div>
      </div>
      
      <style>{`
        .leaflet-tile-blueprint { filter: invert(1) grayscale(1) brightness(0.8) contrast(1.2); }
        .leaflet-popup-content-wrapper { background-color: transparent; border: none; box-shadow: none; }
        .leaflet-popup-content { padding: 0; margin: 0; }
        .leaflet-popup-tip { background: #334155; }
        .leaflet-popup-close-button { color: #94A3B8 !important; right: 10px; top: 10px; }
      `}</style>
    </div>
  );
};

export default HotSpotMap;
