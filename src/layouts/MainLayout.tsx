
import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import Dashboard from '../components/Dashboard';
import SafetyManagement from '../components/SafetyManagement';
import LeaseRecruitment from '../components/LeaseRecruitment';
import AssetManagement from '../components/AssetManagement';
import InfraDevelopment from '../components/InfraDevelopment';
import CustomPage from '../components/CustomPage';
import TabModal from '../components/TabModal';
import { useAppData } from '../providers/AppDataContext';
import { CustomTab } from '../types';

const MainLayout: React.FC = () => {
    const { navigationState, navigateTo, customTabs, addTab } = useAppData();
    const [isTabModalOpen, setIsTabModalOpen] = useState(false);

    const handleAddTab = (newTab: Omit<CustomTab, 'key'>) => {
        addTab(newTab);
        setIsTabModalOpen(false);
    };

    const renderContent = () => {
        const customTab = customTabs.find(t => t.key === navigationState.menuKey);
        if (customTab) {
            return <CustomPage title={customTab.label} />;
        }

        switch (navigationState.menuKey) {
            case 'dashboard': return <Dashboard />;
            case 'safety': return <SafetyManagement />;
            case 'lease': return <LeaseRecruitment />;
            case 'asset': return <AssetManagement />;
            case 'infra': return <InfraDevelopment />;
            default: return <Dashboard />;
        }
    };

    return (
        <div className="flex h-screen w-full bg-[#F8F7F4] text-[#1A1D1F] font-sans">
            <Sidebar 
                activeMenu={navigationState.menuKey}
                onMenuChange={(key) => navigateTo({ menuKey: key })}
                customTabs={customTabs} 
                onAddTabOpen={() => setIsTabModalOpen(true)} 
            />
            <main className="flex-1 flex flex-col overflow-hidden p-6 md:px-12 md:py-6 space-y-4">
                <Header />
                <div className="flex-1 overflow-y-auto scrollbar-hide">
                    {renderContent()}
                </div>
            </main>
            {isTabModalOpen && <TabModal onClose={() => setIsTabModalOpen(false)} onSave={handleAddTab} />}
        </div>
    );
};

export default MainLayout;
