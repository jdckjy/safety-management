
import React from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import Dashboard from '../components/Dashboard';
import SafetyManagement from '../components/SafetyManagement';
import LeaseRecruitment from '../components/LeaseRecruitment';
import AssetManagement from '../components/AssetManagement';
import InfraDevelopment from '../components/InfraDevelopment';
import BaseInfoPage from '../pages/BaseInfoPage';
import ProjectCalendar from '../pages/ProjectCalendar'; // 캘린더 컴포넌트 임포트
import { useProjectData } from '../providers/ProjectDataProvider';
import { MenuKey } from '../types';

const MainLayout: React.FC = () => {
    const { navigationState, navigateTo } = useProjectData();

    const renderContent = () => {
        switch (navigationState.menuKey) {
            case 'dashboard': return <Dashboard />;
            case 'safety': return <SafetyManagement />;
            case 'lease': return <LeaseRecruitment />;
            case 'asset': return <AssetManagement />;
            case 'infra': return <InfraDevelopment />;
            case 'base-info': return <BaseInfoPage />;
            case 'calendar': return <ProjectCalendar />; // 캘린더 라우팅 추가
            default: 
              return <Dashboard />;
        }
    };

    return (
        <div className="flex h-screen w-full bg-[#F8F7F4] text-[#1A1D1F] font-sans">
            <Sidebar 
                activeMenu={navigationState.menuKey as MenuKey | 'base-info' | 'calendar'} // 타입 업데이트
                onMenuChange={(key) => navigateTo({ menuKey: key })}
            />
            <main className="flex-1 flex flex-col overflow-hidden p-6 md:px-12 md:py-6 space-y-4">
                <Header activeMenu={navigationState.menuKey} />
                <div className="flex-1 overflow-y-auto scrollbar-hide">
                    {renderContent()}
                </div>
            </main>
        </div>
    );
};

export default MainLayout;
