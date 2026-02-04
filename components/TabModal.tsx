
import React, { useState } from 'react';
import { X, Check, Layout, Palette } from 'lucide-react';
import { CustomTab } from '../types';

interface TabModalProps {
  onClose: () => void;
  onSave: (tab: CustomTab) => void;
}

const TabModal: React.FC<TabModalProps> = ({ onClose, onSave }) => {
  const [label, setLabel] = useState('');
  const [color, setColor] = useState<CustomTab['color']>('orange');

  const colorOptions: { val: CustomTab['color'], class: string }[] = [
    { val: 'orange', class: 'bg-pink-500' },
    { val: 'blue', class: 'bg-blue-400' },
    { val: 'emerald', class: 'bg-black' },
    { val: 'purple', class: 'bg-gray-300' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim()) return;
    
    const newTab: CustomTab = {
      key: `custom-${Date.now()}`,
      label: label.trim(),
      color: color
    };
    
    onSave(newTab);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/5 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-md rounded-5xl shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-8 duration-500 border border-gray-50">
        <div className="p-10">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-2xl font-black tracking-tight text-[#1A1D1F]">Add New folder</h2>
            <button onClick={onClose} className="p-2.5 hover:bg-gray-50 rounded-full transition-colors text-gray-300 hover:text-black">
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-10">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-1">Folder Name</label>
              <input 
                autoFocus
                type="text"
                placeholder="e.g. Sales list, Goals"
                className="w-full px-6 py-4 bg-gray-50 rounded-3xl text-sm font-bold outline-none border border-transparent focus:border-gray-200 focus:bg-white transition-all shadow-inner"
                value={label}
                onChange={e => setLabel(e.target.value)}
                required
              />
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-1">Theme Palette</label>
              <div className="flex gap-4 px-1">
                {colorOptions.map((opt) => (
                  <button
                    key={opt.val}
                    type="button"
                    onClick={() => setColor(opt.val)}
                    className={`w-12 h-12 rounded-2xl transition-all flex items-center justify-center ${opt.class} ${
                      color === opt.val ? 'scale-110 shadow-lg ring-4 ring-offset-4 ring-gray-100' : 'opacity-40 hover:opacity-100'
                    }`}
                  >
                    {color === opt.val && <Check size={20} className="text-white" strokeWidth={4} />}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button 
                type="button"
                onClick={onClose}
                className="flex-1 py-4 rounded-3xl font-black text-gray-400 hover:bg-gray-50 transition-colors text-sm"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="flex-1 bg-black text-white py-4 rounded-3xl font-black text-sm flex items-center justify-center gap-2 shadow-xl hover:scale-[1.02] active:scale-95 transition-all"
              >
                Create folder
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TabModal;
