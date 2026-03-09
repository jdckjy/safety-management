
import React, { useState, useEffect } from 'react';
import { TenantUnit, LeaseStatus } from '../../types';

interface UnitDetailPanelProps {
  unit: TenantUnit | null; // 선택된 유닛 데이터, 없으면 null
  onUpdate: (updatedUnit: TenantUnit) => void; // 유닛 정보 업데이트 시 호출될 함수
}

/**
 * 호실의 상세 정보를 표시하고 수정하는 패널 컴포넌트
 */
export const UnitDetailPanel: React.FC<UnitDetailPanelProps> = ({ unit, onUpdate }) => {
  // 수정 폼을 위한 내부 상태
  const [tenant, setTenant] = useState('');
  const [status, setStatus] = useState<LeaseStatus>('미임대');

  // 선택된 유닛이 변경될 때마다 내부 상태를 업데이트
  useEffect(() => {
    if (unit) {
      setTenant(unit.tenant);
      setStatus(unit.status);
    } else {
      // 선택이 해제되면 폼 초기화
      setTenant('');
      setStatus('미임대');
    }
  }, [unit]);

  if (!unit) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50 rounded-lg">
        <div className="text-center text-gray-500">
          <p className="font-semibold">호실을 선택하세요</p>
          <p className="text-sm">도면에서 호실을 클릭하여 상세 정보를 확인하고 수정할 수 있습니다.</p>
        </div>
      </div>
    );
  }

  const handleSave = () => {
    // 변경된 데이터로 새로운 유닛 객체 생성
    const updatedUnit: TenantUnit = {
      ...unit,
      tenant,
      status,
    };
    onUpdate(updatedUnit);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-bold text-gray-500 text-sm uppercase tracking-wider">{unit.id} / {unit.name}</h3>
        <p className="text-2xl font-bold">{unit.tenant}</p>
      </div>

      <div className="space-y-4">
        {/* 입주기관 수정 */}
        <div>
          <label htmlFor="tenant-name" className="block text-sm font-medium text-gray-700">입주 기관</label>
          <input
            type="text"
            id="tenant-name"
            value={tenant}
            onChange={(e) => setTenant(e.target.value)}
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>

        {/* 임대 상태 수정 */}
        <div>
          <label htmlFor="lease-status" className="block text-sm font-medium text-gray-700">임대 상태</label>
          <select
            id="lease-status"
            value={status}
            onChange={(e) => setStatus(e.target.value as LeaseStatus)}
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="임대">임대</option>
            <option value="미임대">미임대</option>
          </select>
        </div>

        {/* 면적 정보 (읽기 전용) */}
        <div>
            <p className="text-sm text-gray-500">면적: {unit.area} ㎡</p>
        </div>
      </div>

      <button
        onClick={handleSave}
        className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-300 shadow-sm"
      >
        저장
      </button>
    </div>
  );
};
