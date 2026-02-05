
import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { KPI, TaskItem, CustomTab, Tenant, Facility, HotSpot, MonthlyRecord, BusinessActivity } from '../types';

// --- Helper Functions and Constants ---
const STORAGE_KEYS = {
  TASKS: 'complex-mgt-v4-tasks',
  SAFETY: 'complex-mgt-v4-safety',
  LEASE: 'complex-mgt-v4-lease',
  TENANTS: 'complex-mgt-v4-tenants',
  FACILITIES: 'complex-mgt-v4-facilities',
  HOTSPOTS: 'complex-mgt-v4-hotspots',
  ASSET: 'complex-mgt-v4-asset',
  INFRA: 'complex-mgt-v4-infra',
  CUSTOM_TABS: 'complex-mgt-v4-custom-tabs',
  DYNAMIC_DATA: 'complex-mgt-v4-dynamic-data',
};

const loadFromStorage = <T,>(key: string, defaultValue: T): T => {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const saved = localStorage.getItem(key);
    return saved && saved !== "undefined" && saved !== "null" ? JSON.parse(saved) : defaultValue;
  } catch (e) {
    console.error(`Failed to parse storage key: ${key}`, e);
    return defaultValue;
  }
};

const BASELINE_KPIS: Record<string, KPI[]> = { safety: [], lease: [], asset: [], infra: [] };
const BASELINE_TENANTS: Tenant[] = [];
const BASELINE_FACILITIES: Facility[] = [
    { id: 'facility-1', category: '공공편익시설', name: '도로' },
    { id: 'facility-2', category: '공공편익시설', name: '보행자전용도로' },
    { id: 'facility-3', category: '공공편익시설', name: '중앙관리센터' },
    { id: 'facility-4', category: '숙박시설', name: '휴양콘도미니엄1' },
    { id: 'facility-5', category: '상가시설', name: '웰니스몰1' },
    { id: 'facility-6', category: '기타시설(의료,연구)', name: '헬스케어센터' },
];

// --- Context Type Definition ---
interface DataContextType {
  selectedMonth: number;
  setSelectedMonth: React.Dispatch<React.SetStateAction<number>>;
  tasks: TaskItem[];
  setTasks: React.Dispatch<React.SetStateAction<TaskItem[]>>;
  customTabs: CustomTab[];
  setCustomTabs: React.Dispatch<React.SetStateAction<CustomTab[]>>;
  facilities: Facility[];
  setFacilities: React.Dispatch<React.SetStateAction<Facility[]>>;
  hotspots: HotSpot[];
  setHotspots: React.Dispatch<React.SetStateAction<HotSpot[]>>;
  safetyKPIs: KPI[];
  setSafetyKPIs: React.Dispatch<React.SetStateAction<KPI[]>>;
  leaseKPIs: KPI[];
  setLeaseKPIs: React.Dispatch<React.SetStateAction<KPI[]>>;
  tenants: Tenant[];
  setTenants: React.Dispatch<React.SetStateAction<Tenant[]>>;
  assetKPIs: KPI[];
  setAssetKPIs: React.Dispatch<React.SetStateAction<KPI[]>>;
  infraKPIs: KPI[];
  setInfraKPIs: React.Dispatch<React.SetStateAction<KPI[]>>;
  dynamicKpis: Record<string, KPI[]>;
  setDynamicKpis: React.Dispatch<React.SetStateAction<Record<string, KPI[]>>>;
  allKpis: KPI[];
  totalMonthlyPlans: number;
  updateKpiActivity: (kpiId: string, updatedActivity: BusinessActivity) => void;
}

// --- Context Creation ---
const DataContext = createContext<DataContextType | undefined>(undefined);

// --- Provider Component ---
export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [tasks, setTasks] = useState<TaskItem[]>(() => loadFromStorage(STORAGE_KEYS.TASKS, []));
  const [customTabs, setCustomTabs] = useState<CustomTab[]>(() => loadFromStorage(STORAGE_KEYS.CUSTOM_TABS, []));
  const [facilities, setFacilities] = useState<Facility[]>(() => loadFromStorage(STORAGE_KEYS.FACILITIES, BASELINE_FACILITIES));
  const [hotspots, setHotspots] = useState<HotSpot[]>(() => loadFromStorage(STORAGE_KEYS.HOTSPOTS, []));
  const [safetyKPIs, setSafetyKPIs] = useState<KPI[]>(() => loadFromStorage(STORAGE_KEYS.SAFETY, BASELINE_KPIS.safety));
  const [leaseKPIs, setLeaseKPIs] = useState<KPI[]>(() => loadFromStorage(STORAGE_KEYS.LEASE, BASELINE_KPIS.lease));
  const [tenants, setTenants] = useState<Tenant[]>(() => loadFromStorage(STORAGE_KEYS.TENANTS, BASELINE_TENANTS));
  const [assetKPIs, setAssetKPIs] = useState<KPI[]>(() => loadFromStorage(STORAGE_KEYS.ASSET, BASELINE_KPIS.asset));
  const [infraKPIs, setInfraKPIs] = useState<KPI[]>(() => loadFromStorage(STORAGE_KEYS.INFRA, BASELINE_KPIS.infra));
  const [dynamicKpis, setDynamicKpis] = useState<Record<string, KPI[]>>(() => loadFromStorage(STORAGE_KEYS.DYNAMIC_DATA, {}));

  // --- Data Persistence Effects ---
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks)); }, [tasks]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.CUSTOM_TABS, JSON.stringify(customTabs)); }, [customTabs]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.FACILITIES, JSON.stringify(facilities)); }, [facilities]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.HOTSPOTS, JSON.stringify(hotspots)); }, [hotspots]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.SAFETY, JSON.stringify(safetyKPIs)); }, [safetyKPIs]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.LEASE, JSON.stringify(leaseKPIs)); }, [leaseKPIs]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.TENANTS, JSON.stringify(tenants)); }, [tenants]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.ASSET, JSON.stringify(assetKPIs)); }, [assetKPIs]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.INFRA, JSON.stringify(infraKPIs)); }, [infraKPIs]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.DYNAMIC_DATA, JSON.stringify(dynamicKpis)); }, [dynamicKpis]);

  // --- Memoized Calculations ---
  const allKpis = useMemo(() => {
    const dynamicKpiArrays = Object.values(dynamicKpis);
    return [...safetyKPIs, ...leaseKPIs, ...assetKPIs, ...infraKPIs, ...dynamicKpiArrays.flat()];
  }, [safetyKPIs, leaseKPIs, assetKPIs, infraKPIs, dynamicKpis]);

  const totalMonthlyPlans = useMemo(() => {
    const monthToCompare = selectedMonth + 1; // selectedMonth is 0-based
    return allKpis.reduce((total, kpi) => {
        if (!kpi || !kpi.activities) return total;
        return total + kpi.activities.reduce((activityTotal, activity) => {
            if (!activity || !activity.monthlyRecords) return activityTotal;
            const record = activity.monthlyRecords.find(r => r.month === monthToCompare);
            return activityTotal + (record?.plans?.length || 0);
        }, 0);
    }, 0);
}, [allKpis, selectedMonth]);

  // --- Global Update Functions ---
  const updateKpiActivity = (kpiId: string, updatedActivity: BusinessActivity) => {
    const allSetterGroups = [
        { kpis: safetyKPIs, setter: setSafetyKPIs },
        { kpis: leaseKPIs, setter: setLeaseKPIs },
        { kpis: assetKPIs, setter: setAssetKPIs },
        { kpis: infraKPIs, setter: setInfraKPIs },
    ];

    // Update standard KPIs
    for (const group of allSetterGroups) {
        const kpiIndex = group.kpis.findIndex(k => k.id === kpiId);
        if (kpiIndex !== -1) {
            group.setter(prevKpis => prevKpis.map(kpi => kpi.id === kpiId ? {
                ...kpi,
                activities: (kpi.activities || []).map(act => act.id === updatedActivity.id ? updatedActivity : act)
            } : kpi));
            return; // Exit after finding and updating
        }
    }
    
    // Update dynamic KPIs
    setDynamicKpis(prevDynamicKpis => {
        const newDynamicKpis = { ...prevDynamicKpis };
        for (const key in newDynamicKpis) {
            if (newDynamicKpis[key].some(k => k.id === kpiId)) {
                newDynamicKpis[key] = newDynamicKpis[key].map(kpi => kpi.id === kpiId ? {
                    ...kpi,
                    activities: (kpi.activities || []).map(act => act.id === updatedActivity.id ? updatedActivity : act)
                } : kpi);
                return newDynamicKpis;
            }
        }
        return prevDynamicKpis; // Return old state if no match found
    });
  };

  // --- Context Value ---
  const value = {
    selectedMonth, setSelectedMonth, tasks, setTasks, customTabs, setCustomTabs,
    facilities, setFacilities, hotspots, setHotspots, safetyKPIs, setSafetyKPIs,
    leaseKPIs, setLeaseKPIs, tenants, setTenants, assetKPIs, setAssetKPIs,
    infraKPIs, setInfraKPIs, dynamicKpis, setDynamicKpis, allKpis, totalMonthlyPlans,
    updateKpiActivity
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

// --- Custom Hook for easy context consumption ---
export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
