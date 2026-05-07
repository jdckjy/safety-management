import React, { useState, useMemo } from 'react';
import { HotSpot, Facility } from '../types';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { X } from 'lucide-react';

interface NewHotspotModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddHotspot: (hotspot: Omit<HotSpot, 'id'>) => void;
  position: { lat: number; lng: number };
  facilities: Facility[];
}

const RESPONSE_TYPES = { 
  PERIODIC: '주기적', 
  URGENT: '긴급', 
  NORMAL: '일반' 
};
const RISK_LEVELS = { 
  HIGH: 'Level 3 (높음)', 
  MEDIUM: 'Level 2 (중간)', 
  LOW: 'Level 1 (낮음)' 
};

const NewHotspotModal: React.FC<NewHotspotModalProps> = ({ isOpen, onClose, onAddHotspot, position, facilities }) => {
  const [description, setDescription] = useState('');
  const [responseType, setResponseType] = useState(Object.keys(RESPONSE_TYPES)[0]);
  const [riskLevel, setRiskLevel] = useState(Object.keys(RISK_LEVELS)[2]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);

  const filteredFacilities = useMemo(() => {
    // 이제 name은 항상 string이므로, 더 간단하고 안전한 로직으로 충분합니다.
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return (facilities || []).filter(facility => 
      facility.name.toLowerCase().includes(lowerCaseSearchTerm)
    );
  }, [searchTerm, facilities]);


  const handleAddClick = () => {
    if (!selectedFacility) {
      alert("시설물을 선택해주세요.");
      return;
    }

    const newHotspot: Omit<HotSpot, 'id'> = {
      position,
      title: selectedFacility.name,
      description,
      riskLevel: RISK_LEVELS[riskLevel as keyof typeof RISK_LEVELS],
      responseType: RESPONSE_TYPES[responseType as keyof typeof RESPONSE_TYPES],
      facilityId: selectedFacility.id,
    };
    onAddHotspot(newHotspot);
    onClose(); 
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl mx-auto p-8 space-y-6 relative" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <X size={24} />
        </button>
        
        <h2 className="text-2xl font-bold text-gray-800">신규 노드 생성</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left column for facility search and selection */}
          <div className="flex flex-col space-y-4">
            <label className="font-semibold text-gray-700">시설물 검색</label>
            <Input 
              type="text"
              placeholder="시설물 명칭 입력..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full"
            />
            <div className="border rounded-lg h-60 overflow-y-auto bg-gray-50">
              {filteredFacilities.map(facility => (
                <div 
                  key={facility.id} 
                  onClick={() => setSelectedFacility(facility)}
                  className={`p-3 cursor-pointer hover:bg-blue-100 ${selectedFacility?.id === facility.id ? 'bg-blue-200' : ''}`}>
                  <p className="font-semibold">{facility.name}</p>
                  <p className="text-sm text-gray-500">{facility.type} - {facility.status}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right column for details */}
          <div className="flex flex-col space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="font-semibold text-gray-700">대응 타입</label>
                  <div className="flex mt-2 rounded-lg border p-1 bg-gray-100">
                      <Button
                          onClick={() => setResponseType('NORMAL')}
                          className={`flex-1 text-center text-sm py-2 rounded-md transition-colors ${
                              responseType === 'NORMAL' ? 'bg-white text-black shadow' : 'bg-transparent text-gray-500'
                          }`}
                      >
                          정기
                      </Button>
                      <Button
                          onClick={() => setResponseType('URGENT')}
                          className={`flex-1 text-center text-sm py-2 rounded-md transition-colors ${
                              responseType === 'URGENT' ? 'bg-red-500 text-white shadow' : 'bg-transparent text-gray-500'
                          }`}
                      >
                          긴급
                      </Button>
                  </div>
              </div>
              <div>
                <label htmlFor="riskLevel" className="font-semibold text-gray-700">위험도</label>
                <Select value={riskLevel} onValueChange={setRiskLevel}>
                    <SelectTrigger className="w-full mt-2">
                        <SelectValue placeholder="위험도 선택" />
                    </SelectTrigger>
                    <SelectContent>
                        {Object.entries(RISK_LEVELS).map(([key, value]) => (
                            <SelectItem key={key} value={key}>{value}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <label htmlFor="description" className="font-semibold text-gray-700">상황 요약 및 보고</label>
              <Textarea
                id="description"
                placeholder="현장 보고 사항 및 상세 내용을 입력하세요..."
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="mt-2 h-44"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button 
            onClick={handleAddClick}
            className="w-full bg-gray-800 text-white font-bold py-3 text-base hover:bg-black transition-colors rounded-lg">
            신규 노드 등록 확정
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NewHotspotModal;
