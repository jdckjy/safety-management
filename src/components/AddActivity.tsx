
import React, { useState, useRef, useEffect } from 'react';
import { PlusCircle, Check, X } from 'lucide-react';
import { useAppData } from '../providers/AppDataContext';

interface AddActivityProps {
  kpiId: string;
}

export const AddActivity: React.FC<AddActivityProps> = ({ kpiId }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const addInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { addActivityToKpi } = useAppData();

  useEffect(() => {
    if (isAdding && addInputRef.current) {
      addInputRef.current.focus();
    }
  }, [isAdding]);

  const handleAdd = async () => {
    if (name.trim() !== '') {
      await addActivityToKpi(kpiId, { name: name.trim() });
      setName('');
      // setIsAdding(false) will be handled by the blur event naturally
    }
    setIsAdding(false);
  };

  const handleCancel = () => {
    setName('');
    setIsAdding(false);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleAdd();
    if (e.key === 'Escape') handleCancel();
  };

  const handleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    // Check if the new focused element is a child of the container
    // If it is, do not close the input form
    if (e.currentTarget.contains(e.relatedTarget as Node)) {
      return;
    }
    handleCancel();
  };

  if (isAdding) {
    return (
      <div 
        ref={containerRef} 
        onBlur={handleBlur}
        className="bg-white p-2 mt-3 rounded-lg border border-orange-400 shadow-md flex items-center gap-2"
      >
        <PlusCircle size={18} className="text-orange-500 ml-1" />
        <input
          ref={addInputRef}
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="새 활동 이름 입력..."
          className="flex-grow bg-transparent focus:outline-none font-semibold text-gray-800 placeholder:text-gray-400"
          onKeyDown={handleKeyDown}
        />
        {/* Use onMouseDown to trigger before onBlur */}
        <button onMouseDown={handleAdd} className="p-1 text-gray-500 hover:text-green-600"><Check size={16} /></button>
        <button onMouseDown={handleCancel} className="p-1 text-gray-500 hover:text-red-600"><X size={16} /></button>
      </div>
    );
  }

  return (
    <div className="mt-4">
      <button
        onClick={() => setIsAdding(true)}
        className="w-full flex items-center justify-center gap-2 text-sm font-semibold text-gray-600 hover:text-orange-600 py-2 rounded-lg transition-colors bg-gray-200/50 hover:bg-gray-200/80"
      >
        <PlusCircle size={16} />
        Add New Activity
      </button>
    </div>
  );
};
