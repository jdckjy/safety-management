
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode, useMemo } from 'react';
import { IProjectData, KPI, Activity, HotSpot, Facility, NavigationState, Task, TaskStatus, ComplexFacility, TeamMember, TenantUnit, Comment } from '../types';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { useAuth } from '../features/auth/AuthContext';
import { Shield, Handshake, DollarSign, DraftingCompass } from 'lucide-react';
import { TASK_STATUS, MASTER_STATUS_TRANSITION_MAP } from '../constants';
import { initialComplexFacilities } from '../data/initial-complex-facilities';
import { initialTeamMembers } from '../data/initial-team-members';
import { initialTenantUnits } from '../data/tenantUnits';

// Interface defining the context shape
interface IProjectDataContext extends IProjectData {
  kpiData: (KPI & { type: string; icon: React.ReactNode; color: string; })[];
  navigationState: NavigationState;
  setData: React.Dispatch<React.SetStateAction<IProjectData>>;
  addActivityToKpi: (kpiId: string, newActivity: Omit<Activity, 'id' | 'status' | 'tasks'>) => Promise<Activity>;
  updateActivityInKpi: (kpiId: string, updatedActivity: Activity) => void;
  deleteActivityFromKpi: (kpiId: string, activityId: string) => void;
  addTask: (kpiId: string, activityId: string, newTaskData: Omit<Task, 'id' | 'status' | 'records'>) => void;
  updateTask: (kpiId: string, activityId: string, updatedTask: Task) => void;
  deleteTask: (kpiId: string, activityId: string, taskId: string) => void;
  addCommentToTask: (kpiId: string, activityId: string, taskId: string, content: string) => void;
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
  setTeamMembers: React.Dispatch<React.SetStateAction<TeamMember[]>>;
  addTeamMember: (newMember: Omit<TeamMember, 'id'>) => void;
  updateTeamMember: (updatedMember: TeamMember) => void;
  deleteTeamMember: (memberId: string) => void;
  setTenantUnits: React.Dispatch<React.SetStateAction<TenantUnit[]>>;
  addTenantUnit: (newUnit: Omit<TenantUnit, 'id' | 'pathData'>) => void;
  updateTenantUnit: (updatedUnit: TenantUnit) => void;
  deleteTenantUnit: (unitId: string) => void;
}

const ProjectDataContext = createContext<IProjectDataContext | undefined>(undefined);

const initialData: IProjectData = { 
  safetyKPIs: [], 
  leaseKPIs: [], 
  assetKPIs: [], 
  infraKPIs: [], 
  hotspots: [], 
  facilities: [], 
  complexFacilities: initialComplexFacilities,
  teamMembers: initialTeamMembers,
  tenantUnits: initialTenantUnits,
};

// Data Sanitization Helper
const sanitizeKpi = (partialKpi: Partial<KPI>): KPI => {
  const defaults: Omit<KPI, 'id'> = { title: '이름 없음 - 수정 필요', description: '', current: 0, target: 100, unit: '%', activities: [], previous: 0 };
  const id = partialKpi.id || `kpi-${Date.now()}-${Math.random()}`;

  const activities = (partialKpi.activities || []).map(act => ({
    ...act,
    id: act.id || `act-${Date.now()}-${Math.random()}`,
    status: MASTER_STATUS_TRANSITION_MAP[act.status as any] || TASK_STATUS.NOT_STARTED,
    tasks: (act.tasks || []).map(task => ({
      ...task,
      id: task.id || `task-${Date.now()}-${Math.random()}`,
      name: task.name || '이름 없는 업무',
      startDate: task.startDate || new Date().toISOString(),
      endDate: task.endDate || new Date().toISOString(),
      status: MASTER_STATUS_TRANSITION_MAP[task.status as any] || TASK_STATUS.NOT_STARTED,
      records: task.records || [],
      comments: task.comments || [], // Ensure comments array exists
    })),
  }));

  return { ...defaults, ...partialKpi, id, activities };
};

export const ProjectDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const db = getFirestore();
  const isInitialLoad = React.useRef(true);
  const [data, setData] = useState<IProjectData>(initialData);
  
  const [navigationState, setNavigationState] = useState<NavigationState>({
    menuKey: 'dashboard',
    selectedMonth: new Date().getMonth(),
  });

  // --- DATA SYNC EFFECTS ---
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
          const firestoreData = userDocSnap.data() as Partial<IProjectData>;
          const cleanData: IProjectData = {
            safetyKPIs: (firestoreData.safetyKPIs || []).map(sanitizeKpi),
            leaseKPIs: (firestoreData.leaseKPIs || []).map(sanitizeKpi),
            assetKPIs: (firestoreData.assetKPIs || []).map(sanitizeKpi),
            infraKPIs: (firestoreData.infraKPIs || []).map(sanitizeKpi),
            hotspots: firestoreData.hotspots || [],
            facilities: firestoreData.facilities || [],
            complexFacilities: firestoreData.complexFacilities?.length ? firestoreData.complexFacilities : initialComplexFacilities,
            teamMembers: firestoreData.teamMembers?.length ? firestoreData.teamMembers : initialTeamMembers,
            tenantUnits: firestoreData.tenantUnits?.length ? firestoreData.tenantUnits : initialTenantUnits,
          };
          setData(cleanData);
        } else {
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
    const debounceSave = setTimeout(() => {
        try { setDoc(doc(db, 'users', currentUser.uid), data, { merge: true });
        } catch (error) { console.error("Error saving data:", error); }
    }, 300);
    return () => clearTimeout(debounceSave);
  }, [data, currentUser, db]);

  // --- GENERIC STATE UPDATE HELPERS ---
  const updateKpiArray = useCallback((updateFn: (data: IProjectData) => IProjectData) => {
    setData(prevData => updateFn(prevData));
  }, []);

  const findAndUpdatKpi = useCallback((kpiId: string, data: IProjectData, updateKpiFn: (kpi: KPI) => KPI): IProjectData => {
    const kpiArrays: (keyof IProjectData)[] = ['safetyKPIs', 'leaseKPIs', 'assetKPIs', 'infraKPIs'];
    for (const key of kpiArrays) {
      const kpiArray = data[key] as KPI[];
      if (kpiArray?.some(kpi => kpi.id === kpiId)) {
        return { ...data, [key]: kpiArray.map(kpi => kpi.id === kpiId ? updateKpiFn(kpi) : kpi) };
      }
    }
    return data;
  }, []);

  // --- CRUD OPERATIONS ---
  const addActivityToKpi = useCallback(async (kpiId: string, newActivityData: Omit<Activity, 'id' | 'status' | 'tasks'>): Promise<Activity> => {
    const newActivity: Activity = { ...newActivityData, id: `activity-${Date.now()}`, status: TASK_STATUS.NOT_STARTED, tasks: [] };
    updateKpiArray(data => findAndUpdatKpi(kpiId, data, kpi => ({ ...kpi, activities: [...(kpi.activities || []), newActivity] })));
    return newActivity;
  }, [updateKpiArray, findAndUpdatKpi]);

  const updateActivityInKpi = useCallback((kpiId: string, updatedActivity: Activity) => {
    updateKpiArray(data => findAndUpdatKpi(kpiId, data, kpi => ({ ...kpi, activities: (kpi.activities || []).map(act => act.id === updatedActivity.id ? updatedActivity : act) })));
  }, [updateKpiArray, findAndUpdatKpi]);

  const deleteActivityFromKpi = useCallback((kpiId: string, activityId: string) => {
    updateKpiArray(data => findAndUpdatKpi(kpiId, data, kpi => ({ ...kpi, activities: (kpi.activities || []).filter(act => act.id !== activityId) })));
  }, [updateKpiArray, findAndUpdatKpi]);

  const addTask = useCallback((kpiId: string, activityId: string, newTaskData: Omit<Task, 'id' | 'status' | 'records'>) => {
    const newTask: Task = { ...newTaskData, id: `task-${Date.now()}`, status: TASK_STATUS.NOT_STARTED, records: [], comments: [] };
    const updateActivitiesFn = (kpi: KPI): KPI => ({ ...kpi, activities: (kpi.activities || []).map(act => act.id === activityId ? { ...act, tasks: [...(act.tasks || []), newTask] } : act) });
    updateKpiArray(data => findAndUpdatKpi(kpiId, data, updateActivitiesFn));
  }, [updateKpiArray, findAndUpdatKpi]);

  const updateTask = useCallback((kpiId: string, activityId: string, updatedTask: Task) => {
    const updateActivitiesFn = (kpi: KPI): KPI => ({ ...kpi, activities: (kpi.activities || []).map(act => act.id === activityId ? { ...act, tasks: (act.tasks || []).map(t => t.id === updatedTask.id ? updatedTask : t) } : act) });
    updateKpiArray(data => findAndUpdatKpi(kpiId, data, updateActivitiesFn));
  }, [updateKpiArray, findAndUpdatKpi]);

  const deleteTask = useCallback((kpiId: string, activityId: string, taskId: string) => {
    const updateActivitiesFn = (kpi: KPI): KPI => ({ ...kpi, activities: (kpi.activities || []).map(act => act.id === activityId ? { ...act, tasks: (act.tasks || []).filter(t => t.id !== taskId) } : act) });
    updateKpiArray(data => findAndUpdatKpi(kpiId, data, updateActivitiesFn));
  }, [updateKpiArray, findAndUpdatKpi]);

  const addCommentToTask = useCallback((kpiId: string, activityId: string, taskId: string, content: string) => {
    const newComment: Comment = {
        id: `comment-${Date.now()}-${Math.random()}`,
        author: currentUser?.displayName || currentUser?.email || '사용자',
        timestamp: new Date().toISOString(),
        content: content
    };

    const updateActivitiesFn = (kpi: KPI): KPI => ({
        ...kpi,
        activities: (kpi.activities || []).map(act => {
            if (act.id !== activityId) return act;
            return {
                ...act,
                tasks: (act.tasks || []).map(task => {
                    if (task.id !== taskId) return task;
                    return {
                        ...task,
                        comments: [...(task.comments || []), newComment]
                    };
                })
            };
        })
    });
    updateKpiArray(data => findAndUpdatKpi(kpiId, data, updateActivitiesFn));
  }, [updateKpiArray, findAndUpdatKpi, currentUser]);

  // Other setters and functions (Complex Facilities, Team Members, etc.) follow...
  const navigateTo = useCallback((newState: Partial<NavigationState>) => { setNavigationState(prevState => ({ ...prevState, ...newState })); }, []);
  const setSelectedMonth = useCallback((month: number) => { navigateTo({ selectedMonth: month }); }, [navigateTo]);
  const addComplexFacility = useCallback((newFacility: Omit<ComplexFacility, 'id'>) => setData(prev => ({ ...prev, complexFacilities: [...prev.complexFacilities, { ...newFacility, id: `complex-${Date.now()}` }] })), []);
  const updateComplexFacility = useCallback((updatedFacility: ComplexFacility) => setData(prev => ({ ...prev, complexFacilities: prev.complexFacilities.map(f => f.id === updatedFacility.id ? updatedFacility : f) })), []);
  const deleteComplexFacility = useCallback((facilityId: string) => setData(prev => ({ ...prev, complexFacilities: prev.complexFacilities.filter(f => f.id !== facilityId) })), []);
  const addTeamMember = useCallback((newMember: Omit<TeamMember, 'id'>) => setData(prev => ({ ...prev, teamMembers: [...prev.teamMembers, { ...newMember, id: `member-${Date.now()}` }] })), []);
  const updateTeamMember = useCallback((updatedMember: TeamMember) => setData(prev => ({ ...prev, teamMembers: prev.teamMembers.map(m => m.id === updatedMember.id ? updatedMember : m) })), []);
  const deleteTeamMember = useCallback((memberId: string) => setData(prev => ({ ...prev, teamMembers: prev.teamMembers.filter(m => m.id !== memberId) })), []);
  const addTenantUnit = useCallback((newUnit: Omit<TenantUnit, 'id' | 'pathData'>) => setData(prev => ({ ...prev, tenantUnits: [...prev.tenantUnits, { ...newUnit, id: `unit-${Date.now()}`, pathData: '' }] })), []);
  const updateTenantUnit = useCallback((updatedUnit: TenantUnit) => setData(prev => ({ ...prev, tenantUnits: prev.tenantUnits.map(u => u.id === updatedUnit.id ? updatedUnit : u) })), []);
  const deleteTenantUnit = useCallback((unitId: string) => setData(prev => ({ ...prev, tenantUnits: prev.tenantUnits.filter(u => u.id !== unitId) })), []);

  const kpiData = useMemo(() => [
      ...(data.safetyKPIs || []).map(k => ({ ...k, type: '안전 관리', icon: <Shield size={16}/>, color: 'text-pink-500' })),
      ...(data.leaseKPIs || []).map(k => ({ ...k, type: '임대 및 세대', icon: <Handshake size={16}/>, color: 'text-black' })),
      ...(data.assetKPIs || []).map(k => ({ ...k, type: '자산 가치', icon: <DollarSign size={16}/>, color: 'text-blue-500' })),
      ...(data.infraKPIs || []).map(k => ({ ...k, type: '인프라 개발', icon: <DraftingCompass size={16}/>, color: 'text-gray-400' }))
  ], [data]);

  const value: IProjectDataContext = {
    ...data, kpiData, navigationState, setData, addActivityToKpi, updateActivityInKpi, deleteActivityFromKpi, 
    addTask, updateTask, deleteTask, addCommentToTask, navigateTo, setSelectedMonth,
    setSafetyKPIs: (kpis) => setData(p => ({...p, safetyKPIs: typeof kpis === 'function' ? kpis(p.safetyKPIs) : kpis})),
    setLeaseKPIs: (kpis) => setData(p => ({...p, leaseKPIs: typeof kpis === 'function' ? kpis(p.leaseKPIs) : kpis})),
    setAssetKPIs: (kpis) => setData(p => ({...p, assetKPIs: typeof kpis === 'function' ? kpis(p.assetKPIs) : kpis})),
    setInfraKPIs: (kpis) => setData(p => ({...p, infraKPIs: typeof kpis === 'function' ? kpis(p.infraKPIs) : kpis})),
    setHotspots: (spots) => setData(p => ({...p, hotspots: typeof spots === 'function' ? spots(p.hotspots) : spots})),
    setFacilities: (facilities) => setData(p => ({...p, facilities: typeof facilities === 'function' ? facilities(p.facilities) : facilities})),
    setComplexFacilities: (facilities) => setData(p => ({...p, complexFacilities: typeof facilities === 'function' ? facilities(p.complexFacilities) : facilities})),
    addComplexFacility, updateComplexFacility, deleteComplexFacility,
    setTeamMembers: (members) => setData(p => ({...p, teamMembers: typeof members === 'function' ? members(p.teamMembers) : members})),
    addTeamMember, updateTeamMember, deleteTeamMember,
    setTenantUnits: (units) => setData(p => ({...p, tenantUnits: typeof units === 'function' ? units(p.tenantUnits) : units})),
    addTenantUnit, updateTenantUnit, deleteTenantUnit,
  };

  return <ProjectDataContext.Provider value={value}>{children}</ProjectDataContext.Provider>;
};

export const useProjectData = (): IProjectDataContext => {
  const context = useContext(ProjectDataContext);
  if (context === undefined) { throw new Error('useProjectData must be used within a ProjectDataProvider'); }
  return context;
};
