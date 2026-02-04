
import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import SafetyManagement from './components/SafetyManagement';
import LeaseRecruitment from './components/LeaseRecruitment';
import AssetManagement from './components/AssetManagement';
import InfraDevelopment from './components/InfraDevelopment';
import KPIManager from './components/KPIManager';
import TabModal from './components/TabModal';
import { MenuKey, KPI, TaskItem, SummaryStats, CustomTab, Tenant } from './types';

const STORAGE_KEYS = {
  TASKS: 'complex-mgt-v4-tasks',
  SAFETY: 'complex-mgt-v4-safety',
  LEASE: 'complex-mgt-v4-lease',
  TENANTS: 'complex-mgt-v4-tenants',
  ASSET: 'complex-mgt-v4-asset',
  INFRA: 'complex-mgt-v4-infra',
  CUSTOM_TABS: 'complex-mgt-v4-custom-tabs',
  DYNAMIC_DATA: 'complex-mgt-v4-dynamic-data',
  INITIALIZED: 'complex-mgt-v4-init-flag',
};

const loadFromStorage = <T,>(key: string, defaultValue: T): T => {
  if (typeof window === 'undefined') return defaultValue;
  const saved = localStorage.getItem(key);
  if (saved && saved !== "undefined" && saved !== "null") {
    try {
      const parsed = JSON.parse(saved);
      return parsed as T;
    } catch (e) {
      console.error(`Failed to parse storage key: ${key}`, e);
    }
  }
  return defaultValue;
};

const BASELINE_KPIS: Record<string, KPI[]> = {
  safety: [{ id: 'default-safety', name: '무사고 운영 기간', current: 456, target: 1000, unit: '일', activities: [] }],
  lease: [{ id: 'default-lease', name: '전체 임대 유치율', current: 86.2, target: 100, unit: '%', activities: [] }],
  asset: [{ id: 'default-asset', name: '운용 자산 가치', current: 21.2, target: 25, unit: '조원', activities: [] }],
  infra: [{ id: 'default-infra', name: '기반 시설 공정률', current: 64.8, target: 100, unit: '%', activities: [] }],
};

const BASELINE_TENANTS: Tenant[] = [
  { id: '1f-1', name: 'KMI', usage: '건강검진센터1', area: 744.07, floor: 1, status: 'occupied' },
  { id: '1f-2', name: 'KMI', usage: '편의시설', area: 274.05, floor: 1, status: 'occupied' },
  { id: '1f-3', name: 'KMI', usage: '사무실', area: 70.47, floor: 1, status: 'occupied' },
  { id: '1f-4', name: '공용부', usage: '용역원실', area: 39.00, floor: 1, status: 'public' },
  { id: '1f-lobby', name: '메인 로비', usage: '공용공간', area: 150.00, floor: 1, status: 'public' },
  { id: '2f-1', name: 'KMI', usage: '건강검진센터2', area: 783.04, floor: 2, status: 'occupied' },
  { id: '2f-2', name: 'KMI', usage: '의원1', area: 104.49, floor: 2, status: 'occupied' },
  { id: '2f-v1', name: '미임대', usage: '의원2', area: 104.49, floor: 2, status: 'vacant' },
  { id: '2f-v2', name: '미임대', usage: '의원3', area: 104.49, floor: 2, status: 'vacant' },
  { id: '2f-v3', name: '미임대', usage: '의원4', area: 204.20, floor: 2, status: 'vacant' },
  { id: '2f-3', name: '치과의원', usage: '의원5', area: 104.49, floor: 2, status: 'occupied' },
  { id: '2f-core', name: 'EV홀', usage: '수직동선', area: 85.00, floor: 2, status: 'public' },
  { id: '3f-1', name: '한국보건복지인재원', usage: '의원10', area: 104.49, floor: 3, status: 'occupied' },
  { id: '3f-v1', name: '미임대', usage: '의원8', area: 104.49, floor: 3, status: 'vacant' },
  { id: '3f-11', name: 'JDC', usage: '컨벤션', area: 499.66, floor: 3, status: 'occupied' },
  { id: '3f-tech', name: '공조실', usage: '설비공간', area: 120.00, floor: 3, status: 'public' },
];

const App: React.FC = () => {
  const [activeMenu, setActiveMenu] = useState<MenuKey>('dashboard');
  const [isTabModalOpen, setIsTabModalOpen] = useState(false);
  
  const [tasks, setTasks] = useState<TaskItem[]>(() => loadFromStorage(STORAGE_KEYS.TASKS, []));
  const [customTabs, setCustomTabs] = useState<CustomTab[]>(() => loadFromStorage(STORAGE_KEYS.CUSTOM_TABS, []));
  const [safetyKPIs, setSafetyKPIs] = useState<KPI[]>(() => loadFromStorage(STORAGE_KEYS.SAFETY, BASELINE_KPIS.safety));
  const [leaseKPIs, setLeaseKPIs] = useState<KPI[]>(() => loadFromStorage(STORAGE_KEYS.LEASE, BASELINE_KPIS.lease));
  const [tenants, setTenants] = useState<Tenant[]>(() => loadFromStorage(STORAGE_KEYS.TENANTS, BASELINE_TENANTS));
  const [assetKPIs, setAssetKPIs] = useState<KPI[]>(() => loadFromStorage(STORAGE_KEYS.ASSET, BASELINE_KPIS.asset));
  const [infraKPIs, setInfraKPIs] = useState<KPI[]>(() => loadFromStorage(STORAGE_KEYS.INFRA, BASELINE_KPIS.infra));
  const [dynamicKpis, setDynamicKpis] = useState<Record<string, KPI[]>>(() => loadFromStorage(STORAGE_KEYS.DYNAMIC_DATA, {}));

  useEffect(() => {
    const rentalTarget = tenants.filter(t => t.status !== 'public');
    const totalArea = rentalTarget.reduce((acc, t) => acc + (Number(t.area) || 0), 0);
    const occupiedArea = rentalTarget.filter(t => t.status === 'occupied').reduce((acc, t) => acc + (Number(t.area) || 0), 0);
    const newRate = totalArea > 0 ? Number(((occupiedArea / totalArea) * 100).toFixed(1)) : 0;
    
    setLeaseKPIs(prev => prev.map(k => k.id === 'default-lease' ? { ...k, current: newRate } : k));
  }, [tenants]);

  useEffect(() => { localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks)); }, [tasks]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.CUSTOM_TABS, JSON.stringify(customTabs)); }, [customTabs]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.SAFETY, JSON.stringify(safetyKPIs)); }, [safetyKPIs]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.LEASE, JSON.stringify(leaseKPIs)); }, [leaseKPIs]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.TENANTS, JSON.stringify(tenants)); }, [tenants]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.ASSET, JSON.stringify(assetKPIs)); }, [assetKPIs]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.INFRA, JSON.stringify(infraKPIs)); }, [infraKPIs]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.DYNAMIC_DATA, JSON.stringify(dynamicKpis)); }, [dynamicKpis]);

  const summaryStats: SummaryStats = useMemo(() => ({
    safety: { days: safetyKPIs[0]?.current || 0, change: 0 },
    lease: { rate: leaseKPIs[0]?.current || 0, change: 0 },
    asset: { value: assetKPIs[0]?.current || 0, change: 0 },
    infra: { progress: infraKPIs[0]?.current || 0, change: 0 }
  }), [safetyKPIs, leaseKPIs, assetKPIs, infraKPIs]);

  const handleAddTab = (newTab: CustomTab) => {
    setCustomTabs(prev => [...prev, newTab]);
    setDynamicKpis(prev => ({ ...prev, [newTab.key]: [] }));
    setActiveMenu(newTab.key);
    setIsTabModalOpen(false);
  };

  const updateDynamicKpi = (key: string, kpis: KPI[] | ((prev: KPI[]) => KPI[])) => {
    setDynamicKpis(prev => {
      const current = prev[key] || [];
      const updated = typeof kpis === 'function' ? kpis(current) : kpis;
      return { ...prev, [key]: updated };
    });
  };

  const renderContent = () => {
    switch (activeMenu) {
      case 'dashboard': return <Dashboard tasks={tasks} onTasksUpdate={setTasks} summaryStats={summaryStats} />;
      case 'safety': return <SafetyManagement kpis={safetyKPIs} onUpdate={setSafetyKPIs} mainValue={summaryStats.safety} />;
      case 'lease': return <LeaseRecruitment kpis={leaseKPIs} onUpdate={setLeaseKPIs} tenants={tenants} onTenantsUpdate={setTenants} mainValue={summaryStats.lease} />;
      case 'asset': return <AssetManagement kpis={assetKPIs} onUpdate={setAssetKPIs} mainValue={summaryStats.asset} />;
      case 'infra': return <InfraDevelopment kpis={infraKPIs} onUpdate={setInfraKPIs} mainValue={summaryStats.infra} />;
    }

    const customTab = customTabs.find(t => t.key === activeMenu);
    if (customTab) {
      return (
        <div className="animate-in fade-in duration-500">
          <div className="bg-white rounded-5xl p-10 shadow-sm border border-gray-50 mb-8">
            <div className="flex items-center gap-4 mb-2">
              <div className={`w-2 h-2 rounded-full ${
                customTab.color === 'orange' ? 'bg-pink-500' :
                customTab.color === 'blue' ? 'bg-blue-400' :
                customTab.color === 'emerald' ? 'bg-black' : 'bg-gray-400'
              } animate-pulse`}></div>
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Custom Folder Module</span>
            </div>
            <h2 className="text-4xl font-bold tracking-tight text-[#1A1D1F]">{customTab.label} Management</h2>
            <p className="text-gray-400 mt-2 text-sm font-medium">Real-time data synchronization enabled for v5.0 core engine.</p>
          </div>
          <KPIManager 
            sectionTitle={customTab.label} 
            kpis={dynamicKpis[customTab.key] || []} 
            onUpdate={(kpis) => updateDynamicKpi(customTab.key, kpis)} 
            accentColor={customTab.color} 
          />
        </div>
      );
    }
    return <Dashboard tasks={tasks} onTasksUpdate={setTasks} summaryStats={summaryStats} />;
  };

  return (
    <div className="flex h-screen w-full bg-[#F8F7F4] text-[#1A1D1F] font-sans">
      <Sidebar activeMenu={activeMenu} onMenuChange={setActiveMenu} customTabs={customTabs} onAddTabOpen={() => setIsTabModalOpen(true)} />
      <main className="flex-1 flex flex-col overflow-hidden p-6 md:px-12 md:py-6 space-y-4">
        <Header activeMenu={activeMenu} />
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          {renderContent()}
        </div>
      </main>
      {isTabModalOpen && <TabModal onClose={() => setIsTabModalOpen(false)} onSave={handleAddTab} />}
    </div>
  );
};

export default App;
