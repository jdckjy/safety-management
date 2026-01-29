
import React, { useState, useEffect } from 'react';
import { InspectionItem } from '../types';
import { X, CheckCircle2, ListChecks, Type, Clock, FileText } from 'lucide-react';

interface InspectionItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (item: Partial<InspectionItem>) => void;
  initialData?: InspectionItem;
}

const InspectionItemModal: React.FC<InspectionItemModalProps> = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [formData, setFormData] = useState<Partial<InspectionItem>>({
    classification: '정기점검',
    target: '',
    cycle: '',
    remarks: ''
  });

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData(initialData);
      } else {
        setFormData({
          classification: '정기점검',
          target: '',
          cycle: '',
          remarks: ''
        });
      }
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.target || !formData.cycle) {
      alert("점검 대상과 주기를 입력해주세요.");
      return;
    }
    onSubmit(formData);
    onClose();
  };

  const classifications: InspectionItem['classification'][] = ['정기점검', '법정검사', '긴급점검', '특별점검'];

  const getButtonStyle = (type: InspectionItem['classification'], current: InspectionItem['classification']) => {
    const isActive = type === current;
    switch(type) {
      case '정기점검': return isActive ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-100';
      case '법정검사': return isActive ? 'bg-violet-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-100';
      case '긴급점검': return isActive ? 'bg-rose-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-100';
      case '특별점검': return isActive ? 'bg-amber-500 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-100';
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xl">
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in duration-200 border border-white/20">
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg">
              <ListChecks className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-800 tracking-tight">{initialData ? '점검 항목 수정' : '신규 점검 항목 등록'}</h3>
              <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mt-1">Maintenance Protocol Manager</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <X className="w-6 h-6 text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div>
            <label className="block text-[11px] font-black text-slate-400 uppercase mb-3 ml-1 tracking-widest">점검 구분 선택</label>
            <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
              {classifications.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setFormData({ ...formData, classification: c })}
                  className={`py-3 text-[11px] font-black rounded-xl transition-all ${getButtonStyle(c, formData.classification as any)}`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-[11px] font-black text-slate-400 uppercase mb-2 ml-1 tracking-widest">점검 대상 (설비명)</label>
              <div className="relative group">
                <Type className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                <input 
                  type="text"
                  required
                  value={formData.target}
                  onChange={e => setFormData({ ...formData, target: e.target.value })}
                  placeholder="예: 전기설비, 비상발전기"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-11 pr-5 py-3.5 text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-black text-slate-400 uppercase mb-2 ml-1 tracking-widest">점검 주기</label>
              <div className="relative group">
                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                <input 
                  type="text"
                  required
                  value={formData.cycle}
                  onChange={e => setFormData({ ...formData, cycle: e.target.value })}
                  placeholder="예: 일일, 주 1회, 6월-8월"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-11 pr-5 py-3.5 text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-black text-slate-400 uppercase mb-2 ml-1 tracking-widest">비고</label>
              <div className="relative group">
                <FileText className="absolute left-4 top-4 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                <textarea 
                  rows={3}
                  value={formData.remarks}
                  onChange={e => setFormData({ ...formData, remarks: e.target.value })}
                  placeholder="추가 설명이나 특이사항을 입력하세요 (선택)"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-11 pr-5 py-4 text-sm font-medium focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
                />
              </div>
            </div>
          </div>

          <button 
            type="submit"
            className="w-full py-5 bg-slate-900 hover:bg-black text-white font-black rounded-2xl shadow-xl shadow-slate-100 transition-all flex items-center justify-center gap-3 active:scale-95"
          >
            <CheckCircle2 className="w-6 h-6 text-indigo-400" />
            {initialData ? '항목 수정 완료' : '점검 계획 등록'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default InspectionItemModal;
