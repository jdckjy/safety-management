
import React, { useState } from 'react';
import { X, PlusCircle } from 'lucide-react';
import { KPI } from '../types';

interface AddKpiModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newKpi: Omit<KPI, 'id' | 'current' | 'activities' | 'pulse'>) => void;
}

const AddKpiModal: React.FC<AddKpiModalProps> = ({ isOpen, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [target, setTarget] = useState<number | ''>('');
  const [unit, setUnit] = useState('');

  const handleSubmit = () => {
    if (!name || target === '' || !unit) {
      alert('모든 필드를 입력해주세요.');
      return;
    }
    onSave({ name, target: Number(target), unit });
    onClose();
    setName('');
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
            <label htmlFor="kpi-name" className="block text-sm font-bold text-gray-600 mb-1">지표명</label>
            <input
              id="kpi-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
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
