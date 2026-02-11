
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { KPI, BusinessActivity, CustomTab, HotSpot, Facility, NavigationState, Task, TaskStatus } from '../types';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { useAuth } from '../features/auth/AuthContext';

interface IAppData {
  safetyKPIs: KPI[];
  leaseKPIs: KPI[];
  assetKPIs: KPI[];
  infraKPIs: KPI[];
  hotspots: HotSpot[];
  facilities: Facility[];
  customTabs: CustomTab[];
  monthlyTasks: Task[];
}

interface IAppContext extends IAppData {
  selectedMonth: number;
  totalMonthlyTasks: number;
  navigationState: NavigationState;
  setData: React.Dispatch<React.SetStateAction<IAppData>>;
  setSelectedMonth: React.Dispatch<React.SetStateAction<number>>;
  updateKpiActivity: (kpiId: string, updatedActivity: BusinessActivity) => void;
  updateTaskStatus: (taskId: string, newStatus: TaskStatus) => void;
  addTask: (newTask: Omit<Task, 'id' | 'status'>) => void;
  deleteTask: (taskId: string) => void;
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

const initialData: IAppData = {
  safetyKPIs: [],
  leaseKPIs: [],
  assetKPIs: [],
  infraKPIs: [],
  hotspots: [],
  facilities: [],
  customTabs: [],
  monthlyTasks: [],
};

export const AppDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const db = getFirestore();
  const isInitialLoad = React.useRef(true);

  const [data, setData] = useState<IAppData>(initialData);
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [totalMonthlyTasks, setTotalMonthlyTasks] = useState(0);
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
          const firestoreData = userDocSnap.data() as IAppData;
          firestoreData.monthlyTasks = firestoreData.monthlyTasks || [];
          setData({ ...initialData, ...firestoreData });
        } else {
          await setDoc(userDocRef, initialData);
          setData(initialData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setData(initialData);
      } finally {
        setTimeout(() => { isInitialLoad.current = false; }, 0);
      }
    };

    fetchData();
  }, [currentUser, db]);

  useEffect(() => {
    if (isInitialLoad.current || !currentUser) return;

    const saveData = async () => {
      try {
        const userDocRef = doc(db, 'users', currentUser.uid);
        await setDoc(userDocRef, data, { merge: true });
      } catch (error) {
        console.error("Error saving data:", error);
      }
    };
    
    const debounceSave = setTimeout(() => saveData(), 300);
    return () => clearTimeout(debounceSave);

  }, [data, currentUser, db]);

  const updateKpiActivity = useCallback((kpiId: string, updatedActivity: BusinessActivity) => {
    const kpiTypeKey = kpiId.split('-')[1] + 'KPIs' as keyof IAppData;
    
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

  const addTask = useCallback((newTask: Omit<Task, 'id' | 'status'>) => {
    setData(prev => ({
      ...prev,
      monthlyTasks: [
        ...prev.monthlyTasks,
        { ...newTask, id: `task-${Date.now()}`, status: 'not-started' }
      ]
    }));
  }, []);

  const updateTaskStatus = useCallback((taskId: string, newStatus: TaskStatus) => {
    setData(prev => ({
      ...prev,
      monthlyTasks: prev.monthlyTasks.map(task => 
        task.id === taskId ? { ...task, status: newStatus } : task
      )
    }));
  }, []);

  const deleteTask = useCallback((taskId: string) => {
    setData(prev => ({
      ...prev,
      monthlyTasks: prev.monthlyTasks.filter(task => task.id !== taskId)
    }));
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
    const count = data.monthlyTasks.filter(task => task.month === selectedMonth + 1).length;
    setTotalMonthlyTasks(count);
  }, [selectedMonth, data.monthlyTasks]);

  const value: IAppContext = {
    ...data,
    setData,
    selectedMonth,
    setSelectedMonth,
    totalMonthlyTasks,
    navigationState,
    updateKpiActivity,
    updateTaskStatus,
    addTask,
    deleteTask, 
    addTab,
    navigateTo,
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
  if (context === undefined) {
    throw new Error('useAppData must be used within a AppDataProvider');
  }
  return context;
};
