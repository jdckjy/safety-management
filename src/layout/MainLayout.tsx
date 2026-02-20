
// src/layout/MainLayout.tsx
import React from 'react';

// [오류 수정] 중복되고 잘못된 import 구문들을 모두 제거하고, 올바른 named import로 단일화합니다.
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';

// 페이지 컴포넌트들은 default import로 올바르게 가져옵니다.
import Dashboard from '../components/Dashboard';
import SafetyManagement from '../components/SafetyManagement';
import LeaseRecruitment from '../components/LeaseRecruitment';
import AssetManagement from '../components/AssetManagement';
import InfraDevelopment from '../components/InfraDevelopment';
import CustomPage from '../components/CustomPage';

import { useAppData } from '../providers/AppDataContext';

export const MainLayout: React.FC = () => {
  const { navigationState, customTabs, navigateTo } = useAppData();
  const { menuKey } = navigationState;

  const renderContent = () => {
    switch (menuKey) {
      case 'dashboard':
        return <Dashboard />;
      case 'safety':
        return <SafetyManagement />;
      case 'lease':
        return <LeaseRecruitment />;
      case 'asset':
        return <AssetManagement />;
      case 'infra':
        return <InfraDevelopment />;
      default:
        const customTab = customTabs.find(tab => tab.key === menuKey);
        if (customTab) {
          // 이 부분의 오류는 CustomPage.tsx 파일을 직접 수정해야 해결됩니다. (다음 단계)
          return <CustomPage tab={customTab} />;
        }
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar activeMenu={menuKey} onMenuChange={navigateTo} customTabs={customTabs} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header activeMenu={menuKey} onMenuChange={navigateTo} customTabs={customTabs} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-200 p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};
