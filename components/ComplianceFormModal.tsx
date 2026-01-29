
import React, { useState, useEffect } from 'react';
import { X, Calendar, RefreshCcw, User, ShieldCheck, AlertCircle, Camera } from 'lucide-react';
import { Facility, AssetCategory } from '../types';

interface ComplianceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (facility: Facility) => void;
}

const CATEGORIES: AssetCategory[] = ['HVAC', 'Electrical', 'Fire', 'Structural', 'Elevator'];

const ComplianceFormModal: React.FC<ComplianceFormModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState<Partial<Facility>>({
    name: '',
    area: '',
    category: 'Electrical',
    lastInspectionDate: new Date().toISOString().split('T')[0],
    cycleMonths: 12,
    manager: '',
    inspectionTypeDetail: '정기검사'
  });

  const [nextDate, setNextDate] = useState('');
  const [dDay, setDDay] = useState<number | null>(null);

  useEffect(() => {
    if (formData.lastInspectionDate && formData.cycleMonths) {
      const last = new Date(formData.lastInspectionDate);
      const next = new Date(last.setMonth(last.getMonth() + Number(formData.cycleMonths)));
      const nextStr = next.toISOString().split('T')[0];
      setNextDate(nextStr);

      const today = new Date();
      const diffTime = next.getTime() - today.getTime();
      const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setDDay(days);
    }
  }, [formData.lastInspectionDate, formData.cycleMonths]);

  const getDDayBadge = (days: number) => {
    if (days < 0) return { label: '기간 만료', color: 'bg-black text-white' };
    if (days <= 7) return { label: `치명적 (D-${days})`, color: 'bg-red-600 text-white animate-pulse' };
    if (days <= 30) return { label: `주의 (D-${days})`, color: 'bg-amber-500 text-white' };
    return { label: `안전 (D-${days})`, color: 'bg-emerald-500 text-white' };
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.lastInspectionDate) {
      alert("필수 항목을 입력해주세요.");
      return;
    }
    
    onSubmit({
      ...formData as Facility,
      id: `F${Date.now()}`,
      nextInspectionDate: nextDate
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in duration-200">
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="text-xl font-black text-slate-800 tracking-tight">스마트 컴플라이언스 스케줄러</h3>
            <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mt-1">법정검사 스케줄 자동 관리 시스템</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <X className="w-6 h-6 text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-[11px] font-black text-slate-500 uppercase mb-1.5 ml-1">시설물 명칭</label>
              <input 
                type="text"
                required
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                placeholder="예: 1호기 승강기, 주 변전실"
                className="w-full bg-slate-100 border-none rounded-2xl px-5 py-3 text-sm focus:ring-2 focus:ring-indigo-500 font-medium"
              />
            </div>
            
            <div>
              <label className="block text-[11px] font-black text-slate-500 uppercase mb-1.5 ml-1">설치 구역</label>
              <input 
                type="text"
                value={formData.area}
                onChange={e => setFormData({...formData, area: e.target.value})}
                placeholder="예: 웰니스몰 B1"
                className="w-full bg-slate-100 border-none rounded-2xl px-5 py-3 text-sm focus:ring-2 focus:ring-indigo-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-[11px] font-black text-slate-500 uppercase mb-1.5 ml-1">카테고리</label>
              <select 
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value as AssetCategory})}
                className="w-full bg-slate-100 border-none rounded-2xl px-5 py-3 text-sm focus:ring-2 focus:ring-indigo-500 font-bold"
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="p-5 bg-indigo-50 rounded-3xl border border-indigo-100 space-y-4">
            <div className="flex items-center gap-2 text-indigo-700 font-black text-xs uppercase mb-1">
              <RefreshCcw className="w-4 h-4" />
              검사 주기 자동 계산 로직
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-indigo-400 uppercase mb-1 ml-1">최근 검사일</label>
                <input 
                  type="date"
                  value={formData.lastInspectionDate}
                  onChange={e => setFormData({...formData, lastInspectionDate: e.target.value})}
                  className="w-full bg-white border-none rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 font-bold text-slate-700"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-indigo-400 uppercase mb-1 ml-1">검사 주기 (개월)</label>
                <input 
                  type="number"
                  min="1"
                  value={formData.cycleMonths}
                  onChange={e => setFormData({...formData, cycleMonths: parseInt(e.target.value)})}
                  className="w-full bg-white border-none rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 font-bold text-slate-700"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-indigo-100">
              <div className="text-indigo-900">
                <p className="text-[10px] font-black opacity-60 uppercase">산출된 차기 검사일</p>
                <p className="text-lg font-black">{nextDate}</p>
              </div>
              {dDay !== null && (
                <div className={`px-4 py-2 rounded-xl text-[11px] font-black shadow-lg ${getDDayBadge(dDay).color}`}>
                  {getDDayBadge(dDay).label}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-black text-slate-500 uppercase mb-1.5 ml-1">검사 유형 상세</label>
              <select 
                value={formData.inspectionTypeDetail}
                onChange={e => setFormData({...formData, inspectionTypeDetail: e.target.value})}
                className="w-full bg-slate-100 border-none rounded-2xl px-5 py-3 text-sm focus:ring-2 focus:ring-indigo-500"
              >
                <option value="정기검사">정기검사</option>
                <option value="정밀안전진단">정밀안전진단</option>
                <option value="자체점검">자체점검</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-black text-slate-500 uppercase mb-1.5 ml-1">현장 담당자</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text"
                  value={formData.manager}
                  onChange={e => setFormData({...formData, manager: e.target.value})}
                  placeholder="담당자 성함"
                  className="w-full bg-slate-100 border-none rounded-2xl pl-11 pr-5 py-3 text-sm focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" className="flex-1 flex items-center justify-center gap-2 py-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 hover:text-indigo-600 hover:border-indigo-200 transition-all">
              <Camera className="w-5 h-5" />
              <span className="text-xs font-black">보고서 업로드</span>
            </button>
            <button 
              type="submit"
              className="flex-[1.5] py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl shadow-xl shadow-indigo-100 transition-all flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-5 h-5" />
              자산 스케줄 등록
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ComplianceFormModal;
