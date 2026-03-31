
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode, useMemo } from 'react';
import { IProjectData, KPI, Activity, HotSpot, Facility, NavigationState, Task, Comment, ComplexFacility, TeamMember, TenantUnit, GeneralActivity, CustomTab, MonthlyReport } from '../types';
import { getFirestore, doc, getDoc, setDoc, collection, getDocs } from 'firebase/firestore';
import { useAuth } from '../features/auth/AuthContext';
import { Shield, Handshake, DollarSign, DraftingCompass } from 'lucide-react';
import { TASK_STATUS, MASTER_STATUS_TRANSITION_MAP } from '../constants';
import { initialComplexFacilities } from '../data/initial-complex-facilities';
import { initialTeamMembers } from '../data/initial-team-members';
import { initialTenantUnits } from '../data/tenantUnits';
import rawFebruaryReportData from '../data/2026-02-report.json';

// Raw JSON 데이터 구조에 대한 임시 인터페이스
interface RawReportData {
  reportDate: { year: number; month: number; };
  energyUsage: {
    electricityKwh: { value: number; unit: string; };
    waterM3: { value: number; unit: string; };
    gasM3: { value: number; unit: string; };
  };
  energyCosts: {
    electricity: { finalAmount: { value: number; }; baseRate: {value: number}; energyRate: {value: number}; climateEnvRate: {value: number}; powerFund: {value: number} };
    water: { generalTotal: { value: number; }; waterSupplyRate: {value: number} };
    gas: { usageCharge: { value: number; }; };
    total: { value: number; unit: string; };
  };
  teamActivities: { id: string; teamName: string; tasks: string[]; }[];
}

// Raw 데이터를 MonthlyReport 타입으로 변환하는 함수
const transformRawDataToMonthlyReport = (rawData: RawReportData): MonthlyReport => {
  return {
    id: `${rawData.reportDate.year}-${String(rawData.reportDate.month).padStart(2, '0')}`,
    year: rawData.reportDate.year,
    month: rawData.reportDate.month,
    report_date: `${rawData.reportDate.year}-${String(rawData.reportDate.month).padStart(2, '0')}-01`, // 임의의 날짜
    raw_data: {
      energyUsage: rawData.energyUsage,
      energyCosts: {
        electricity: {
          basicCharge: { value: rawData.energyCosts.electricity.baseRate.value },
          usageCharge: { value: rawData.energyCosts.electricity.energyRate.value },
          demandCharge: { value: rawData.energyCosts.electricity.climateEnvRate.value },
          vat: { value: 0 }, // JSON에 없으므로 0으로 설정
          fund: { value: rawData.energyCosts.electricity.powerFund.value },
          finalAmount: { value: rawData.energyCosts.electricity.finalAmount.value },
        },
        water: {
          usageCharge: { value: rawData.energyCosts.water.waterSupplyRate.value },
          generalTotal: { value: rawData.energyCosts.water.generalTotal.value },
        },
        gas: {
          usageCharge: { value: rawData.energyCosts.gas.usageCharge.value },
        },
        total: rawData.energyCosts.total,
      },
      teamActivities: rawData.teamActivities,
    },
  };
};

const februaryReportData: MonthlyReport = transformRawDataToMonthlyReport(rawFebruaryReportData as unknown as RawReportData);


interface IProjectDataContext extends IProjectData {
  kpiData: (KPI & { type: string; icon: React.ReactNode; color: string; })[];
  navigationState: NavigationState;
  isDataLoaded: boolean;
  customTabs: CustomTab[]; 
  setData: React.Dispatch<React.SetStateAction<IProjectData>>;
  addActivityToKpi: (kpiId: string, newActivity: Omit<Activity, 'id' | 'status' | 'tasks'>) => Promise<Activity>;
  updateActivityInKpi: (kpiId: string, updatedActivity: Activity) => void;
  deleteActivityFromKpi: (kpiId: string, activityId: string) => void;
  addTask: (kpiId: string, activityId: string, newTaskData: Omit<Task, 'id' | 'status' | 'records' | 'comments'>) => void;
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
  addGeneralActivity: (newActivity: Omit<GeneralActivity, 'id'>) => void;
  updateGeneralActivity: (updatedActivity: GeneralActivity) => void;
  deleteGeneralActivity: (activityId: string) => void;
  addMonthlyReport: (newReport: MonthlyReport) => Promise<void>;
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
  generalActivities: [],
  customTabs: [], 
  monthly_reports: [],
};

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
      comments: task.comments || [],
      assignees: task.assignees || [],
    })),
  }));

  return { ...defaults, ...partialKpi, id, activities };
};

export const ProjectDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const db = getFirestore();
  const [data, setData] = useState<IProjectData>(initialData);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  
  const [navigationState, setNavigationState] = useState<NavigationState>({
    menuKey: 'dashboard',
    selectedMonth: new Date().getMonth(),
  });

  useEffect(() => {
    if (!currentUser) {
      setData(initialData);
      setIsDataLoaded(true); 
      return;
    }
    const fetchData = async () => {
      setIsDataLoaded(false);
      const userDocRef = doc(db, 'users', currentUser.uid);
      const reportsCollRef = collection(db, 'monthly_reports');
      try {
        const [userDocSnap, reportsSnap] = await Promise.all([
          getDoc(userDocRef),
          getDocs(reportsCollRef)
        ]);

        let reports: MonthlyReport[] = reportsSnap.docs.map(doc => doc.data() as MonthlyReport);
        
        const februaryReportExists = reports.some(r => r.id === '2026-02');
        if (!februaryReportExists) {
            reports.push(februaryReportData);
        }

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
            generalActivities: firestoreData.generalActivities || [],
            customTabs: firestoreData.customTabs || [], 
            monthly_reports: reports, 
          };
          setData(cleanData);
        } else {
          await setDoc(userDocRef, initialData); 
          setData({ ...initialData, monthly_reports: reports });
        }
      } catch (error) { 
          console.error("Error fetching data, using fallback:", error);
          setData({ ...initialData, monthly_reports: [februaryReportData] });
      }
      finally { setIsDataLoaded(true); }
    };
    fetchData();
  }, [currentUser, db]);
  
    
    useEffect(() => {
    if (!isDataLoaded || !currentUser) return;
    const nonReportData = { ...data };
    delete (nonReportData as Partial<IProjectData>).monthly_reports;

    const debounceSave = setTimeout(() => {
        try { setDoc(doc(db, 'users', currentUser.uid), nonReportData, { merge: true });
        } catch (error) { console.error("Error saving data:", error); }
    }, 300);
    return () => clearTimeout(debounceSave);
  }, [data, currentUser, db, isDataLoaded]);

  
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

  const addTask = useCallback((kpiId: string, activityId: string, newTaskData: Omit<Task, 'id' | 'status' | 'records' | 'comments'>) => {
    const newTask: Task = { ...newTaskData, id: `task-${Date.now()}`, status: TASK_STATUS.NOT_STARTED, records: [], comments: [], assignees: [] };
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
            return { ...act, tasks: (act.tasks || []).map(task => {
                    if (task.id !== taskId) return task;
                    return { ...task, comments: [...(task.comments || []), newComment] };
                })
            };
        })
    });
    updateKpiArray(data => findAndUpdatKpi(kpiId, data, updateActivitiesFn));
  }, [updateKpiArray, findAndUpdatKpi, currentUser]);
  const navigateTo = useCallback((newState: Partial<NavigationState>) => { setNavigationState(prevState => ({ ...prevState, ...newState })); }, []);
  const setSelectedMonth = useCallback((month: number) => { navigateTo({ selectedMonth: month }); }, [navigateTo]);
  
  const addGeneralActivity = useCallback((newActivityData: Omit<GeneralActivity, 'id'>) => {
    const newActivity: GeneralActivity = { ...newActivityData, id: `gen-act-${Date.now()}` };
    setData(prev => ({ ...prev, generalActivities: [...(prev.generalActivities || []), newActivity] }));
  }, []);

  const updateGeneralActivity = useCallback((updatedActivity: GeneralActivity) => {
    setData(prev => ({
      ...prev,
      generalActivities: (prev.generalActivities || []).map(act => act.id === updatedActivity.id ? updatedActivity : act)
    }));
  }, []);

  const deleteGeneralActivity = useCallback((activityId: string) => {
    setData(prev => ({
      ...prev,
      generalActivities: (prev.generalActivities || []).filter(act => act.id !== activityId)
    }));
  }, []);
  
  const addMonthlyReport = useCallback(async (newReport: MonthlyReport) => {
    const reportRef = doc(db, "monthly_reports", newReport.id);
    await setDoc(reportRef, newReport);
    setData(prev => {
      const existing = prev.monthly_reports.find(r => r.id === newReport.id);
      if (existing) {
        return { ...prev, monthly_reports: prev.monthly_reports.map(r => r.id === newReport.id ? newReport : r) };
      } else {
        return { ...prev, monthly_reports: [...prev.monthly_reports, newReport] };
      }
    });
  }, [db]);

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
    ...data, kpiData, navigationState, isDataLoaded, customTabs: data.customTabs || [], setData, addActivityToKpi, updateActivityInKpi, deleteActivityFromKpi, 
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
    addGeneralActivity, updateGeneralActivity, deleteGeneralActivity,
    addMonthlyReport,
  };

  return <ProjectDataContext.Provider value={value}>{children}</ProjectDataContext.Provider>;
};

export const useProjectData = (): IProjectDataContext => {
  const context = useContext(ProjectDataContext);
  if (context === undefined) { throw new Error('useProjectData must be used within a ProjectDataProvider'); }
  return context;
};
