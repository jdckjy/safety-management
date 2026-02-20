
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode, useMemo } from 'react';
// [수정] 더 이상 사용하지 않는 CustomTab 타입을 임포트하지 않습니다.
import { IAppData, KPI, Activity, HotSpot, Facility, NavigationState, Task, TaskStatus, ComplexFacility } from '../types';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { useAuth } from '../features/auth/AuthContext';
import { Shield, Handshake, DollarSign, DraftingCompass } from 'lucide-react';
import { TASK_STATUS, MASTER_STATUS_TRANSITION_MAP } from '../constants';
import { initialComplexFacilities } from '../data/initial-complex-facilities';

// [수정] IAppContext 인터페이스에서 customTabs 및 addTab 관련 정의를 제거합니다.
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
  navigateTo: (newState: Partial<NavigationState>) => void;
  setSelectedMonth: (month: number) => void; 
  setSafetyKPIs: React.Dispatch<React.SetStateAction<KPI[]>>;
  setLeaseKPIs: React.Dispatch<React.SetStateAction<KPI[]>>;
  setAssetKPIs: React.Dispatch<React.SetStateAction<KPI[]>>;
  setInfraKPIs: React.Dispatch<React.SetStateAction<KPI[]>>;
  setHotspots: React.Dispatch<React.SetStateAction<HotSpot[]>>;
  setFacilities: React.Dispatch<React.SetStateAction<Facility[]>>;
  setComplexFacilities: React.Dispatch<React.SetStateAction<ComplexFacility[]>>;
  addComplexFacility: (newFacility: Omit<ComplexFacility, 'id'>) => void;
  updateComplexFacility: (updatedFacility: ComplexFacility) => void;
  deleteComplexFacility: (facilityId: string) => void;
}

const AppDataContext = createContext<IAppContext | undefined>(undefined);

// [수정] 초기 데이터에서 customTabs를 제거합니다.
const initialData: IAppData = { 
  safetyKPIs: [], 
  leaseKPIs: [], 
  assetKPIs: [], 
  infraKPIs: [], 
  hotspots: [], 
  facilities: [], 
  complexFacilities: initialComplexFacilities
};


const sanitizeKpi = (partialKpi: Partial<KPI>): KPI => {
  // ... (이하 sanitizeKpi 함수는 변경 없음)
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
          
          // [수정] customTabs 관련 데이터 처리 로직을 완전히 제거합니다.
          const cleanData: IAppData = {
            safetyKPIs: (firestoreData.safetyKPIs || []).map(sanitizeKpi),
            leaseKPIs: (firestoreData.leaseKPIs || []).map(sanitizeKpi),
            assetKPIs: (firestoreData.assetKPIs || []).map(sanitizeKpi),
            infraKPIs: (firestoreData.infraKPIs || []).map(sanitizeKpi),
            hotspots: firestoreData.hotspots || [],
            facilities: firestoreData.facilities || [],
            complexFacilities: (firestoreData.complexFacilities && firestoreData.complexFacilities.length > 0) 
              ? firestoreData.complexFacilities 
              : initialComplexFacilities,
          };
          setData(cleanData);
        } else {
          // [수정] 신규 사용자 데이터 생성 시 customTabs 관련 로직을 제거합니다.
          await setDoc(userDocRef, initialData);
          setData(initialData);
        }
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

  // ... (이하 KPI, Activity, Task 관련 함수들은 변경 없음) ...
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

  const setSelectedMonth = useCallback((month: number) => {
    navigateTo({ selectedMonth: month });
  }, [navigateTo]);

  // [수정] 불필요한 addTab 함수를 완전히 제거합니다.

  const addComplexFacility = useCallback((newFacility: Omit<ComplexFacility, 'id'>) => {
    const facilityWithId = { ...newFacility, id: `complex-${Date.now()}-${Math.random()}` };
    setData(prev => ({ ...prev, complexFacilities: [...prev.complexFacilities, facilityWithId] }));
  }, []);

  const updateComplexFacility = useCallback((updatedFacility: ComplexFacility) => {
    setData(prev => ({ ...prev, complexFacilities: prev.complexFacilities.map(f => f.id === updatedFacility.id ? updatedFacility : f) }));
  }, []);

  const deleteComplexFacility = useCallback((facilityId: string) => {
    setData(prev => ({ ...prev, complexFacilities: prev.complexFacilities.filter(f => f.id !== facilityId) }));
  }, []);

  const kpiData = useMemo(() => {
    // ... (kpiData 생성 로직은 변경 없음)
    return [
      ...(data.safetyKPIs || []).map(k => ({ ...k, type: '안전 관리', icon: <Shield size={16}/>, color: 'text-pink-500' })),
      ...(data.leaseKPIs || []).map(k => ({ ...k, type: '임대 및 세대', icon: <Handshake size={16}/>, color: 'text-black' })),
      ...(data.assetKPIs || []).map(k => ({ ...k, type: '자산 가치', icon: <DollarSign size={16}/>, color: 'text-blue-500' })),
      ...(data.infraKPIs || []).map(k => ({ ...k, type: '인프라 개발', icon: <DraftingCompass size={16}/>, color: 'text-gray-400' }))
    ];
  }, [data.safetyKPIs, data.leaseKPIs, data.assetKPIs, data.infraKPIs]);

  // [수정] 컨텍스트 value에서 customTabs와 addTab을 제거합니다.
  const value: IAppContext = {
    ...data, kpiData, navigationState, setData, addActivityToKpi, updateActivityInKpi, deleteActivityFromKpi, 
    addTask, updateTask, deleteTask, navigateTo, setSelectedMonth,
    setSafetyKPIs: (kpis) => setData(p => ({...p, safetyKPIs: typeof kpis === 'function' ? kpis(p.safetyKPIs) : kpis})),
    setLeaseKPIs: (kpis) => setData(p => ({...p, leaseKPIs: typeof kpis === 'function' ? kpis(p.leaseKPIs) : kpis})),
    setAssetKPIs: (kpis) => setData(p => ({...p, assetKPIs: typeof kpis === 'function' ? kpis(p.assetKPIs) : kpis})),
    setInfraKPIs: (kpis) => setData(p => ({...p, infraKPIs: typeof kpis === 'function' ? kpis(p.infraKPIs) : kpis})),
    setHotspots: (spots) => setData(p => ({...p, hotspots: typeof spots === 'function' ? spots(p.hotspots) : spots})),
    setFacilities: (facilities) => setData(p => ({...p, facilities: typeof facilities === 'function' ? facilities(p.facilities) : facilities})),
    setComplexFacilities: (facilities) => setData(p => ({...p, complexFacilities: typeof facilities === 'function' ? facilities(p.complexFacilities) : facilities})),
    addComplexFacility,
    updateComplexFacility,
    deleteComplexFacility,
  };

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
};

export const useAppData = (): IAppContext => {
  const context = useContext(AppDataContext);
  if (context === undefined) { throw new Error('useAppData must be used within a AppDataProvider'); }
  return context;
};
