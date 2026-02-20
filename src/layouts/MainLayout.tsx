
import React from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import Dashboard from '../components/Dashboard';
import SafetyManagement from '../components/SafetyManagement';
import LeaseRecruitment from '../components/LeaseRecruitment';
import AssetManagement from '../components/AssetManagement';
import InfraDevelopment from '../components/InfraDevelopment';
import BaseInfoPage from '../pages/BaseInfoPage';
import { useAppData } from '../providers/AppDataContext';
import { MenuKey } from '../types';

const MainLayout: React.FC = () => {
    // [수정] 더 이상 사용하지 않는 customTabs, addTab 관련 로직을 모두 제거합니다.
    const { navigationState, navigateTo } = useAppData();

    const renderContent = () => {
        // [수정] 불필요해진 동적 탭 라우팅 로직을 제거하고, 고정된 메뉴에 따라서만 렌더링합니다.
        switch (navigationState.menuKey) {
            case 'dashboard': return <Dashboard />;
            case 'safety': return <SafetyManagement />;
            case 'lease': return <LeaseRecruitment />;
            case 'asset': return <AssetManagement />;
            case 'infra': return <InfraDevelopment />;
            case 'base-info': return <BaseInfoPage />;
            default: 
              return <Dashboard />;
        }
    };

    return (
        <div className="flex h-screen w-full bg-[#F8F7F4] text-[#1A1D1F] font-sans">
            {/* ====================================================================================== */}
            {/* [핵심 수정] 당신이 지적한 타입 오류를 해결하고, 불필요한 props를 모두 제거합니다. */}
            {/* ====================================================================================== */}
            <Sidebar 
                activeMenu={navigationState.menuKey as MenuKey | 'base-info'}
                onMenuChange={(key) => navigateTo({ menuKey: key })}
            />
            <main className="flex-1 flex flex-col overflow-hidden p-6 md:px-12 md:py-6 space-y-4">
                <Header activeMenu={navigationState.menuKey} />
                <div className="flex-1 overflow-y-auto scrollbar-hide">
                    {renderContent()}
                </div>
            </main>
            {/* [수정] 더 이상 사용하지 않는 TabModal을 제거합니다. */}
        </div>
    );
};

export default MainLayout;
