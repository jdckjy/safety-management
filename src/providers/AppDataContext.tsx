
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode, useMemo } from 'react';
import { KPI, Activity, CustomTab, HotSpot, Facility, NavigationState, Task, TaskStatus } from '../types';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { useAuth } from '../features/auth/AuthContext';
import { Shield, Handshake, DollarSign, DraftingCompass } from 'lucide-react';
import { TASK_STATUS, MASTER_STATUS_TRANSITION_MAP } from '../constants';

// 1. AppContext의 인터페이스를 확장하여, 월을 안전하게 변경할 수 있는 전용 함수 `setSelectedMonth`의 명세를 추가합니다.
// 이는 컴포넌트가 전체 상태를 직접 수정하는 위험을 막고, 기능의 확장성과 안정성을 보장합니다.
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
  setSelectedMonth: (month: number) => void; // [안정성/캡슐화] 월 선택 전용 함수의 명세
  setSafetyKPIs: React.Dispatch<React.SetStateAction<KPI[]>>;
  setLeaseKPIs: React.Dispatch<React.SetStateAction<KPI[]>>;
  setAssetKPIs: React.Dispatch<React.SetStateAction<KPI[]>>;
  setInfraKPIs: React.Dispatch<React.SetStateAction<KPI[]>>;
  setHotspots: React.Dispatch<React.SetStateAction<HotSpot[]>>;
  setFacilities: React.Dispatch<React.SetStateAction<Facility[]>>;
}

const AppDataContext = createContext<IAppContext | undefined>(undefined);
const initialData: IAppData = { safetyKPIs: [], leaseKPIs: [], assetKPIs: [], infraKPIs: [], hotspots: [], facilities: [], customTabs: [] };

const sanitizeKpi = (partialKpi: Partial<KPI>): KPI => {
  const defaults: Omit<KPI, 'id'> = { title: '이름 없음 - 수정 필요', description: '', current: 0, target: 100, unit: '%', activities: [], previous: 0 };
  const id = partialKpi.id || `kpi-${Date.now()}-${Math.random()}`;

  const activities = (partialKpi.activities || []).map(act => {
    const activityStatus = MASTER_STATUS_TRANSITION_MAP[act.status as any] || TASK_STATUS.NOT_STARTED;
    return { ...act, id: act.id || `act-${Date.now()}-${Math.random()}`, status: activityStatus, 
      tasks: (act.tasks || []).map(task => {
        const newTask = { ...task } as any;
        if (newTask.dueDate && !newTask.startDate) {
          newTask.startDate = newTask.dueDate;
          newTask.endDate = newTask.dueDate;
          delete newTask.dueDate;
        }
        const taskStatus = MASTER_STATUS_TRANSITION_MAP[newTask.status as any] || TASK_STATUS.NOT_STARTED;
        return { id: newTask.id || `task-${Date.now()}-${Math.random()}`, name: newTask.name || '이름 없는 업무', startDate: newTask.startDate || new Date().toISOString(), endDate: newTask.endDate || new Date().toISOString(), status: taskStatus, records: newTask.records || [] };
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
  
  // 2. [정확성/유지보수성] `navigationState`를 현재 월로 명시적으로 초기화합니다.
  // 이로써 시스템은 항상 정확한 현재 시간에서 시작하며, 코드의 예측 가능성과 신뢰도가 향상됩니다.
  const [navigationState, setNavigationState] = useState<NavigationState>({
    menuKey: 'dashboard',
    selectedMonth: new Date().getMonth(),
  });

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
          const cleanData: IAppData = { safetyKPIs: (firestoreData.safetyKPIs || []).map(sanitizeKpi), leaseKPIs: (firestoreData.leaseKPIs || []).map(sanitizeKpi), assetKPIs: (firestoreData.assetKPIs || []).map(sanitizeKpi), infraKPIs: (firestoreData.infraKPIs || []).map(sanitizeKpi), hotspots: firestoreData.hotspots || [], facilities: firestoreData.facilities || [], customTabs: firestoreData.customTabs || [] };
          setData(cleanData);
        } else { await setDoc(userDocRef, initialData); setData(initialData); }
      } catch (error) { console.error("Error fetching data:", error); setData(initialData); }
      finally { setTimeout(() => { isInitialLoad.current = false; }, 0); }
    };
    fetchData();
  }, [currentUser, db]);

  useEffect(() => {
    if (isInitialLoad.current || !currentUser) return;
    const saveData = async () => {
      try { await setDoc(doc(db, 'users', currentUser.uid), data, { merge: true });
      } catch (error) { console.error("Error saving data:", error); }
    };
    const debounceSave = setTimeout(saveData, 300);
    return () => clearTimeout(debounceSave);
  }, [data, currentUser, db]);

  const updateKpiArray = useCallback((kpiId: string, updateFn: (kpi: KPI) => KPI) => {
    setData(prevData => {
        const kpiTypeKey = Object.keys(prevData).find(key => (prevData[key as keyof IAppData] as any[])?.some((item: any) => item.id === kpiId)) as keyof IAppData | undefined;
        if (kpiTypeKey) {
            const updatedKpis = (prevData[kpiTypeKey] as KPI[]).map(kpi => kpi.id === kpiId ? updateFn(kpi) : kpi);
            return { ...prevData, [kpiTypeKey]: updatedKpis };
        } else {
            console.error(`[CRITICAL] KPI with id ${kpiId} not found. Update failed.`);
            return prevData;
        }
    });
  }, []);
  
  const addActivityToKpi = useCallback(async (kpiId: string, newActivityData: Omit<Activity, 'id' | 'status' | 'tasks'>): Promise<Activity> => {
    const newActivity: Activity = { ...newActivityData, id: `activity-${Date.now()}-${Math.random()}`, status: TASK_STATUS.NOT_STARTED, tasks: [] };
    updateKpiArray(kpiId, kpi => ({ ...kpi, activities: [...(kpi.activities || []), newActivity] }));
    return newActivity;
  }, [updateKpiArray]);

  const updateActivityInKpi = useCallback((kpiId: string, updatedActivity: Activity) => { updateKpiArray(kpiId, kpi => ({...kpi, activities: (kpi.activities || []).map(act => act.id === updatedActivity.id ? updatedActivity : act)})); }, [updateKpiArray]);
  const deleteActivityFromKpi = useCallback((kpiId: string, activityId: string) => { updateKpiArray(kpiId, kpi => ({...kpi, activities: (kpi.activities || []).filter(act => act.id !== activityId)})); }, [updateKpiArray]);
  const addTask = useCallback((kpiId: string, activityId: string, newTaskData: Omit<Task, 'id' | 'status' | 'records'>) => { const newTask: Task = { ...newTaskData, id: `task-${Date.now()}-${Math.random()}`, status: TASK_STATUS.NOT_STARTED, records: [] }; updateKpiArray(kpiId, kpi => ({ ...kpi, activities: (kpi.activities || []).map(act => act.id === activityId ? { ...act, tasks: [...(act.tasks || []), newTask] } : act) })); }, [updateKpiArray]);
  const updateTask = useCallback((kpiId: string, activityId: string, updatedTask: Task) => { updateKpiArray(kpiId, kpi => ({ ...kpi, activities: (kpi.activities || []).map(act => act.id === activityId ? { ...act, tasks: (act.tasks || []).map(t => t.id === updatedTask.id ? updatedTask : t) } : act) })); }, [updateKpiArray]);
  const deleteTask = useCallback((kpiId: string, activityId: string, taskId: string) => { updateKpiArray(kpiId, kpi => ({ ...kpi, activities: (kpi.activities || []).map(act => act.id === activityId ? { ...act, tasks: (act.tasks || []).filter(t => t.id !== taskId) } : act) })); }, [updateKpiArray]);

  const navigateTo = useCallback((newState: Partial<NavigationState>) => { setNavigationState(prevState => ({ ...prevState, ...newState })); }, []);

  // 3. [안정성/캡슐화] 월 선택 전용 함수를 구현합니다.
  // 이 함수는 `navigateTo`를 호출하여 `selectedMonth`만 안전하게 업데이트하며, 다른 상태(`selectedKpi` 등)는 보존하여 기능 유실을 원천적으로 방지합니다.
  const setSelectedMonth = useCallback((month: number) => {
    navigateTo({ selectedMonth: month });
  }, [navigateTo]);

  const addTab = useCallback((newTab: Omit<CustomTab, 'key'>) => {
    const tabWithKey = { ...newTab, key: `custom-${Date.now()}-${Math.random()}` };
    setData(prev => ({ ...prev, customTabs: [...prev.customTabs, tabWithKey] }));
    navigateTo({ menuKey: tabWithKey.key });
  }, [navigateTo]);

  const kpiData = useMemo(() => {
    return [
      ...(data.safetyKPIs || []).map(k => ({ ...k, type: '안전 관리', icon: <Shield size={16}/>, color: 'text-pink-500' })),
      ...(data.leaseKPIs || []).map(k => ({ ...k, type: '임대 및 세대', icon: <Handshake size={16}/>, color: 'text-black' })),
      ...(data.assetKPIs || []).map(k => ({ ...k, type: '자산 가치', icon: <DollarSign size={16}/>, color: 'text-blue-500' })),
      ...(data.infraKPIs || []).map(k => ({ ...k, type: '인프라 개발', icon: <DraftingCompass size={16}/>, color: 'text-gray-400' }))
    ];
  }, [data.safetyKPIs, data.leaseKPIs, data.assetKPIs, data.infraKPIs]);

  // 4. 완성된 `setSelectedMonth` 함수를 컨텍스트를 통해 하위 컴포넌트에 제공합니다.
  const value: IAppContext = {
    ...data, kpiData, navigationState, setData, addActivityToKpi, updateActivityInKpi, deleteActivityFromKpi, 
    addTask, updateTask, deleteTask, addTab, navigateTo, setSelectedMonth,
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
