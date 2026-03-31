
// src/layout/MainLayout.tsx
import React from 'react';

import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

import Dashboard from '../components/Dashboard';
import SafetyManagement from '../components/SafetyManagement';
import LeaseRecruitment from '../components/LeaseRecruitment';
import AssetManagement from '../components/AssetManagement';
import InfraDevelopment from '../components/InfraDevelopment';
import CustomPage from '../components/CustomPage';

import { useProjectData } from '../providers/ProjectDataProvider';

export const MainLayout: React.FC = () => {
  const { navigationState, customTabs, navigateTo, isDataLoaded } = useProjectData();
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
          // [오류 수정] customTab 객체 전체가 아닌, title 속성을 전달합니다.
          return <CustomPage title={customTab.name} />;
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
          {isDataLoaded ? renderContent() : (
            <div className="flex justify-center items-center h-full">
              <p className='text-lg font-semibold text-gray-500'>프로젝트 데이터 로딩 중...</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
