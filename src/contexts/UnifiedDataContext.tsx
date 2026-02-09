
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { KPI, BusinessActivity, CustomTab, HotSpot, Facility } from '../types';
import { createKpi } from '../data/factories';

// All initial data is removed to prevent inconsistencies.
// The state will be initialized with empty arrays and populated from a single source.

interface UnifiedData {
  safetyKPIs: KPI[];
  setSafetyKPIs: React.Dispatch<React.SetStateAction<KPI[]>>;
  leaseKPIs: KPI[];
  setLeaseKPIs: React.Dispatch<React.SetStateAction<KPI[]>>;
  assetKPIs: KPI[];
  setAssetKPIs: React.Dispatch<React.SetStateAction<KPI[]>>;
  infraKPIs: KPI[];
  setInfraKPIs: React.Dispatch<React.SetStateAction<KPI[]>>;
  hotspots: HotSpot[];
  setHotspots: React.Dispatch<React.SetStateAction<HotSpot[]>>;
  facilities: Facility[];
  setFacilities: React.Dispatch<React.SetStateAction<Facility[]>>;
  customTabs: CustomTab[];
  setCustomTabs: React.Dispatch<React.SetStateAction<CustomTab[]>>;
  selectedMonth: number;
  setSelectedMonth: React.Dispatch<React.SetStateAction<number>>;
  totalMonthlyPlans: number;
  updateKpiActivity: (kpiId: string, updatedActivity: BusinessActivity) => void;
}

const UnifiedDataContext = createContext<UnifiedData | undefined>(undefined);

export const UnifiedDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize all data states with empty arrays.
  const [safetyKPIs, setSafetyKPIs] = useState<KPI[]>([]);
  const [leaseKPIs, setLeaseKPIs] = useState<KPI[]>([]);
  const [assetKPIs, setAssetKPIs] = useState<KPI[]>([]);
  const [infraKPIs, setInfraKPIs] = useState<KPI[]>([]);
  const [hotspots, setHotspots] = useState<HotSpot[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [customTabs, setCustomTabs] = useState<CustomTab[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [totalMonthlyPlans, setTotalMonthlyPlans] = useState(0);

  const allKpiSetters: { [key: string]: React.Dispatch<React.SetStateAction<KPI[]>> } = {
    safety: setSafetyKPIs,
    lease: setLeaseKPIs,
    asset: setAssetKPIs,
    infra: setInfraKPIs,
  };

  const updateKpiActivity = useCallback((kpiId: string, updatedActivity: BusinessActivity) => {
    const kpiType = kpiId.split('-')[1];
    const setter = allKpiSetters[kpiType];
    if (setter) {
      setter(prevKpis =>
        prevKpis.map(kpi =>
          kpi.id === kpiId
            ? { ...kpi, activities: (kpi.activities || []).map(act => act.id === updatedActivity.id ? updatedActivity : act) }
            : kpi
        )
      );
    }
  }, []);

  useEffect(() => {
    const allKPIs = [...safetyKPIs, ...leaseKPIs, ...assetKPIs, ...infraKPIs];
    const count = allKPIs.reduce((acc, kpi) => {
        return acc + (kpi.activities || []).reduce((activityAcc, activity) => {
            const monthRecord = (activity.monthlyRecords || []).find(m => m.month === selectedMonth + 1);
            return activityAcc + (monthRecord?.plans?.length || 0);
        }, 0);
    }, 0);
    setTotalMonthlyPlans(count);
  }, [selectedMonth, safetyKPIs, leaseKPIs, assetKPIs, infraKPIs]);

  const value = {
    safetyKPIs,
    setSafetyKPIs,
    leaseKPIs,
    setLeaseKPIs,
    assetKPIs,
    setAssetKPIs,
    infraKPIs,
    setInfraKPIs,
    hotspots,
    setHotspots,
    facilities,
    setFacilities,
    customTabs,
    setCustomTabs,
    selectedMonth,
    setSelectedMonth,
    totalMonthlyPlans,
    updateKpiActivity,
  };

  return <UnifiedDataContext.Provider value={value}>{children}</UnifiedDataContext.Provider>;
};

export const useUnifiedData = (): UnifiedData => {
  const context = useContext(UnifiedDataContext);
  if (context === undefined) {
    throw new Error('useUnifiedData must be used within a UnifiedDataProvider');
  }
  return context;
};
