
import React, { useState, useEffect } from 'react';
import { TenantUnit } from '../../types';

interface UnitDetailPanelProps {
  unit: TenantUnit;
  onUpdate: (updatedUnit: TenantUnit) => void;
}

const UnitDetailPanel: React.FC<UnitDetailPanelProps> = ({ unit, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedUnit, setEditedUnit] = useState(unit);

  useEffect(() => {
    setEditedUnit(unit);
  }, [unit]);

  const handleSave = () => {
    onUpdate(editedUnit);
    setIsEditing(false);
  };

  return (
    <div className="p-4 border rounded shadow-lg">
      <h3 className="text-lg font-bold mb-4">호실 정보</h3>
      {isEditing ? (
        <div>
          <div className="mb-2">
            <label className="block">입주기관</label>
            <input 
              type="text" 
              value={editedUnit.agency}
              onChange={(e) => setEditedUnit({...editedUnit, agency: e.target.value})}
              className="w-full p-1 border rounded"
            />
          </div>
          <div className="mb-2">
            <label className="block">용도</label>
            <input 
              type="text" 
              value={editedUnit.name}
              onChange={(e) => setEditedUnit({...editedUnit, name: e.target.value})}
              className="w-full p-1 border rounded"
            />
          </div>
          <div className="mb-2">
            <label className="block">상태</label>
            <select 
              value={editedUnit.status}
              onChange={(e) => setEditedUnit({...editedUnit, status: e.target.value as 'occupied' | 'vacant'})}
              className="w-full p-1 border rounded"
            >
              <option value="occupied">임대</option>
              <option value="vacant">미임대</option>
            </select>
          </div>
          <button onClick={handleSave} className="px-4 py-2 rounded bg-blue-500 text-white">저장</button>
          <button onClick={() => setIsEditing(false)} className="px-4 py-2 rounded bg-gray-300 ml-2">취소</button>
        </div>
      ) : (
        <div>
          <p><strong>호실 ID:</strong> {unit.id}</p>
          <p><strong>입주기관:</strong> {unit.agency}</p>
          <p><strong>용도:</strong> {unit.name}</p>
          <p><strong>면적:</strong> {unit.area} ㎡</p>
          <p><strong>상태:</strong> {unit.status === 'occupied' ? '임대' : '미임대'}</p>
          <button onClick={() => setIsEditing(true)} className="mt-4 px-4 py-2 rounded bg-blue-500 text-white">수정</button>
        </div>
      )}
    </div>
  );
};

export default UnitDetailPanel;
