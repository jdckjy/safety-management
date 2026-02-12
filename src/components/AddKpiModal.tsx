
import React, { useState } from 'react';
import { X, PlusCircle } from 'lucide-react';
import { KPI } from '../types';

interface AddKpiModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newKpi: Omit<KPI, 'id' | 'current' | 'activities' | 'pulse' | 'description' | 'previous'>) => void;
}

const AddKpiModal: React.FC<AddKpiModalProps> = ({ isOpen, onClose, onSave }) => {
  // *** BUG FIX: 데이터 모델과 일치시키기 위해 'name'을 'title'로 변경 ***
  const [title, setTitle] = useState('');
  const [target, setTarget] = useState<number | ''>('');
  const [unit, setUnit] = useState('');

  const handleSubmit = () => {
    if (!title || target === '' || !unit) {
      alert('모든 필드를 입력해주세요.');
      return;
    }
    // *** BUG FIX: onSave에 'title' 속성으로 데이터를 전달 ***
    const newKpiData = { title, target: Number(target), unit };
    
    // *** TRACING: 당신의 지시에 따라, 데이터 흐름 추적을 위한 console.log 추가 ***
    console.log('[Trace 1/3 - AddKpiModal] Saving new KPI data:', newKpiData);

    onSave(newKpiData);
    onClose();
    setTitle('');
    setTarget('');
    setUnit('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[2000] p-4">
      <div className="bg-white/95 rounded-3xl w-full max-w-md shadow-2xl flex flex-col">
        <header className="bg-gray-800 text-white p-6 rounded-t-3xl flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-2 rounded-lg"><PlusCircle size={24} /></div>
            <div>
              <h2 className="text-2xl font-bold">새 KPI 지표 추가</h2>
              <p className="text-sm opacity-80">성과를 측정할 새로운 지표를 등록합니다.</p>
            </div>
          </div>
          <button onClick={onClose} className="bg-white/20 p-2 rounded-full hover:bg-white/30 transition-colors"><X size={20} /></button>
        </header>
        
        <main className="p-6 space-y-4">
          <div>
            <label htmlFor="kpi-title" className="block text-sm font-bold text-gray-600 mb-1">지표명</label>
            <input
              id="kpi-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예: 무재해 일수"
              className="w-full p-3 bg-gray-100 rounded-lg border-2 border-transparent focus:border-blue-500 focus:bg-white focus:outline-none transition"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="kpi-target" className="block text-sm font-bold text-gray-600 mb-1">목표</label>
              <input
                id="kpi-target"
                type="number"
                value={target}
                onChange={(e) => setTarget(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="예: 1000"
                className="w-full p-3 bg-gray-100 rounded-lg border-2 border-transparent focus:border-blue-500 focus:bg-white focus:outline-none transition"
              />
            </div>
            <div>
              <label htmlFor="kpi-unit" className="block text-sm font-bold text-gray-600 mb-1">단위</label>
              <input
                id="kpi-unit"
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="예: 일, 건, %"
                className="w-full p-3 bg-gray-100 rounded-lg border-2 border-transparent focus:border-blue-500 focus:bg-white focus:outline-none transition"
              />
            </div>
          </div>
        </main>

        <footer className="p-6 bg-gray-50 rounded-b-3xl flex justify-end items-center border-t border-gray-200">
          <button onClick={onClose} className="text-gray-600 font-semibold px-6 py-3 mr-2">취소</button>
          <button onClick={handleSubmit} className="bg-blue-700 text-white font-bold px-8 py-3 rounded-lg hover:bg-blue-800 transition-transform active:scale-95">저장</button>
        </footer>
      </div>
    </div>
  );
};

export default AddKpiModal;
