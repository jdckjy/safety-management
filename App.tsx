
import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import SafetyManagement from './components/SafetyManagement';
import LeaseRecruitment from './components/LeaseRecruitment';
import AssetManagement from './components/AssetManagement';
import InfraDevelopment from './components/InfraDevelopment';
import CustomPage from './components/CustomPage';
import TabModal from './components/TabModal';
import { DataProvider, useData } from './contexts/DataContext';
import { MenuKey } from './types';

const App: React.FC = () => {
  return (
    <DataProvider>
      <MainLayout />
    </DataProvider>
  );
};

const MainLayout: React.FC = () => {
  const [activeMenu, setActiveMenu] = useState<MenuKey>('dashboard');
  const [isTabModalOpen, setIsTabModalOpen] = useState(false);
  
  const {
    customTabs,
    setCustomTabs,
    facilities,
    setFacilities,
    // All other data states (kpis, tenants, etc.) are now managed in DataContext
  } = useData();

  const handleAddTab = (newTab: any) => {
    setCustomTabs(prev => [...prev, newTab]);
    setActiveMenu(newTab.key);
    setIsTabModalOpen(false);
  };

  const renderContent = () => {
    const customTab = customTabs.find(t => t.key === activeMenu);
    if (customTab) {
      return <CustomPage title={customTab.label} facilities={facilities} setFacilities={setFacilities} />;
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
      <Sidebar 
        activeMenu={activeMenu} 
        onMenuChange={setActiveMenu} 
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

export default App;
