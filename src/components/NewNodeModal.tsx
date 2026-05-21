
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { X, Search, UploadCloud, Camera } from 'lucide-react';
import { Facility, HotSpot } from '../types';

// This local type can now handle both newly selected files (File object) and existing URLs (string)
interface AttachmentSource {
  file?: File;
  preview: string; // For both Blob URLs and existing http URLs
}

// The data passed to the onRegister function
type HotspotSubmitData = (Omit<HotSpot, 'id' | 'attachments'> | HotSpot) & {
   attachments?: (File | string)[];
};


interface NewNodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegister: (data: HotspotSubmitData) => void;
  location: { lat: number; lng: number } | null;
  facilities: Facility[];
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
  const [riskLevel, setRiskLevel] = useState<HotSpot['riskLevel']>('low');
  const [description, setDescription] = useState('');
  const [attachments, setAttachments] = useState<AttachmentSource[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isEditing = !!editingHotspot;

  useEffect(() => {
    if (!isOpen) return;

    if (isEditing && editingHotspot) {
      const facility = facilities.find(f => f.id === editingHotspot.facilityId) || null;
      setSelectedFacility(facility);
      setResponseType(editingHotspot.responseType || '정기');
      setRiskLevel(editingHotspot.riskLevel || 'low');
      setDescription(editingHotspot.description || '');
      setSearchTerm(facility?.name || '');
      
      // If there are existing attachments (URLs), map them to the state
      const existingAttachments = editingHotspot.attachments?.map(url => ({ preview: url })) || [];
      setAttachments(existingAttachments);

    } else {
      // Reset all fields for a new node
      setSearchTerm('');
      setSelectedFacility(null);
      setResponseType('정기');
      setRiskLevel('low');
      setDescription('');
      setAttachments([]);
    }
  }, [editingHotspot, facilities, isOpen, isEditing]);

  // Cleanup blob URLs
  useEffect(() => {
    return () => {
      attachments.forEach(attachment => {
        // Only revoke if it's a blob URL created for a local file preview
        if (attachment.file) {
          URL.revokeObjectURL(attachment.preview);
        }
      });
    };
  }, [attachments]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredFacilities = useMemo(() => {
    if (!searchTerm) return facilities;
    return facilities.filter(f => f.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [facilities, searchTerm]);
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files).filter(file => file.type.startsWith('image/'));
      const newAttachments = filesArray.map(file => ({
        file,
        preview: URL.createObjectURL(file),
      }));
      setAttachments(prev => [...prev, ...newAttachments]);
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setAttachments(prev => {
      const attachmentToRemove = prev[indexToRemove];
      // If it was a newly added file, revoke its blob URL
      if (attachmentToRemove && attachmentToRemove.file) {
        URL.revokeObjectURL(attachmentToRemove.preview);
      }
      return prev.filter((_, index) => index !== indexToRemove);
    });
  };

  const handleSubmit = () => {
    const finalLocation = isEditing ? editingHotspot!.position : location;
    if (!selectedFacility || !finalLocation) {
      alert('시설물과 위치 정보를 확인해주세요.');
      return;
    }

    // Separate new files from existing URLs
    const filesToUpload = attachments.map(a => a.file).filter(f => f instanceof File) as File[];
    const existingUrls = attachments.filter(a => !a.file).map(a => a.preview);

    const hotspotData: HotspotSubmitData = {
      title: selectedFacility.name,
      description: description,
      facilityId: selectedFacility.id,
      responseType,
      riskLevel,
      position: finalLocation,
      attachments: [...existingUrls, ...filesToUpload],
    };

    if (isEditing) {
      onRegister({ ...editingHotspot, ...hotspotData });
    } else {
      onRegister(hotspotData);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[2000]">
      <div className="bg-white rounded-3xl w-full max-w-3xl shadow-2xl m-4 flex flex-col">
        <div className="p-6 border-b">
           <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 text-blue-600 p-2 rounded-full">
                <Camera size={20} />
              </div>
              <h2 className="text-xl font-bold text-gray-900">{isEditing ? '노드 정보 수정' : '신규 노드 생성'}</h2>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
          </div>
        </div>

        <div className="p-8 grid grid-cols-2 gap-8 flex-grow overflow-y-auto" style={{maxHeight: '75vh'}}>
          {/* Left Column */}
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-500 mb-2 block">시설물 검색</label>
              <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" placeholder="시설 명칭 입력..." value={searchTerm} onChange={handleSearchChange} className="w-full bg-gray-50 rounded-lg pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 border border-gray-200" />
              </div>
            </div>
            <div className="border border-gray-200 rounded-lg h-96 overflow-y-auto">
              {filteredFacilities.map(facility => (
                <div key={facility.id} onClick={() => { setSelectedFacility(facility); setSearchTerm(facility.name); }} className={`px-4 py-3 cursor-pointer ${selectedFacility?.id === facility.id ? 'bg-blue-50' : 'hover:bg-gray-50'}`}>
                  <p className="font-bold text-sm text-gray-800">{facility.name}</p>
                  <p className="text-xs text-gray-500">{facility.type}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-500">대응 타입</label>
                <div className="flex mt-2 bg-gray-100 rounded-lg p-1">
                  <button onClick={() => setResponseType('정기')} className={`w-full text-center text-sm py-1.5 rounded-lg transition-all ${responseType === '정기' ? 'bg-white shadow font-semibold text-gray-800' : 'text-gray-500'}`}>정기</button>
                  <button onClick={() => setResponseType('긴급')} className={`w-full text-center text-sm py-1.5 rounded-lg transition-all ${responseType === '긴급' ? 'bg-white shadow font-semibold text-gray-800' : 'text-gray-500'}`}>긴급</button>
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500">위험도</label>
                <select value={riskLevel} onChange={(e) => setRiskLevel(e.target.value as HotSpot['riskLevel'])} className="w-full mt-2 bg-gray-50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-200 text-gray-900">
                  <option value="low">Level 1 (낮음)</option>
                  <option value="medium">Level 2 (중간)</option>
                  <option value="high">Level 3 (높음)</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500">상황 요약 및 보고</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} placeholder="현장 보고 사항 및 상세 내용을 입력하세요..." className="w-full mt-2 bg-gray-50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-200 text-gray-900" />
            </div>

            {/* Photo Attachment Section */}
            <div>
              <label className="text-xs font-bold text-gray-500">사진 첨부</label>
              <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                  {attachments.map((image, index) => (
                    <div key={index} className="relative group aspect-square">
                      <img src={image.preview} alt={`preview ${index}`} className="h-full w-full object-cover rounded-md bg-gray-100" />
                      <button
                        onClick={() => handleRemoveImage(index)}
                        className="absolute top-1 right-1 p-0.5 bg-red-600 text-white rounded-full opacity-70 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                   <div
                    className="flex justify-center items-center w-full aspect-square border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="text-center">
                      <UploadCloud className="mx-auto h-6 w-6 text-gray-400" />
                      <p className="mt-1 text-xs text-gray-600">추가</p>
                    </div>
                  </div>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                className="hidden"
                accept="image/*"
                multiple
              />
            </div>
          </div>
        </div>

        <div className="p-6 bg-gray-50 border-t">
          <button onClick={handleSubmit} className="w-full bg-gray-900 text-white font-bold py-4 rounded-lg hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900">
            {isEditing ? '노드 정보 수정 완료' : '신규 노드 등록 확정'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewNodeModal;
