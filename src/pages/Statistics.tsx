import React, { useState, useEffect } from 'react';
import PopulationInfoTab from './PopulationInfoTab'; // 정확한 경로로 수정

interface StatisticsProps {
  activeSubMenu: string | undefined;
  onSubMenuChange: (subMenu: string | undefined) => void;
}

const Statistics: React.FC<StatisticsProps> = ({ activeSubMenu, onSubMenuChange }) => {
  const [activeTab, setActiveTab] = useState(activeSubMenu || 'population');

  useEffect(() => {
    setActiveTab(activeSubMenu || 'population');
  }, [activeSubMenu]);

  const handleTabClick = (tabKey: string) => {
    setActiveTab(tabKey);
    if (onSubMenuChange) {
      onSubMenuChange(tabKey);
    }
  };

  return (
    <div className="flex-1 p-8">
      <h1 className="text-2xl font-bold mb-4">통계 정보</h1>
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
      </div>
      {activeTab === 'population' && <PopulationInfoTab />}
    </div>
  );
};

export default Statistics;
