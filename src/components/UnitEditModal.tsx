
// src/components/UnitEditModal.tsx
import React, { useState, useEffect } from 'react';
import { Unit } from '../types';
import { UNIT_STATUS, UNIT_STATUS_DISPLAY_NAMES } from '../constants';
import { Trash2 } from 'lucide-react'; // [파괴] 아이콘 추가

interface UnitEditModalProps {
  unit: Partial<Unit> | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedUnit: Partial<Unit>) => void;
  onDelete: (unitId: string) => void; // [파괴] 삭제 핸들러 추가
  isCreating: boolean;
}

const UnitEditModal: React.FC<UnitEditModalProps> = ({ unit, isOpen, onClose, onSave, onDelete, isCreating }) => {
  const [formData, setFormData] = useState<Partial<Unit>>({});

  useEffect(() => {
    if (unit) setFormData({ ...unit });
  }, [unit]);

  // ... (handleInputChange, handleSubmit functions are unchanged) ...

  const handleDeleteClick = () => {
    if (window.confirm(`유닛 '${unit?.id}'을(를) 정말로 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`)) {
      if (unit?.id) {
        onDelete(unit.id);
      }
    }
  };

  if (!isOpen) return null;

  // ... (isVacant, modalTitle definitions are unchanged) ...

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">{isCreating ? '신규 유닛 생성' : `유닛 정보 편집 (${unit?.id})`}</h2>
        <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }}>
          {/* ... (Form fields are unchanged) ... */}

          <div className="mt-8 flex justify-between items-center">
            {/* [파괴] 삭제 버튼 (편집 모드에서만 표시) */}
            {!isCreating && (
              <button
                type="button"
                onClick={handleDeleteClick}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
              >
                <Trash2 size={18} />
                <span>삭제</span>
              </button>
            )}
            
            <div className="flex-grow flex justify-end space-x-4">
              <button type="button" onClick={onClose} className="px-6 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg">취소</button>
              <button type="submit" className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg">저장</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UnitEditModal;
