
import React, { useState, useMemo, useEffect } from 'react';
import { InspectionLog, InspectionType, SeverityLevel, Facility, LogStatus, ComplexFacility } from '../types';
import { COMPLEX_FACILITY_LIST } from '../constants';
import { 
  X, 
  CheckCircle2, 
  Activity, 
  Trash2, 
  Search, 
  Building2, 
  Video, 
  AlertTriangle,
  RotateCcw,
  ShieldAlert
} from 'lucide-react';

interface LogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (log: Partial<InspectionLog>) => void;
  onDelete?: (id: string) => void;
  initialData?: Partial<InspectionLog>;
  facilities: Facility[];
}

const LogModal: React.FC<LogModalProps> = ({ isOpen, onClose, onSubmit, onDelete, initialData, facilities }) => {
  // 고정된 ID 참조 (리렌더링 시 유실 방지)
  const targetId = useMemo(() => initialData?.id, [initialData?.id]);

  const [formData, setFormData] = useState<Partial<InspectionLog>>({
    type: InspectionType.PLANNED,
    severity: SeverityLevel.LOW,
    status: LogStatus.ACTIVE,
    description: '',
    facilityId: facilities[0]?.id || 'F1',
    complexFacilityId: ''
  });

  const [activeTab, setActiveTab] = useState<'info' | 'cctv'>('info');
  const [facilitySearch, setFacilitySearch] = useState('');
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  const filteredComplexFacilities = useMemo(() => {
    return COMPLEX_FACILITY_LIST.filter(cf => 
      cf.content.toLowerCase().includes(facilitySearch.toLowerCase()) ||
      cf.categoryName.toLowerCase().includes(facilitySearch.toLowerCase())
    );
  }, [facilitySearch]);

  useEffect(() => {
    if (isOpen) {
      setIsConfirmingDelete(false);
      if (initialData) {
        setFormData(prev => ({ 
          ...prev, 
          ...initialData,
          complexFacilityId: initialData.complexFacilityId || ''
        }));
      } else {
        setFormData({
          type: InspectionType.PLANNED,
          severity: SeverityLevel.LOW,
          status: LogStatus.ACTIVE,
          description: '',
          facilityId: facilities[0]?.id || 'F1',
          complexFacilityId: ''
        });
      }
    }
  }, [isOpen, initialData, facilities]);

  const handleDescriptionChange = (val: string) => {
    let detectedType = formData.type;
    if (val.includes('점검')) detectedType = InspectionType.PLANNED;
    else if (val.includes('고장') || val.includes('수리')) detectedType = InspectionType.REACTIVE;
    setFormData({ ...formData, description: val, type: detectedType });
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!targetId || !onDelete) return;

    if (!isConfirmingDelete) {
      setIsConfirmingDelete(true);
    } else {
      onDelete(targetId);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-xl">
      <div className="bg-white rounded-[3rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in duration-300 border border-slate-200">
        
        {/* 상단 헤더 */}
        <div className="px-10 py-7 border-b border-slate-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-2xl text-white shadow-xl ${isConfirmingDelete ? 'bg-red-600 animate-pulse' : 'bg-indigo-600'}`}>
              {isConfirmingDelete ? <ShieldAlert className="w-6 h-6" /> : <Activity className="w-6 h-6" />}
            </div>
            <div>
              <h3 className="font-black text-slate-900 tracking-tight text-xl">
                {isConfirmingDelete ? '데이터 삭제 승인 대기' : (targetId ? `관제 노드 #${targetId}` : '신규 노드 생성')}
              </h3>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.25em] mt-0.5">Tactical Command Center</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-slate-100 rounded-full transition-all text-slate-400 hover:text-slate-900">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* 탭 메뉴 */}
        <div className="flex border-b border-slate-100 bg-slate-50/50">
          <button 
            type="button"
            onClick={() => setActiveTab('info')}
            className={`flex-1 py-5 text-[11px] font-black uppercase tracking-[0.2em] transition-all border-b-2 ${activeTab === 'info' ? 'border-indigo-600 text-indigo-600 bg-white' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
          >
            데이터 상세
          </button>
          <button 
            type="button"
            onClick={() => setActiveTab('cctv')}
            className={`flex-1 py-5 text-[11px] font-black uppercase tracking-[0.2em] transition-all border-b-2 ${activeTab === 'cctv' ? 'border-red-600 text-red-600 bg-white' : 'border-transparent text-slate-400 hover:text-red-600'}`}
          >
            라이브 피드
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto bg-white">
          {activeTab === 'info' ? (
            <form id="log-form" onSubmit={handleSubmit} className="p-10 space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-6">
                  <div>
                    <label className="block text-[11px] font-black text-slate-400 uppercase mb-3 tracking-widest">시설물 검색</label>
                    <div className="relative group">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                      <input 
                        type="text"
                        placeholder="시설 명칭 입력..."
                        value={facilitySearch}
                        onChange={(e) => setFacilitySearch(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-11 pr-5 py-4 text-sm focus:ring-4 focus:ring-indigo-500/10 font-bold transition-all"
                      />
                    </div>
                  </div>

                  <div className="h-72 overflow-y-auto border border-slate-100 rounded-[2rem] bg-slate-50/50 shadow-inner p-2 space-y-1">
                    {filteredComplexFacilities.map(cf => (
                      <button
                        key={cf.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, complexFacilityId: cf.id })}
                        className={`w-full text-left px-5 py-4 rounded-2xl transition-all flex items-center justify-between group ${formData.complexFacilityId === cf.id ? 'bg-white shadow-lg ring-1 ring-indigo-100' : 'hover:bg-white/60'}`}
                      >
                        <div>
                          <p className={`text-[13px] font-black ${formData.complexFacilityId === cf.id ? 'text-indigo-600' : 'text-slate-700'}`}>{cf.content}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{cf.categoryName}</p>
                        </div>
                        {formData.complexFacilityId === cf.id && <CheckCircle2 className="w-5 h-5 text-indigo-600" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-10">
                  <div className="grid grid-cols-2 gap-5 pt-2">
                    <div className="space-y-3">
                      <label className="block text-[10px] font-black text-slate-400 uppercase">대응 타입</label>
                      <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, type: InspectionType.PLANNED })}
                          className={`flex-1 py-3 text-[11px] font-black rounded-xl transition-all ${formData.type === InspectionType.PLANNED ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-400'}`}
                        >
                          정기
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, type: InspectionType.REACTIVE })}
                          className={`flex-1 py-3 text-[11px] font-black rounded-xl transition-all ${formData.type === InspectionType.REACTIVE ? 'bg-red-600 text-white shadow-lg shadow-red-200' : 'text-slate-400'}`}
                        >
                          긴급
                        </button>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <label className="block text-[10px] font-black text-slate-400 uppercase">위험도</label>
                      <select 
                        value={formData.severity}
                        onChange={(e) => setFormData({ ...formData, severity: parseInt(e.target.value) })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-xs font-black shadow-sm h-[52px]"
                      >
                        <option value={SeverityLevel.LOW}>Level 1 (낮음)</option>
                        <option value={SeverityLevel.MEDIUM}>Level 3 (보통)</option>
                        <option value={SeverityLevel.HIGH}>Level 5 (심각)</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">상황 요약 및 보고</label>
                    <textarea 
                      rows={8}
                      value={formData.description}
                      onChange={(e) => handleDescriptionChange(e.target.value)}
                      placeholder="현장 보고 사항 및 상황 상세 내용을 입력하세요..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-[2rem] px-6 py-6 text-sm font-medium focus:ring-4 focus:ring-indigo-500/10 shadow-inner"
                    />
                  </div>
                </div>
              </div>
            </form>
          ) : (
            <div className="p-10 space-y-8 bg-slate-950 text-white min-h-[500px] flex flex-col justify-center items-center text-center">
               <Video className="w-16 h-16 text-slate-800 animate-pulse mb-4" />
               <h4 className="text-xl font-black mb-2 uppercase tracking-widest">Signal Processing</h4>
               <p className="text-slate-500 text-sm font-medium">실시간 영상 스트림 분석 중입니다.</p>
            </div>
          )}
        </div>

        <div className="px-10 py-8 bg-slate-50 border-t border-slate-100 flex gap-4">
          {targetId && (
            <>
              <button 
                type="button" 
                onClick={handleDeleteClick}
                className={`h-16 rounded-[1.5rem] transition-all flex items-center justify-center gap-3 font-black shadow-xl overflow-hidden ${
                  isConfirmingDelete 
                    ? 'bg-red-600 text-white flex-[2] ring-8 ring-red-50' 
                    : 'bg-white text-slate-400 hover:text-red-600 border border-slate-200 w-20 active:scale-90'
                }`}
              >
                <Trash2 className="w-6 h-6" />
                {isConfirmingDelete && <span className="text-sm tracking-widest">최종 삭제 승인</span>}
              </button>
              
              {isConfirmingDelete && (
                <button 
                  type="button"
                  onClick={() => setIsConfirmingDelete(false)}
                  className="w-20 h-16 bg-white text-slate-500 rounded-[1.5rem] flex items-center justify-center border border-slate-200 active:scale-90 shadow-lg"
                >
                  <RotateCcw className="w-6 h-6" />
                </button>
              )}
            </>
          )}

          {!isConfirmingDelete && (
            <button 
              type="submit"
              form="log-form"
              className="flex-1 py-5 bg-slate-900 hover:bg-black text-white font-black rounded-[1.5rem] shadow-xl transition-all flex items-center justify-center gap-3 active:scale-95"
            >
              <CheckCircle2 className="w-6 h-6 text-indigo-400" />
              {targetId ? '관제 데이터 동기화' : '신규 노드 등록 확정'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default LogModal;
