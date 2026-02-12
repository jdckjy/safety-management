
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode, useMemo } from 'react';
import { KPI, Activity, CustomTab, HotSpot, Facility, NavigationState, Task } from '../types';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { useAuth } from '../features/auth/AuthContext';
import { Shield, Handshake, DollarSign, DraftingCompass } from 'lucide-react';

// 데이터 인터페이스 정의 (변경 없음)
interface IAppData {
  safetyKPIs: KPI[];
  leaseKPIs: KPI[];
  assetKPIs: KPI[];
  infraKPIs: KPI[];
  hotspots: HotSpot[];
  facilities: Facility[];
  customTabs: CustomTab[];
}

// 컨텍스트 인터페이스 정의 (변경 없음)
interface IAppContext extends IAppData {
  kpiData: (KPI & { type: string; icon: React.ReactNode; color: string; })[];
  navigationState: NavigationState;
  setData: React.Dispatch<React.SetStateAction<IAppData>>;
  addActivityToKpi: (kpiId: string, newActivity: Omit<Activity, 'id' | 'status' | 'tasks'>) => Promise<Activity>;
  updateActivityInKpi: (kpiId: string, updatedActivity: Activity) => void;
  deleteActivityFromKpi: (kpiId: string, activityId: string) => void;
  addTask: (kpiId: string, activityId: string, newTaskData: Omit<Task, 'id' | 'status' | 'records'>) => void;
  updateTask: (kpiId: string, activityId: string, updatedTask: Task) => void;
  deleteTask: (kpiId: string, activityId: string, taskId: string) => void;
  addTab: (newTab: Omit<CustomTab, 'key'>) => void;
  navigateTo: (newState: Partial<NavigationState>) => void;
  setSafetyKPIs: React.Dispatch<React.SetStateAction<KPI[]>>;
  setLeaseKPIs: React.Dispatch<React.SetStateAction<KPI[]>>;
  setAssetKPIs: React.Dispatch<React.SetStateAction<KPI[]>>;
  setInfraKPIs: React.Dispatch<React.SetStateAction<KPI[]>>;
  setHotspots: React.Dispatch<React.SetStateAction<HotSpot[]>>;
  setFacilities: React.Dispatch<React.SetStateAction<Facility[]>>;
}

const AppDataContext = createContext<IAppContext | undefined>(undefined);

const initialData: IAppData = { safetyKPIs: [], leaseKPIs: [], assetKPIs: [], infraKPIs: [], hotspots: [], facilities: [], customTabs: [] };

// 데이터 로딩 시 기본값을 보장하는 함수
const sanitizeKpi = (partialKpi: Partial<KPI>): KPI => {
  const defaults: Omit<KPI, 'id'> = { title: 'Unnamed KPI', description: '', current: 0, target: 100, unit: '%', activities: [], previous: 0 };
  const id = partialKpi.id || `kpi-${Date.now()}-${Math.random()}`;
  
  const activities = (partialKpi.activities || []).map(act => ({
    ...act,
    id: act.id || `act-${Date.now()}-${Math.random()}`,
    status: act.status || 'not-started',
    tasks: (act.tasks || []).map(task => {
        const newTask = { ...task } as any; 
        if (newTask.dueDate && !newTask.startDate) {
            newTask.startDate = newTask.dueDate;
            newTask.endDate = newTask.dueDate;
            delete newTask.dueDate;
        }
        return {
            id: newTask.id || `task-${Date.now()}-${Math.random()}`,
            name: newTask.name || 'Unnamed Task',
            startDate: newTask.startDate || new Date().toISOString(),
            endDate: newTask.endDate || new Date().toISOString(),
            status: newTask.status || 'not-started',
            records: newTask.records || []
        };
    })
  }));
  
  return { ...defaults, ...partialKpi, id, activities }; 
};


export const AppDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const db = getFirestore();
  const isInitialLoad = React.useRef(true);
  const [data, setData] = useState<IAppData>(initialData);
  const [navigationState, setNavigationState] = useState<NavigationState>({ menuKey: 'dashboard' });

  // 데이터 로딩 로직
  useEffect(() => {
    if (!currentUser) {
      setData(initialData);
      isInitialLoad.current = true;
      return;
    }
    const fetchData = async () => {
      isInitialLoad.current = true;
      const userDocRef = doc(db, 'users', currentUser.uid);
      try {
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          const firestoreData = userDocSnap.data() as Partial<IAppData>;
          const cleanData: IAppData = {
            safetyKPIs: (firestoreData.safetyKPIs || []).map(sanitizeKpi), leaseKPIs: (firestoreData.leaseKPIs || []).map(sanitizeKpi),
            assetKPIs: (firestoreData.assetKPIs || []).map(sanitizeKpi), infraKPIs: (firestoreData.infraKPIs || []).map(sanitizeKpi),
            hotspots: firestoreData.hotspots || [], facilities: firestoreData.facilities || [], customTabs: firestoreData.customTabs || [],
          };
          setData(cleanData);
        } else {
          await setDoc(userDocRef, initialData); setData(initialData);
        }
      } catch (error) { console.error("Error fetching data:", error); setData(initialData); }
      finally { setTimeout(() => { isInitialLoad.current = false; }, 0); }
    };
    fetchData();
  }, [currentUser, db]);

  // *** BUG FIX: 데이터 저장 로직 수정 ***
  useEffect(() => {
    if (isInitialLoad.current || !currentUser) return;
    const saveData = async () => {
      try {
        // *** TRACING: 최종 저장 직전 데이터 추적 ***
        console.log('[Trace 3/3 - AppDataContext] Saving data to Firestore:', data);
        
        // 불필요한 데이터 재구성을 제거하고, 'data' 객체 전체를 저장하여
        // 'title'을 포함한 모든 속성이 보존되도록 합니다.
        await setDoc(doc(db, 'users', currentUser.uid), data, { merge: true });
      } catch (error) { 
        console.error("Error saving data:", error);
      }
    };
    // 쓰기 작업을 디바운스하여 성능 최적화
    const debounceSave = setTimeout(saveData, 300);
    return () => clearTimeout(debounceSave);
  }, [data, currentUser, db]);

  // 상태 업데이트 로직 (Stale Closure 문제 해결된 버전)
  const updateKpiArray = useCallback((kpiId: string, updateFn: (kpi: KPI) => KPI) => {
    setData(prevData => {
        const kpiTypeKey = Object.keys(prevData).find(key =>
            (prevData[key as keyof IAppData] as any[])?.some((item: any) => item.id === kpiId)
        ) as keyof IAppData | undefined;

        if (kpiTypeKey) {
            const updatedKpis = (prevData[kpiTypeKey] as KPI[]).map(kpi => 
                kpi.id === kpiId ? updateFn(kpi) : kpi
            );
            return { ...prevData, [kpiTypeKey]: updatedKpis };
        } else {
            console.error(`[CRITICAL] KPI with id ${kpiId} not found. Update failed.`);
            return prevData;
        }
    });
  }, []);
  
  const addActivityToKpi = useCallback(async (kpiId: string, newActivityData: Omit<Activity, 'id' | 'status' | 'tasks'>): Promise<Activity> => {
    const newActivity: Activity = { ...newActivityData, id: `activity-${Date.now()}-${Math.random()}`, status: 'not-started', tasks: [] };
    updateKpiArray(kpiId, kpi => ({ ...kpi, activities: [...(kpi.activities || []), newActivity] }));
    return newActivity;
  }, [updateKpiArray]);

  const updateActivityInKpi = useCallback((kpiId: string, updatedActivity: Activity) => {
    updateKpiArray(kpiId, kpi => ({...kpi, activities: (kpi.activities || []).map(act => act.id === updatedActivity.id ? updatedActivity : act)}));
  }, [updateKpiArray]);

  const deleteActivityFromKpi = useCallback((kpiId: string, activityId: string) => {
    updateKpiArray(kpiId, kpi => ({...kpi, activities: (kpi.activities || []).filter(act => act.id !== activityId)}));
  }, [updateKpiArray]);

  const addTask = useCallback((kpiId: string, activityId: string, newTaskData: Omit<Task, 'id' | 'status' | 'records'>) => {
    const newTask: Task = { ...newTaskData, id: `task-${Date.now()}-${Math.random()}`, status: 'not-started', records: [] };
    updateKpiArray(kpiId, kpi => ({
      ...kpi,
      activities: (kpi.activities || []).map(act => 
        act.id === activityId 
          ? { ...act, tasks: [...(act.tasks || []), newTask] } 
          : act
      )
    }));
  }, [updateKpiArray]);

  const updateTask = useCallback((kpiId: string, activityId: string, updatedTask: Task) => {
    updateKpiArray(kpiId, kpi => ({ ...kpi, activities: (kpi.activities || []).map(act => act.id === activityId ? { ...act, tasks: (act.tasks || []).map(t => t.id === updatedTask.id ? updatedTask : t) } : act) }));
  }, [updateKpiArray]);

  const deleteTask = useCallback((kpiId: string, activityId: string, taskId: string) => {
    updateKpiArray(kpiId, kpi => ({ ...kpi, activities: (kpi.activities || []).map(act => act.id === activityId ? { ...act, tasks: (act.tasks || []).filter(t => t.id !== taskId) } : act) }));
  }, [updateKpiArray]);

  const navigateTo = useCallback((newState: Partial<NavigationState>) => { setNavigationState(prevState => ({ ...prevState, ...newState })); }, []);

  const addTab = useCallback((newTab: Omit<CustomTab, 'key'>) => {
    const tabWithKey = { ...newTab, key: `custom-${Date.now()}-${Math.random()}` };
    setData(prev => ({ ...prev, customTabs: [...prev.customTabs, tabWithKey] }));
    navigateTo({ menuKey: tabWithKey.key });
  }, [navigateTo]);

  const kpiData = useMemo(() => [
    ...(data.safetyKPIs || []).map(k => ({ ...k, type: '안전 관리', icon: <Shield size={16}/>, color: 'text-pink-500' })),
    ...(data.leaseKPIs || []).map(k => ({ ...k, type: '임대 및 세대', icon: <Handshake size={16}/>, color: 'text-black' })),
    ...(data.assetKPIs || []).map(k => ({ ...k, type: '자산 가치', icon: <DollarSign size={16}/>, color: 'text-blue-500' })),
    ...(data.infraKPIs || []).map(k => ({ ...k, type: '인프라 개발', icon: <DraftingCompass size={16}/>, color: 'text-gray-400' }))
  ], [data.safetyKPIs, data.leaseKPIs, data.assetKPIs, data.infraKPIs]);

  const value: IAppContext = {
    ...data, kpiData, navigationState, setData, addActivityToKpi, updateActivityInKpi, deleteActivityFromKpi, 
    addTask, updateTask, deleteTask, addTab, navigateTo,
    setSafetyKPIs: (kpis) => setData(p => ({...p, safetyKPIs: typeof kpis === 'function' ? kpis(p.safetyKPIs) : kpis})),
    setLeaseKPIs: (kpis) => setData(p => ({...p, leaseKPIs: typeof kpis === 'function' ? kpis(p.leaseKPIs) : kpis})),
    setAssetKPIs: (kpis) => setData(p => ({...p, assetKPIs: typeof kpis === 'function' ? kpis(p.assetKPIs) : kpis})),
    setInfraKPIs: (kpis) => setData(p => ({...p, infraKPIs: typeof kpis === 'function' ? kpis(p.infraKPIs) : kpis})),
    setHotspots: (spots) => setData(p => ({...p, hotspots: typeof spots === 'function' ? spots(p.hotspots) : spots})),
    setFacilities: (facilities) => setData(p => ({...p, facilities: typeof facilities === 'function' ? facilities(p.facilities) : facilities})),
  };

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
};

export const useAppData = (): IAppContext => {
  const context = useContext(AppDataContext);
  if (context === undefined) { throw new Error('useAppData must be used within a AppDataProvider'); }
  return context;
};
