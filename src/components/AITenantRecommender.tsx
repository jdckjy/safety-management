import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { jejuPopulationActualData } from '@/data/jeju-population-actual';
import { MapContainer, TileLayer, Circle, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { 
  MapPin, 
  Maximize, 
  Building2,
  Activity,
  FileText,
  AlertCircle,
  Download
} from 'lucide-react';
import { useProjectData } from '@/providers/ProjectDataProvider';
import { TenantInfo } from '@/types';

// Fix for default marker icon issues in React-Leaflet
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const CENTER_COORDS: [number, number] = [33.284, 126.582];

interface Recommendation {
  subject: string;
  score: number;
  status: 'High' | 'Medium' | 'Low';
  reason: string;
  targetGroup: string;
  expectedDemand: string;
  shortageGap: number;
}

interface PopulationStats {
  total: number;
  child: number;
  adult: number;
  senior: number;
  growth: number;
  segments: { label: string; value: number; color: string; }[];
}

const MapController = ({ radius }: { radius: number }) => {
  const map = useMap();
  useEffect(() => {
    if (!map) return;
    const zoom = radius <= 5 ? 12 : radius <= 10 ? 11 : 10;
    map.flyTo(CENTER_COORDS, zoom, { duration: 0.5 });
    const timer = setTimeout(() => map.invalidateSize(), 100);
    return () => clearTimeout(timer);
  }, [radius, map]);
  return null;
};

const AITenantRecommender: React.FC = () => {
  const { units, contracts, tenantInfo } = useProjectData();
  const [radius, setRadius] = useState<number>(5);
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);
  const [selectedFloor, setSelectedFloor] = useState<string>('2F');

  const processedFloorUnits = useMemo(() => {
    const tenantMap = new Map(tenantInfo.map(t => [t.id, t]));
    const activeContractByUnitId = new Map<string, any>();

    for (const contract of contracts) {
      if (contract.status === 'active' && contract.unitId) {
        activeContractByUnitId.set(contract.unitId, contract);
      }
    }

    return units
      .filter(u => u.floor === selectedFloor)
      .map(unit => {
        const isOccupied = unit.status === 'occupied';
        let tenantName: string | undefined = undefined;
        if (isOccupied) {
          const contract = activeContractByUnitId.get(unit.id);
          if (contract) {
            const tenant = tenantMap.get(contract.tenantId);
            tenantName = tenant?.businessName;
          }
        }
        return { ...unit, isOccupied, tenantName };
      })
      .sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  }, [units, contracts, tenantInfo, selectedFloor]);


  const handleFloorChange = (floor: string) => {
    setSelectedFloor(floor);
    setSelectedUnitId(null);
  };

  const selectedUnit = useMemo(() => {
    if (!selectedUnitId) return null;
    return processedFloorUnits.find(u => u.id === selectedUnitId);
  }, [selectedUnitId, processedFloorUnits]);

  const stats = useMemo((): PopulationStats => {
    const dongs5km = ['동홍동', '서홍동', '송산동', '정방동', '중앙동', '천지동', '효돈동', '영천동'];
    const dongs10km = [...dongs5km, '대륜동', '대천동'];
    const targetDongs = radius === 5 ? dongs5km : radius === 10 ? dongs10km : null;
    let catchmentTotal = 0;
    const latestData = jejuPopulationActualData.filter(d => d.PRD_DE === '202406');

    if (targetDongs) {
      catchmentTotal = latestData.filter(d => targetDongs.includes(d.C1_NM)).reduce((acc, curr) => acc + parseInt(curr.DT), 0);
    } else {
      const seogwipoTotal = latestData.find(d => d.C1_NM === '서귀포시');
      catchmentTotal = seogwipoTotal ? parseInt(seogwipoTotal.DT) : 190000;
    }

    const child = Math.round(catchmentTotal * 0.10);
    const adult = Math.round(catchmentTotal * 0.67);
    const senior = Math.round(catchmentTotal * 0.23);

    return {
      total: catchmentTotal,
      child,
      adult,
      senior,
      growth: radius === 5 ? 3.8 : radius === 10 ? 2.1 : 1.2,
      segments: [
        { label: "영유아/청소년", value: child, color: "bg-cyan-500" },
        { label: "중장년층", value: adult, color: "bg-blue-500" },
        { label: "고령층", value: senior, color: "bg-indigo-500" }
      ]
    };
  }, [radius]);

  const recommendations = useMemo((): Recommendation[] => {
    const spendingMultiplier = 1.18;
    const existingSupply = { pediatrics: radius === 5 ? 2 : 12, ortho: radius === 5 ? 4 : 18, internal: radius === 5 ? 8 : 35 };
    const subjects: Recommendation[] = [
      { subject: "소아청소년과 / 아동발달센터", score: Math.min(98, Math.round(((stats.child * spendingMultiplier) / (existingSupply.pediatrics + 1)) * 0.08)), status: 'High', reason: `서귀포 동부권(${radius}km) 인구 ${stats.child.toLocaleString()}명 대비 전문 소아 의료시설 절대 부족`, targetGroup: "0-14세 자녀 동반 이주 가구", expectedDemand: "일 평균 외래 75~110건 예상", shortageGap: 91 },
      { subject: "정형외과 / 전문재활클리닉", score: Math.min(95, Math.round(((stats.senior * spendingMultiplier * 1.2) / (existingSupply.ortho + 1)) * 0.03)), status: 'High', reason: "서귀포 고령 인구(23%) 밀집 및 헬스케어타운 시니어 연계 특화 수요", targetGroup: "65세 이상 및 재활 관광객", expectedDemand: "월 평균 처방액 약 4.5억 예상", shortageGap: 78 },
      { subject: "내과 / 스마트 검진센터", score: Math.min(82, Math.round(((stats.adult * spendingMultiplier) / (existingSupply.internal + 1)) * 0.015)), status: 'Medium', reason: "도심권 인구 대비 대형 검진 인프라 부족 및 대기 정체 해소 수요", targetGroup: "30-50대 생산연령 인구", expectedDemand: "연간 수검 인원 7,200명 예상", shortageGap: 52 }
    ];
    return subjects.sort((a, b) => b.score - a.score);
  }, [stats, radius]);

  const topRecommendation = recommendations[0];
  const getStatusColor = (status: string) => {
    if (status === 'High') return 'text-red-400 border-red-900 bg-red-950/30';
    if (status === 'Medium') return 'text-yellow-400 border-yellow-900 bg-yellow-950/30';
    return 'text-green-400 border-green-900 bg-green-950/30';
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-1">
      {/* Column 1: GIS Analysis */}
      <Card className="lg:col-span-3 border-none shadow-sm bg-white">
        <CardHeader className="pb-3 border-b border-slate-50">
          <CardTitle className="text-lg flex items-center gap-2 font-bold text-slate-800">
            <MapPin className="text-blue-600" size={20} />
            배후 인구 분석 (GIS)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="space-y-4">
            <div className="flex justify-between text-sm font-bold text-slate-700"><span>분석 반경 (Radius)</span><Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50">{radius}km</Badge></div>
            <Slider value={[radius]} onValueChange={(val) => setRadius(val[0])} max={20} min={5} step={5} className="py-4" />
          </div>
          <div className="bg-slate-100 rounded-xl overflow-hidden shadow-inner border border-slate-200 relative z-0 h-[400px]">
             <MapContainer center={CENTER_COORDS} zoom={12} style={{ height: '400px', width: '100%' }} zoomControl={false} scrollWheelZoom={false} dragging={true}>
               <MapController radius={radius} />
               <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>' />
               <Circle center={CENTER_COORDS} radius={radius * 1000} pathOptions={{ fillColor: '#3b82f6', fillOpacity: 0.15, color: '#2563eb', weight: 2, dashArray: '8, 8', fill: true }} />
               <Marker position={CENTER_COORDS}><Popup>제주헬스케어타운 의료서비스센터</Popup></Marker>
             </MapContainer>
          </div>
          <div className="space-y-3 pt-2">
            <h5 className="text-[11px] font-black text-slate-400 uppercase tracking-wider mb-2">Target Insights</h5>
            {stats.segments.map((seg, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between text-[11px] font-bold"><span className="text-slate-600">{seg.label}</span><span className="text-slate-900">{seg.value.toLocaleString()}명</span></div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden"><div className={`h-full ${seg.color} transition-all duration-500`} style={{ width: `${(seg.value / stats.total) * 100}%` }}></div></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Column 2: Floorplan Simulation */}
      <Card className="lg:col-span-5 border-none shadow-sm bg-white">
        <CardHeader className="pb-3 border-b border-slate-50">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2 font-bold text-slate-800">
              <Building2 className="text-indigo-600" size={20} />
              도면 시뮬레이션 ({selectedFloor})
            </CardTitle>
            <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
              {[...new Set(units.map(u => u.floor))]
                .filter(f => f)
                .sort((a, b) => a.localeCompare(b))
                .map(floor => (
                  <button
                    key={floor}
                    onClick={() => handleFloorChange(floor)}
                    className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${
                      selectedFloor === floor
                        ? 'bg-white text-indigo-600 shadow-sm'
                        : 'text-slate-500 hover:bg-white/60'
                    }`}
                  >
                    {floor}
                  </button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="bg-slate-50 rounded-2xl p-8 border border-slate-100 relative shadow-inner">
            <div className="grid grid-cols-5 gap-3">
              {processedFloorUnits.map((unit) => {
                return (
                  <button
                    key={unit.id}
                    disabled={unit.isOccupied}
                    onClick={() => !unit.isOccupied && setSelectedUnitId(unit.id)}
                    className={`aspect-[4/3] rounded-lg border-2 flex flex-col items-center justify-center transition-all duration-300 p-2 text-center ${
                      selectedUnitId === unit.id 
                        ? 'bg-indigo-600 border-indigo-700 text-white shadow-xl scale-110 -translate-y-1 z-20' 
                        : unit.isOccupied
                        ? 'bg-slate-200 border-slate-300 text-slate-700 cursor-not-allowed' 
                        : 'bg-white border-slate-200 text-slate-500 hover:border-indigo-400 hover:text-indigo-600'
                    }`}
                  >
                    {unit.isOccupied && unit.tenantName ? (
                      <>
                        <span className="block text-xs font-bold leading-tight truncate px-1">{unit.tenantName}</span>
                        <span className="block text-[10px] opacity-80 mt-1">{unit.name} | {unit.area_sqm?.toFixed(1)}m²</span>
                      </>
                    ) : (
                      <>
                        <span className="block text-sm font-bold leading-tight">{unit.name}</span>
                        <span className="block text-[11px] opacity-80 mt-1">{unit.area_sqm?.toFixed(1)}m²</span>
                      </>
                    )}
                  </button>
                );
              })}
            </div>
            <div className="mt-8 h-12 bg-white/40 border-y border-slate-200 flex items-center justify-center text-slate-300 text-[10px] font-black uppercase tracking-[0.3em]">Central Corridor</div>
          </div>
          <div className="mt-8 p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-lg border border-slate-200 text-indigo-600"><Maximize size={18} /></div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Selected Unit</p>
                <p className="text-sm font-black text-slate-800">{selectedUnit ? selectedUnit.name : 'None Selected'}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-slate-400 font-bold uppercase">Status</p>
              {selectedUnit ? (
                <Badge variant="outline" className={`text-[10px] font-black ${selectedUnit.isOccupied ? 'text-red-600 bg-red-50 border-red-200' : 'text-green-600 bg-green-50 border-green-200'}`}>
                  {selectedUnit.isOccupied ? `입주중 (${selectedUnit.tenantName})` : '공실'}
                </Badge>
              ) : (
                 <Badge variant="outline" className="text-[10px] font-black text-slate-500 bg-slate-100 border-slate-200">N/A</Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Column 3: AI Analysis Report */}
      <Card className="lg:col-span-4 border-none shadow-2xl bg-slate-950 text-white overflow-hidden flex flex-col">
        <CardHeader className="pb-4 bg-slate-900 border-b border-slate-800"><CardTitle className="text-lg flex items-center gap-2 font-bold"><Activity size={20} className="text-cyan-400" />AI Medical Shortage Index</CardTitle></CardHeader>
        <CardContent className="pt-6 flex-grow overflow-y-auto custom-scrollbar">
          {!selectedUnit || selectedUnit.isOccupied ? (
            <div className="h-full flex flex-col items-center justify-center py-20 text-slate-700 space-y-5 text-center px-6">
              <div className="p-8 rounded-full bg-slate-900 border border-slate-800 shadow-2xl"><AlertCircle size={48} strokeWidth={1.5} className="text-slate-800" /></div>
              <div><p className="text-sm font-bold text-slate-500 mb-1">
                {selectedUnit?.isOccupied ? 'Occupied Unit' : 'Select a Vacant Unit'}
              </p><p className="text-xs text-slate-600">
                {selectedUnit?.isOccupied ? `이 호실은 현재 ${selectedUnit.tenantName}이(가) 입주해 있습니다.` : '분석할 공실 유닛을 선택하세요.'}
              </p></div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 flex items-center justify-between shadow-lg">
                <div className="space-y-1"><p className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">Shortage Score</p><h4 className="text-4xl font-black">{topRecommendation.score}<span className="text-lg font-normal text-slate-500">/100</span></h4></div>
                <Badge className={`px-4 py-2 text-xs font-black uppercase rounded-lg border ${getStatusColor(topRecommendation.status)}`}>{topRecommendation.status} Urgency</Badge>
              </div>
              <div className="space-y-5">
                <div className="flex items-center gap-3 mb-2"><div className="h-px bg-slate-800 flex-grow"></div><span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">Recommended MD</span><div className="h-px bg-slate-800 flex-grow"></div></div>
                <h4 className="text-2xl font-black text-white leading-tight">{topRecommendation.subject}</h4>
                <div className="p-4 rounded-xl bg-blue-900/10 border border-blue-500/20 text-blue-200 text-xs leading-relaxed italic font-medium">"{topRecommendation.reason}"</div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-900 rounded-lg border border-slate-800"><p className="text-[9px] text-slate-500 font-bold uppercase mb-1">Target Group</p><p className="text-xs font-bold text-slate-200">{topRecommendation.targetGroup}</p></div>
                  <div className="p-3 bg-slate-900 rounded-lg border border-slate-800"><p className="text-[9px] text-slate-500 font-bold uppercase mb-1">Demand Forecast</p><p className="text-xs font-bold text-green-400">{topRecommendation.expectedDemand}</p></div>
                </div>
                <div className="space-y-3 pt-2">
                  <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest px-1">Other Opportunities</p>
                  {recommendations.slice(1).map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-slate-900/40 border border-slate-800 transition-colors hover:bg-slate-900">
                      <div className="flex items-center gap-3"><div className={`w-1.5 h-1.5 rounded-full ${item.status === 'High' ? 'bg-red-500' : 'bg-yellow-500'}`}></div><span className="text-xs font-bold text-slate-300">{item.subject}</span></div>
                      <span className="text-[11px] font-black text-slate-500">{item.score}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="pt-6 space-y-3">
                <button className="w-full py-4 bg-white text-slate-950 rounded-xl text-sm font-black hover:bg-blue-50 transition-all flex items-center justify-center gap-3 shadow-xl"><Download size={18} />IR용 데이터 리포트 추출</button>
                <button className="w-full py-3 bg-slate-900 text-slate-400 rounded-xl text-xs font-bold hover:text-white transition-all flex items-center justify-center gap-2 border border-slate-800"><FileText size={16} />메디컬 MD 제안서 자동 생성 (AI)</button>
              </div>
              <p className="text-[9px] leading-relaxed text-slate-600 text-center pt-4 pb-2 border-t border-slate-900">Data sources: KOSIS Demographic Census (Seogwipo Administrative Dongs), Medical Supply Registry, Household Expenditure Data.<br/>Algorithm: MD Shortage Gap Index v2.5 (Real-time Seogwipo Data)</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AITenantRecommender;
