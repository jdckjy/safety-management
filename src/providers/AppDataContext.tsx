
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode, useMemo } from 'react';
import { KPI, Activity, CustomTab, HotSpot, Facility, NavigationState, Task, TaskStatus } from '../types';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { useAuth } from '../features/auth/AuthContext';
import { Shield, Handshake, DollarSign, DraftingCompass } from 'lucide-react';
// 1. "Single Source of Truth"와 "마스터 상태 변환 맵"을 임포트합니다.
import { TASK_STATUS, MASTER_STATUS_TRANSITION_MAP } from '../constants';

// ... (인터페이스 정의는 변경 없음)
interface IAppData {
  safetyKPIs: KPI[];
  leaseKPIs: KPI[];
  assetKPIs: KPI[];
  infraKPIs: KPI[];
  hotspots: HotSpot[];
  facilities: Facility[];
  customTabs: CustomTab[];
}

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

// *** 시스템의 심장: "마스터 상태 변환 맵"을 사용한 데이터 정제 시스템 ***
const sanitizeKpi = (partialKpi: Partial<KPI>): KPI => {
  const defaults: Omit<KPI, 'id'> = { title: '이름 없음 - 수정 필요', description: '', current: 0, target: 100, unit: '%', activities: [], previous: 0 };
  const id = partialKpi.id || `kpi-${Date.now()}-${Math.random()}`;

  const activities = (partialKpi.activities || []).map(act => {
    // 2. 활동(Activity)의 상태를 "마스터 맵"을 통해 완벽하게 정제합니다.
    const activityStatus = MASTER_STATUS_TRANSITION_MAP[act.status as any] || TASK_STATUS.NOT_STARTED;

    return {
      ...act,
      id: act.id || `act-${Date.now()}-${Math.random()}`,
      status: activityStatus, // 100% 보장된, 깨끗한 상태값만 사용됩니다.
      tasks: (act.tasks || []).map(task => {
        const newTask = { ...task } as any;

        if (newTask.dueDate && !newTask.startDate) {
          newTask.startDate = newTask.dueDate;
          newTask.endDate = newTask.dueDate;
          delete newTask.dueDate;
        }

        // 3. *** 핵심: 업무(Task)의 상태를 "마스터 맵"을 통해 완벽하게 정제합니다. ***
        const taskStatus = MASTER_STATUS_TRANSITION_MAP[newTask.status as any] || TASK_STATUS.NOT_STARTED;

        return {
          id: newTask.id || `task-${Date.now()}-${Math.random()}`,
          name: newTask.name || '이름 없는 업무',
          startDate: newTask.startDate || new Date().toISOString(),
          endDate: newTask.endDate || new Date().toISOString(),
          status: taskStatus, // 100% 보장된, 깨끗한 상태값만 사용됩니다.
          records: newTask.records || [],
        };
      }),
    };
  });

  return { ...defaults, ...partialKpi, id, activities };
};


export const AppDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const db = getFirestore();
  const isInitialLoad = React.useRef(true);
  const [data, setData] = useState<IAppData>(initialData);
  const [navigationState, setNavigationState] = useState<NavigationState>({ menuKey: 'dashboard' });

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
            safetyKPIs: (firestoreData.safetyKPIs || []).map(sanitizeKpi), 
            leaseKPIs: (firestoreData.leaseKPIs || []).map(sanitizeKpi),
            assetKPIs: (firestoreData.assetKPIs || []).map(sanitizeKpi), 
            infraKPIs: (firestoreData.infraKPIs || []).map(sanitizeKpi),
            hotspots: firestoreData.hotspots || [], 
            facilities: firestoreData.facilities || [], 
            customTabs: firestoreData.customTabs || [],
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

  useEffect(() => {
    if (isInitialLoad.current || !currentUser) return;
    const saveData = async () => {
      try {
        await setDoc(doc(db, 'users', currentUser.uid), data, { merge: true });
      } catch (error) { 
        console.error("Error saving data:", error);
      }
    };
    const debounceSave = setTimeout(saveData, 300);
    return () => clearTimeout(debounceSave);
  }, [data, currentUser, db]);

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
  
  // 4. 생성되는 모든 활동/업무는 이제 TASK_STATUS.NOT_STARTED를 기본값으로 가집니다.
  const addActivityToKpi = useCallback(async (kpiId: string, newActivityData: Omit<Activity, 'id' | 'status' | 'tasks'>): Promise<Activity> => {
    const newActivity: Activity = { ...newActivityData, id: `activity-${Date.now()}-${Math.random()}`, status: TASK_STATUS.NOT_STARTED, tasks: [] };
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
    const newTask: Task = { ...newTaskData, id: `task-${Date.now()}-${Math.random()}`, status: TASK_STATUS.NOT_STARTED, records: [] };
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

  const kpiData = useMemo(() => {
    const allKpis = [
      ...(data.safetyKPIs || []).map(k => ({ ...k, type: '안전 관리', icon: <Shield size={16}/>, color: 'text-pink-500' })),
      ...(data.leaseKPIs || []).map(k => ({ ...k, type: '임대 및 세대', icon: <Handshake size={16}/>, color: 'text-black' })),
      ...(data.assetKPIs || []).map(k => ({ ...k, type: '자산 가치', icon: <DollarSign size={16}/>, color: 'text-blue-500' })),
      ...(data.infraKPIs || []).map(k => ({ ...k, type: '인프라 개발', icon: <DraftingCompass size={16}/>, color: 'text-gray-400' }))
    ];
    return allKpis;
  }, [data.safetyKPIs, data.leaseKPIs, data.assetKPIs, data.infraKPIs]);

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
