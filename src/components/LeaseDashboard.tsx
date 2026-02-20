
// src/components/LeaseDashboard.tsx
import React from 'react';
import { useAppData } from '../providers/AppDataContext';

/**
 * [전문 부서] 건물 전체의 임대 현황, 주요 KPI, 최근 활동 등을
 * 종합적으로 요약하여 보여주는 대시보드 컴포넌트입니다.
 */
const LeaseDashboard: React.FC = () => {
  const { buildings, leads } = useAppData();

  // [✨ 최종 수정] 데이터 로딩 중 또는 데이터가 없을 때 발생하는 런타임 에러를 원천적으로 차단합니다.
  // optional chaining(?.)과 nullish coalescing(??)을 사용하여, mainBuilding이나 units가 undefined가 되더라도
  // 코드가 멈추지 않고 안전하게 빈 배열([])로 처리되도록 합니다.
  const mainBuilding = buildings?.[0];
  const units = mainBuilding?.units ?? [];

  // 이제 units는 항상 배열이므로, reduce, filter와 같은 배열 함수를 안전하게 사용할 수 있습니다.
  const totalArea = units.reduce((acc, unit) => acc + unit.area_sqm, 0);
  const occupiedArea = units
    .filter(u => u.status === 'occupied')
    .reduce((acc, unit) => acc + unit.area_sqm, 0);
  
  const occupancyRate = totalArea > 0 ? (occupiedArea / totalArea) * 100 : 0;
  const vacantUnits = units.filter(u => u.status === 'vacant').length;
  const newLeadsCount = leads.filter(l => l.status === 'new').length;

  // 데이터가 로드되지 않았을 경우, 좀 더 친절한 메시지를 보여줍니다.
  if (!mainBuilding) {
    return (
        <div className="p-4 space-y-6 bg-gray-50 rounded-lg">
            <h3 className="text-2xl font-bold text-gray-800">종합 현황</h3>
            <div className="bg-white p-6 rounded-xl shadow-sm border text-center text-gray-500">
                건물 데이터를 불러오는 중이거나, 등록된 건물이 없습니다.
            </div>
        </div>
    );
  }

  return (
    <div className="p-4 space-y-6 bg-gray-50 rounded-lg">
        <h3 className="text-2xl font-bold text-gray-800">종합 현황</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 점유율 현황 */}
            <div className="bg-white p-6 rounded-xl shadow-sm border">
                <h4 className="text-sm font-semibold text-gray-500 mb-2">면적 기준 점유율</h4>
                <p className="text-4xl font-bold text-blue-600">{occupancyRate.toFixed(1)}%</p>
            </div>

            {/* 공실 현황 */}
            <div className="bg-white p-6 rounded-xl shadow-sm border">
                <h4 className="text-sm font-semibold text-gray-500 mb-2">총 공실 유닛</h4>
                <p className="text-4xl font-bold text-red-500">{vacantUnits} <span className="text-xl">개</span></p>
            </div>

            {/* 신규 리드 현황 */}
            <div className="bg-white p-6 rounded-xl shadow-sm border">
                <h4 className="text-sm font-semibold text-gray-500 mb-2">신규 입주 문의</h4>
                <p className="text-4xl font-bold text-green-500">{newLeadsCount} <span className="text-xl">건</span></p>
            </div>
        </div>
    </div>
  );
};

export default LeaseDashboard;
