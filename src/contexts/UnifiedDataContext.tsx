
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { KPI, BusinessActivity, CustomTab, HotSpot, Facility, NavigationState } from '../types';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { useAuth } from './AuthContext';
import { initialSafetyKPIs, initialLeaseKPIs, initialAssetKPIs, initialInfraKPIs, initialHotspots, initialFacilities } from './mockData';

// 1. 하나의 데이터 구조로 통합
interface IUnifiedData {
  safetyKPIs: KPI[];
  leaseKPIs: KPI[];
  assetKPIs: KPI[];
  infraKPIs: KPI[];
  hotspots: HotSpot[];
  facilities: Facility[];
  customTabs: CustomTab[];
}

interface IUnifiedContext extends IUnifiedData {
  // UI/Navigation states
  selectedMonth: number;
  totalMonthlyPlans: number;
  navigationState: NavigationState;

  // Setters and Actions
  // 개별 setter 대신 전체 데이터를 업데이트하는 함수를 제공
  setData: React.Dispatch<React.SetStateAction<IUnifiedData>>; 
  setSelectedMonth: React.Dispatch<React.SetStateAction<number>>;
  updateKpiActivity: (kpiId: string, updatedActivity: BusinessActivity) => void;
  addTab: (newTab: Omit<CustomTab, 'key'>) => void;
  navigateTo: (newState: Partial<NavigationState>) => void;
  // 하위 호환성을 위한 개별 setter
  setSafetyKPIs: React.Dispatch<React.SetStateAction<KPI[]>>;
  setLeaseKPIs: React.Dispatch<React.SetStateAction<KPI[]>>;
  setAssetKPIs: React.Dispatch<React.SetStateAction<KPI[]>>;
  setInfraKPIs: React.Dispatch<React.SetStateAction<KPI[]>>;
  setHotspots: React.Dispatch<React.SetStateAction<HotSpot[]>>;
  setFacilities: React.Dispatch<React.SetStateAction<Facility[]>>;
}

const UnifiedDataContext = createContext<IUnifiedContext | undefined>(undefined);

// 2. 초기 상태를 함수 외부에서 정의
const initialData: IUnifiedData = {
  safetyKPIs: initialSafetyKPIs,
  leaseKPIs: initialLeaseKPIs,
  assetKPIs: initialAssetKPIs,
  infraKPIs: initialInfraKPIs,
  hotspots: initialHotspots,
  facilities: initialFacilities,
  customTabs: [],
};

export const UnifiedDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const db = getFirestore();
  const isInitialLoad = React.useRef(true);

  // 3. 여러 useState를 하나로 통합
  const [data, setData] = useState<IUnifiedData>(initialData);

  // UI/Navigation states (이들은 그대로 유지)
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [totalMonthlyPlans, setTotalMonthlyPlans] = useState(0);
  const [navigationState, setNavigationState] = useState<NavigationState>({ menuKey: 'dashboard' });

  // 데이터 로딩 Effect (단 한 번만 실행되도록 개선)
  useEffect(() => {
    if (!currentUser) {
      setData(initialData); // 로그아웃 시 목업 데이터로 리셋
      isInitialLoad.current = true; // 다음 로그인 시 다시 로드하도록 설정
      return;
    }

    const fetchData = async () => {
      isInitialLoad.current = true; // 로딩 시작
      console.log(`Fetching data for user: ${currentUser.uid}`);
      const userDocRef = doc(db, 'users', currentUser.uid);
      try {
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          console.log("Firestore document found. Loading data.");
          const firestoreData = userDocSnap.data() as IUnifiedData;
          // Firestore 데이터와 초기 데이터를 합쳐 누락된 필드가 없도록 보장
          setData({ ...initialData, ...firestoreData });
        } else {
          console.log("No user document, initializing with default data in Firestore.");
          await setDoc(userDocRef, initialData);
          setData(initialData);
        }
      } catch (error) {
        console.error("Error fetching data, loading mock data as fallback:", error);
        setData(initialData);
      } finally {
        // 첫 로드가 끝나면, isInitialLoad flag를 false로 설정
        setTimeout(() => { isInitialLoad.current = false; }, 0);
      }
    };

    fetchData();
  }, [currentUser, db]);

  // 데이터 저장 Effect (레이스 컨디션 해결)
  useEffect(() => {
    // 첫 데이터 로딩 중에는 이 Effect를 실행하지 않음
    if (isInitialLoad.current || !currentUser) {
      return;
    }

    const saveData = async () => {
      console.log("Change detected. Attempting to save data to Firestore...");
      try {
        const userDocRef = doc(db, 'users', currentUser.uid);
        await setDoc(userDocRef, data, { merge: true });
        console.log("Data successfully saved to Firestore.");
      } catch (error) {
        console.error("Error saving data to Firestore:", error);
      }
    };
    
    // 데이터 변경 후 300ms 뒤에 저장 (불필요한 저장 방지)
    const debounceSave = setTimeout(() => saveData(), 300);
    return () => clearTimeout(debounceSave);

  }, [data, currentUser, db]); // 이제 단일 'data' 객체에만 의존

  // KPI 활동 업데이트 로직 (새로운 구조에 맞게 수정)
  const updateKpiActivity = useCallback((kpiId: string, updatedActivity: BusinessActivity) => {
    const kpiTypeKey = kpiId.split('-')[1] + 'KPIs' as keyof IUnifiedData;
    
    setData(prevData => {
        const kpiArray = prevData[kpiTypeKey] as KPI[] | undefined;
        if(!kpiArray) return prevData;

        const newKpiData = kpiArray.map((kpi: KPI) => 
            kpi.id === kpiId
            ? { ...kpi, activities: (kpi.activities || []).map(act => act.id === updatedActivity.id ? updatedActivity : act) }
            : kpi
        );
        return { ...prevData, [kpiTypeKey]: newKpiData };
    });
  }, []);

  const navigateTo = useCallback((newState: Partial<NavigationState>) => {
    setNavigationState(prevState => ({ ...prevState, ...newState }));
  }, []);

  const addTab = useCallback((newTab: Omit<CustomTab, 'key'>) => {
    const key = `custom-${Date.now()}`;
    const tabWithKey = { ...newTab, key };
    setData(prev => ({ ...prev, customTabs: [...prev.customTabs, tabWithKey] }));
    navigateTo({ menuKey: key });
  }, [navigateTo]);

  useEffect(() => {
    const allKPIs = [
        ...data.safetyKPIs,
        ...data.leaseKPIs,
        ...data.assetKPIs,
        ...data.infraKPIs,
    ];
    const count = allKPIs.reduce((acc, kpi) => {
      if (!kpi || !kpi.activities) return acc;
      return acc + (kpi.activities || []).reduce((activityAcc, activity) => {
          const monthRecord = (activity.monthlyRecords || []).find(m => m.month === selectedMonth + 1);
          return activityAcc + (monthRecord?.plans?.length || 0);
      }, 0);
    }, 0);
    setTotalMonthlyPlans(count);
  }, [selectedMonth, data]);

  // Provider에 전달할 값
  const value: IUnifiedContext = {
    ...data,
    setData, // 전체 데이터 setter
    selectedMonth,
    setSelectedMonth,
    totalMonthlyPlans,
    navigationState,
    updateKpiActivity,
    addTab,
    navigateTo,
    // 하위 호환성을 위한 개별 setter들
    setSafetyKPIs: (kpis) => setData(p => ({...p, safetyKPIs: typeof kpis === 'function' ? kpis(p.safetyKPIs) : kpis})),
    setLeaseKPIs: (kpis) => setData(p => ({...p, leaseKPIs: typeof kpis === 'function' ? kpis(p.leaseKPIs) : kpis})),
    setAssetKPIs: (kpis) => setData(p => ({...p, assetKPIs: typeof kpis === 'function' ? kpis(p.assetKPIs) : kpis})),
    setInfraKPIs: (kpis) => setData(p => ({...p, infraKPIs: typeof kpis === 'function' ? kpis(p.infraKPIs) : kpis})),
    setHotspots: (spots) => setData(p => ({...p, hotspots: typeof spots === 'function' ? spots(p.hotspots) : spots})),
    setFacilities: (facilities) => setData(p => ({...p, facilities: typeof facilities === 'function' ? facilities(p.facilities) : facilities})),
  };

  return <UnifiedDataContext.Provider value={value}>{children}</UnifiedDataContext.Provider>;
};

export const useUnifiedData = (): IUnifiedContext => {
  const context = useContext(UnifiedDataContext);
  if (context === undefined) {
    throw new Error('useUnifiedData must be used within a UnifiedDataProvider');
  }
  return context;
};
