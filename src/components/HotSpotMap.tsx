
import React, { useState, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import { LatLngExpression, LatLng, Map as LeafletMap } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Crosshair, Navigation, Activity, Edit, Trash2, Paperclip, X } from 'lucide-react';
import L from 'leaflet';
import NewNodeModal from './NewNodeModal';
import { Facility, HotSpot } from '../types';

// This is the type of data received from the modal now.
type HotspotSubmitData = Omit<HotSpot, 'id' | 'attachments'> & {
   attachments?: string[];
} & { id?: string };

interface HotSpotMapProps {
  facilities: Facility[];
  hotspots: HotSpot[];
  onAddHotspot: (newHotspotData: Omit<HotSpot, 'id'>) => void;
  onUpdateHotspot: (updatedHotspot: HotSpot) => void;
  onDeleteHotspot: (hotspotId: string) => void;
}

const riskLevelConfig = {
  low: { color: 'bg-blue-500', pulse: false, name: '낮음' },
  medium: { color: 'bg-amber-500', pulse: false, name: '중간' },
  high: { color: 'bg-red-500', pulse: true, name: '높음' },
};

const createCustomDivIcon = (riskLevel: HotSpot['riskLevel'], hasAttachment: boolean) => {
  const config = riskLevelConfig[riskLevel] || riskLevelConfig.low;
  const pulseHtml = config.pulse ? '<span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>' : '';
  const attachmentIcon = hasAttachment ? '<div class="absolute -top-1 -right-1 w-4 h-4 bg-gray-800 rounded-full flex items-center justify-center border-2 border-white"><svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="text-white"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.59a2 2 0 0 1-2.83-2.83l.79-.79"></path></svg></div>' : '';

  return L.divIcon({
    html: `
      <div class="relative flex justify-center items-center w-8 h-8">
        ${pulseHtml}
        <div class="relative flex items-center justify-center w-5 h-5 rounded-full ${config.color} border-2 border-white shadow-md">
           <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="text-white"><path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </div>
        ${attachmentIcon}
      </div>
    `,
    className: '', 
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16]
  });
};

const MapController: React.FC<{ 
  onMapClick: (latlng: LatLng) => void;
  onMouseMove: (e: L.LeafletMouseEvent) => void;
  onZoomEnd: (zoom: number) => void;
}> = ({ onMapClick, onMouseMove, onZoomEnd }) => {
  const map = useMap();
  useEffect(() => { onZoomEnd(map.getZoom()); }, [map, onZoomEnd]);
  useMapEvents({ click(e) { onMapClick(e.latlng); }, mousemove: onMouseMove, zoomend: () => onZoomEnd(map.getZoom()) });
  return null;
};

const HotSpotMap: React.FC<HotSpotMapProps> = ({ facilities, hotspots, onAddHotspot, onUpdateHotspot, onDeleteHotspot }) => {
  const [viewMode, setViewMode] = useState<'satellite' | 'blueprint'>('satellite');
  const [mouseCoords, setMouseCoords] = useState<{ lat: number, lng: number } | null>(null);
  const [zoomLevel, setZoomLevel] = useState(16);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newNodeCoords, setNewNodeCoords] = useState<LatLng | null>(null);
  const [editingHotspot, setEditingHotspot] = useState<HotSpot | null>(null);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  
  const mapRef = useRef<LeafletMap>(null);
  const initialPosition: LatLngExpression = [33.285186, 126.560624]; 

  useEffect(() => {
    const timer = setTimeout(() => { mapRef.current?.invalidateSize(); }, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleMapClick = (latlng: LatLng) => {
    setEditingHotspot(null);
    setNewNodeCoords(latlng);
    setIsModalOpen(true);
  };

  const handleEditClick = (e: React.MouseEvent, hotspot: HotSpot) => {
    e.stopPropagation();
    setEditingHotspot(hotspot);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (e: React.MouseEvent, hotspotId: string) => {
    e.stopPropagation();
    if (window.confirm('정말로 이 노드를 삭제하시겠습니까?')) {
      onDeleteHotspot(hotspotId);
    }
  };

  const handleRegister = (data: HotspotSubmitData) => {
    // Data from the modal is already processed (Base64 attachments).
    // We just need to call the correct provider function.
    const { id, ...restData } = data;

    if (id) {
      // For updates, the full HotSpot object is expected by the provider.
      onUpdateHotspot({ id, ...restData } as HotSpot);
    } else {
      // For additions, the provider expects the object without the id.
      onAddHotspot(restData as Omit<HotSpot, 'id'>);
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
        
        {hotspots.map(spot => {
          const config = riskLevelConfig[spot.riskLevel] || riskLevelConfig.low;
          const hasAttachment = spot.attachments && spot.attachments.length > 0;
          return (
            <Marker 
              key={spot.id} 
              position={spot.position} 
              icon={createCustomDivIcon(spot.riskLevel, hasAttachment)}
            >
              <Popup>
                <div className="bg-slate-800 text-white p-1 rounded-lg shadow-lg border border-slate-700 w-64">
                  <div className="p-3">
                      <p className="font-bold text-base mb-2 border-b border-slate-600 pb-2">{spot.title}</p>
                      <p className="text-sm mb-1"><span className="font-semibold text-gray-400">상세내용:</span> {spot.description}</p>
                      <p className="text-sm mb-1"><span className="font-semibold text-gray-400">대응타입:</span> {spot.responseType}</p>
                      <p className={`text-sm font-bold`}>
                        <span className="font-semibold text-gray-400">위험도:</span> 
                        <span className={`ml-1 ${config.color.replace('bg-', 'text-')}`}>{config.name}</span>
                      </p>
                      {hasAttachment && (
                          <div className="mt-2 pt-2 border-t border-slate-600">
                            <p className="text-sm font-semibold text-gray-400 mb-2 flex items-center"><Paperclip size={12} className="mr-1" />첨부파일</p>
                            <div className="flex gap-2 flex-wrap">
                              {spot.attachments?.map((base64Url, index) => (
                                <button 
                                  key={index} 
                                  onClick={() => setSelectedImageUrl(base64Url)}
                                  className="w-12 h-12 rounded bg-slate-700 bg-cover bg-center cursor-pointer hover:ring-2 hover:ring-blue-400 transition-all"
                                  title="첨부파일 보기"
                                  style={{backgroundImage: `url(${base64Url})`}} />
                              ))}
                            </div>
                          </div>
                      )}
                  </div>
                  <div className="flex justify-end gap-2 bg-slate-700/50 p-2 rounded-b-md">
                      <button onClick={(e) => handleEditClick(e, spot)} className="flex items-center gap-1 text-xs px-2 py-1 bg-gray-600 hover:bg-gray-500 rounded"><Edit size={12}/>수정</button>
                      <button onClick={(e) => handleDeleteClick(e, spot.id)} className="flex items-center gap-1 text-xs px-2 py-1 bg-red-800 hover:bg-red-700 rounded"><Trash2 size={12}/>삭제</button>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        <MapController 
          onMapClick={handleMapClick}
          onMouseMove={(e: L.LeafletMouseEvent) => setMouseCoords(e.latlng)}
          onZoomEnd={(zoom:number) => setZoomLevel(zoom)}
        />
      </MapContainer>

      {selectedImageUrl && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[3000] cursor-pointer"
          onClick={() => setSelectedImageUrl(null)}
        >
          <div className="relative">
            <img 
              src={selectedImageUrl} 
              alt="Enlarged view" 
              className="max-w-[90vw] max-h-[90vh] rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()} 
            />
            <button 
              onClick={() => setSelectedImageUrl(null)} 
              className="absolute -top-4 -right-4 text-white bg-slate-800/50 rounded-full p-2 hover:bg-slate-700 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>
      )}

      <NewNodeModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onRegister={handleRegister}
        location={newNodeCoords ? { lat: newNodeCoords.lat, lng: newNodeCoords.lng } : null}
        facilities={facilities}
        editingHotspot={editingHotspot}
      />

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
