import PopulationInfo from './pages/Population';

import React, { useState, useEffect } from 'react';
import PopulationInfo from '../pages/Population'; // 경로 수정: './Population' -> '../pages/Population'

interface StatisticsProps {
  activeSubMenu: string | undefined; // 상위 컴포넌트로부터 activeSubMenu prop을 받습니다.
  onSubMenuChange: (subMenu: string | undefined) => void; // 하위 탭 변경 함수 prop
}

const Statistics: React.FC<StatisticsProps> = ({ activeSubMenu, onSubMenuChange }) => {
  // 컴포넌트 내부의 activeTab 상태를 props로 받은 activeSubMenu에 동기화합니다.
  const [activeTab, setActiveTab] = useState(activeSubMenu || 'population');

  // props로 받은 activeSubMenu가 변경될 때 내부 상태를 업데이트합니다.
  useEffect(() => {
    setActiveTab(activeSubMenu || 'population');
  }, [activeSubMenu]);

  // 탭 버튼 클릭 시 상위 컴포넌트의 상태를 변경합니다.
  const handleTabClick = (tabKey: string) => {
    setActiveTab(tabKey);
    if (onSubMenuChange) {
      onSubMenuChange(tabKey);
    }
  };

  return (
    <div className="flex-1 p-8">
      <h1 className="text-2xl font-bold mb-4">통계 정보</h1>

      {/* 하위 탭 네비게이션 */}
      <div className="flex border-b border-gray-200 mb-4">
        <button
          onClick={() => handleTabClick('population')}
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === 'population'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          인구 정보
        </button>
        {/* 다른 통계 정보 관련 탭을 여기에 추가할 수 있습니다. */}
      </div>

      {/* 탭 컨텐츠 */}
      {activeTab === 'population' && <PopulationInfo />}
      {/* 다른 탭에 대한 컨텐츠를 여기에 추가 */}
    </div>
  );
};

export default Statistics;
