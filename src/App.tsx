
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import SafetyManagement from './components/SafetyManagement';
import LeaseRecruitment from './components/LeaseRecruitment';
import AssetManagement from './components/AssetManagement';
import InfraDevelopment from './components/InfraDevelopment';
import CustomPage from './components/CustomPage';
import TabModal from './components/TabModal';
import { MenuKey, CustomTab } from './types';
import { useUnifiedData } from './contexts/UnifiedDataContext';
import { mockSafetyKPIs, mockLeaseKPIs, mockAssetKPIs, mockInfraKPIs, mockHotspots, mockFacilities } from './contexts/mockData';

const App: React.FC = () => {
    const [activeMenu, setActiveMenu] = useState<MenuKey>('dashboard');
    const [isTabModalOpen, setIsTabModalOpen] = useState(false);

    const { 
        customTabs, setCustomTabs, 
        setSafetyKPIs, setLeaseKPIs, 
        setAssetKPIs, setInfraKPIs,
        setHotspots,
        setFacilities
    } = useUnifiedData();

    useEffect(() => {
        // Load mock data into the context when the app starts
        setSafetyKPIs(mockSafetyKPIs);
        setLeaseKPIs(mockLeaseKPIs);
        setAssetKPIs(mockAssetKPIs);
        setInfraKPIs(mockInfraKPIs);
        setHotspots(mockHotspots);
        setFacilities(mockFacilities);
    }, []); // Empty dependency array ensures this runs only once on mount

    const handleAddTab = (newTab: CustomTab) => {
        setCustomTabs((prev: CustomTab[]) => [...prev, newTab]);
        setActiveMenu(newTab.key);
        setIsTabModalOpen(false);
    };

    const renderContent = () => {
        const customTab = customTabs.find((t: CustomTab) => t.key === activeMenu);
        if (customTab) {
            return <CustomPage title={customTab.label} />;
        }

        switch (activeMenu) {
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
            <Sidebar activeMenu={activeMenu} onMenuChange={setActiveMenu} customTabs={customTabs} onAddTabOpen={() => setIsTabModalOpen(true)} />
            <main className="flex-1 flex flex-col overflow-hidden p-6 md:px-12 md:py-6 space-y-4">
                <Header activeMenu={activeMenu} customTabs={customTabs} />
                <div className="flex-1 overflow-y-auto scrollbar-hide">
                    {renderContent()}
                </div>
            </main>
            {isTabModalOpen && <TabModal onClose={() => setIsTabModalOpen(false)} onSave={handleAddTab} />}
        </div>
    );
};

export default App;
