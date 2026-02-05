
import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import SafetyManagement from './components/SafetyManagement';
import LeaseRecruitment from './components/LeaseRecruitment';
import AssetManagement from './components/AssetManagement';
import InfraDevelopment from './components/InfraDevelopment';
import CustomPage from './components/CustomPage';
import TabModal from './components/TabModal';
import { MenuKey, KPI, TaskItem, SummaryStats, CustomTab, Tenant, Facility, HotSpot } from './types';

const STORAGE_KEYS = {
  TASKS: 'complex-mgt-v4-tasks',
  SAFETY: 'complex-mgt-v4-safety',
  LEASE: 'complex-mgt-v4-lease',
  TENANTS: 'complex-mgt-v4-tenants',
  FACILITIES: 'complex-mgt-v4-facilities',
  HOTSPOTS: 'complex-mgt-v4-hotspots', // 새로운 마커 데이터 저장 키
  ASSET: 'complex-mgt-v4-asset',
  INFRA: 'complex-mgt-v4-infra',
  CUSTOM_TABS: 'complex-mgt-v4-custom-tabs',
  DYNAMIC_DATA: 'complex-mgt-v4-dynamic-data',
};

// LocalStorage 관련 함수
const loadFromStorage = <T,>(key: string, defaultValue: T): T => {
  if (typeof window === 'undefined') return defaultValue;
  const saved = localStorage.getItem(key);
  if (saved && saved !== "undefined" && saved !== "null") {
    try {
      return JSON.parse(saved) as T;
    } catch (e) {
      console.error(`Failed to parse storage key: ${key}`, e);
    }
  }
  return defaultValue;
};

// 기본 데이터 정의
const BASELINE_KPIS: Record<string, KPI[]> = {
  safety: [],
  lease: [],
  asset: [],
  infra: [],
};

const BASELINE_TENANTS: Tenant[] = [];

const BASELINE_FACILITIES: Facility[] = [
  { id: 'facility-1', category: '공공편익시설', name: '도로' },
  { id: 'facility-2', category: '공공편익시설', name: '보행자전용도로' },
  { id: 'facility-3', category: '공공편익시설', name: '중앙관리센터' },
  { id: 'facility-4', category: '숙박시설', name: '휴양콘도미니엄1' },
  { id: 'facility-5', category: '상가시설', name: '웰니스몰1' },
  { id: 'facility-6', category: '기타시설(의료,연구)', name: '헬스케어센터' },
];

const App: React.FC = () => {
  const [activeMenu, setActiveMenu] = useState<MenuKey>('dashboard');
  const [isTabModalOpen, setIsTabModalOpen] = useState(false);

  // 상태 관리
  const [tasks, setTasks] = useState<TaskItem[]>(() => loadFromStorage(STORAGE_KEYS.TASKS, []));
  const [customTabs, setCustomTabs] = useState<CustomTab[]>(() => loadFromStorage(STORAGE_KEYS.CUSTOM_TABS, []));
  const [facilities, setFacilities] = useState<Facility[]>(() => loadFromStorage(STORAGE_KEYS.FACILITIES, BASELINE_FACILITIES));
  const [hotspots, setHotspots] = useState<HotSpot[]>(() => loadFromStorage(STORAGE_KEYS.HOTSPOTS, [])); // HotSpot 상태 추가
  const [safetyKPIs, setSafetyKPIs] = useState<KPI[]>(() => loadFromStorage(STORAGE_KEYS.SAFETY, BASELINE_KPIS.safety));
  const [leaseKPIs, setLeaseKPIs] = useState<KPI[]>(() => loadFromStorage(STORAGE_KEYS.LEASE, BASELINE_KPIS.lease));
  const [tenants, setTenants] = useState<Tenant[]>(() => loadFromStorage(STORAGE_KEYS.TENANTS, BASELINE_TENANTS));
  const [assetKPIs, setAssetKPIs] = useState<KPI[]>(() => loadFromStorage(STORAGE_KEYS.ASSET, BASELINE_KPIS.asset));
  const [infraKPIs, setInfraKPIs] = useState<KPI[]>(() => loadFromStorage(STORAGE_KEYS.INFRA, BASELINE_KPIS.infra));
  const [dynamicKpis, setDynamicKpis] = useState<Record<string, KPI[]>>(() => loadFromStorage(STORAGE_KEYS.DYNAMIC_DATA, {}));

  // 데이터 저장 Effect
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks)); }, [tasks]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.CUSTOM_TABS, JSON.stringify(customTabs)); }, [customTabs]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.FACILITIES, JSON.stringify(facilities)); }, [facilities]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.HOTSPOTS, JSON.stringify(hotspots)); }, [hotspots]); // HotSpot 저장
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.SAFETY, JSON.stringify(safetyKPIs)); }, [safetyKPIs]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.LEASE, JSON.stringify(leaseKPIs)); }, [leaseKPIs]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.TENANTS, JSON.stringify(tenants)); }, [tenants]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.ASSET, JSON.stringify(assetKPIs)); }, [assetKPIs]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.INFRA, JSON.stringify(infraKPIs)); }, [infraKPIs]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.DYNAMIC_DATA, JSON.stringify(dynamicKpis)); }, [dynamicKpis]);
  
  // Hotspot CRUD 핸들러
  const handleAddHotspot = (newHotspotData: Omit<HotSpot, 'id'>) => {
    const newHotspot: HotSpot = { ...newHotspotData, id: Date.now().toString() };
    setHotspots(prev => [...prev, newHotspot]);
  };

  const handleUpdateHotspot = (updatedHotspot: HotSpot) => {
    setHotspots(prev => prev.map(h => h.id === updatedHotspot.id ? updatedHotspot : h));
  };

  const handleDeleteHotspot = (hotspotId: string) => {
    setHotspots(prev => prev.filter(h => h.id !== hotspotId));
  };

  // ... (기존 Effect 및 핸들러)
   const summaryStats: SummaryStats = useMemo(() => ({
    safety: { days: safetyKPIs[0]?.current || 0, change: 0 },
    lease: { rate: leaseKPIs[0]?.current || 0, change: 0 },
    asset: { value: assetKPIs[0]?.current || 0, change: 0 },
    infra: { progress: infraKPIs[0]?.current || 0, change: 0 },
  }), [safetyKPIs, leaseKPIs, assetKPIs, infraKPIs]);

  const handleAddTab = (newTab: CustomTab) => {
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
      case 'dashboard': return <Dashboard tasks={tasks} onTasksUpdate={setTasks} summaryStats={summaryStats} />;
      case 'safety': return <SafetyManagement 
                          kpis={safetyKPIs} 
                          onUpdate={setSafetyKPIs} 
                          mainValue={summaryStats.safety} 
                          facilities={facilities} 
                          hotspots={hotspots}
                          onAddHotspot={handleAddHotspot}
                          onUpdateHotspot={handleUpdateHotspot}
                          onDeleteHotspot={handleDeleteHotspot}
                        />;
      case 'lease': return <LeaseRecruitment kpis={leaseKPIs} onUpdate={setLeaseKPIs} tenants={tenants} onTenantsUpdate={setTenants} mainValue={summaryStats.lease} />;
      case 'asset': return <AssetManagement kpis={assetKPIs} onUpdate={setAssetKPIs} mainValue={summaryStats.asset} />;
      case 'infra': return <InfraDevelopment kpis={infraKPIs} onUpdate={setInfraKPIs} mainValue={summaryStats.infra} />;
      default: return <Dashboard tasks={tasks} onTasksUpdate={setTasks} summaryStats={summaryStats} />;
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

