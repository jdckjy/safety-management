
import React, { useState, useMemo, useEffect } from 'react';
import { X, Search } from 'lucide-react';
import { Facility, HotSpot } from '../types'; // HotSpot 타입을 가져옵니다.

// HotSpot 데이터 타입에서 id를 제외한 타입을 생성합니다.
type NewHotSpotData = Omit<HotSpot, 'id'>;

interface NewNodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  // onRegister는 이제 새로운 데이터 또는 수정된 데이터를 받습니다.
  onRegister: (data: NewHotSpotData | HotSpot) => void;
  location: { lat: number; lng: number } | null;
  facilities: Facility[];
  // 수정할 기존 HotSpot 데이터를 받을 수 있도록 추가합니다.
  editingHotspot: HotSpot | null;
}

const NewNodeModal: React.FC<NewNodeModalProps> = ({
  isOpen,
  onClose,
  onRegister,
  location,
  facilities,
  editingHotspot,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);
  const [responseType, setResponseType] = useState<'정기' | '긴급'>('정기');
  const [riskLevel, setRiskLevel] = useState<'Level 1 (낮음)' | 'Level 2 (중간)' | 'Level 3 (높음)'>('Level 1 (낮음)');
  const [details, setDetails] = useState('');

  const isEditing = !!editingHotspot;

  // 수정 모드일 때 기존 데이터로 폼을 채웁니다.
  useEffect(() => {
    if (isEditing) {
      const facility = facilities.find(f => f.id === editingHotspot.facilityId) || null;
      setSelectedFacility(facility);
      setResponseType(editingHotspot.responseType);
      setRiskLevel(editingHotspot.riskLevel);
      setDetails(editingHotspot.details);
    } else {
      // 생성 모드일 때 폼을 초기화합니다.
      setSelectedFacility(null);
      setResponseType('정기');
      setRiskLevel('Level 1 (낮음)');
      setDetails('');
    }
  }, [editingHotspot, facilities, isOpen]);

  const filteredFacilities = useMemo(() =>
    facilities.filter(f =>
      f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.category.toLowerCase().includes(searchTerm.toLowerCase())
    ),
    [facilities, searchTerm]
  );

  if (!isOpen) return null;

  const handleSubmit = () => {
    const finalLocation = isEditing ? editingHotspot.position : location;
    if (!selectedFacility) {
      alert('시설물을 선택해주세요.');
      return;
    }
    if (!finalLocation) {
      alert('위치 정보가 없습니다.');
      return;
    }

    const hotspotData = {
      facilityId: selectedFacility.id,
      facilityName: selectedFacility.name,
      responseType,
      riskLevel,
      details,
      position: finalLocation,
    };

    if (isEditing) {
      onRegister({ ...hotspotData, id: editingHotspot.id });
    } else {
      onRegister(hotspotData);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[2000]">
      <div className="bg-white rounded-3xl w-full max-w-3xl shadow-2xl m-4">
        <div className="p-8">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
               {/* ... (기존 헤더 UI) ... */}
               <h2 className="text-xl font-bold text-gray-900">{isEditing ? '노드 정보 수정' : '신규 노드 생성'}</h2>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X size={24} />
            </button>
          </div>
          {/* ... (탭 부분은 숨김 처리) ... */}
        </div>

        <div className="p-8 grid grid-cols-2 gap-8">
          {/* Left Column */}
          <div>
            <label className="text-xs font-bold text-gray-500">시설물 검색</label>
            <div className="relative mt-2">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder="시설 명칭 입력..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-gray-50 rounded-lg pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="mt-4 border border-gray-200 rounded-lg h-60 overflow-y-auto">
              {filteredFacilities.map(facility => (
                <div key={facility.id} onClick={() => setSelectedFacility(facility)} className={`px-4 py-3 cursor-pointer ${selectedFacility?.id === facility.id ? 'bg-blue-50' : 'hover:bg-gray-50'}`}>
                  <p className="font-bold text-sm text-gray-800">{facility.name}</p>
                  <p className="text-xs text-gray-500">{facility.category}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-500">대응 타입</label>
                <div className="flex mt-2 bg-gray-100 rounded-lg p-1">
                  <button onClick={() => setResponseType('정기')} className={`w-full text-center text-sm py-1.5 rounded ${responseType === '정기' ? 'bg-white shadow' : ''}`}>정기</button>
                  <button onClick={() => setResponseType('긴급')} className={`w-full text-center text-sm py-1.5 rounded ${responseType === '긴급' ? 'bg-white shadow' : ''}`}>긴급</button>
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500">위험도</label>
                <select value={riskLevel} onChange={(e) => setRiskLevel(e.target.value as any)} className="w-full mt-2 bg-gray-50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-200">
                  <option>Level 1 (낮음)</option>
                  <option>Level 2 (중간)</option>
                  <option>Level 3 (높음)</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500">상황 요약 및 보고</label>
              <textarea value={details} onChange={(e) => setDetails(e.target.value)} rows={5} placeholder="현장 보고 사항 및 상세 내용을 입력하세요..." className="w-full mt-2 bg-gray-50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-200" />
            </div>
          </div>
        </div>

        <div className="p-8 border-t border-gray-200">
          <button onClick={handleSubmit} className="w-full bg-gray-900 text-white font-bold py-4 rounded-lg hover:bg-gray-800 transition-colors">
            {isEditing ? '노드 정보 수정 완료' : '신규 노드 등록 확정'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewNodeModal;
