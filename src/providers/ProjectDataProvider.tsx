
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode, useMemo } from 'react';
import { IProjectData, KPI, Activity, HotSpot, Facility, NavigationState, Task, Comment, ComplexFacility, TeamMember, GeneralActivity, CustomTab, MonthlyReport, TenantInfo, Contract, Attachment, Unit, RentalHistory, EvaluationResult, TaskStatus } from '@/types';
import { getFirestore, doc, getDoc, setDoc, collection, getDocs } from 'firebase/firestore';
import { useAuth } from '@/features/auth/AuthContext';
import { Shield, Handshake, DollarSign, DraftingCompass } from 'lucide-react';
import { TASK_STATUS, MASTER_STATUS_TRANSITION_MAP } from '@/constants';
import { initialComplexFacilities } from '@/data/initial-complex-facilities';
import { initialTeamMembers } from '@/data/initial-team-members';
import { initialUnits } from '@/data/initial-units';
import { initialTenantInfo } from '@/data/initial-tenant-info';
import { initialContracts } from '@/data/initial-contracts';
import { initialRentalHistory } from '@/data/initial-rental-history';
import rawFebruaryReportData from '@/data/2026-02-report.json';


// Raw JSON data structure interface
interface RawReportData {
  reportDate: { year: number; month: number; };
  energyUsage: {
    electricityKwh: { value: number; unit: string; };
    waterM3: { value: number; unit: string; };
    gasM3: { value: number; unit: string; };
    solarGenerationKwh?: { value: number; unit: string; };
  };
  energyCosts: {
    electricity: { finalAmount: { value: number; }; baseRate: {value: number}; energyRate: {value: number}; climateEnvRate: {value: number}; powerFund: {value: number} };
    water: { generalTotal: { value: number; }; waterSupplyRate: {value: number} };
    gas: { usageCharge: { value: number; }; };
    total: { value: number; unit: string; };
  };
  teamActivities: { id: string; teamName: string; tasks: string[]; }[];
}

// Helper function to transform raw report data
const transformRawDataToMonthlyReport = (rawData: RawReportData): MonthlyReport => {
  return {
    id: `${rawData.reportDate.year}-${String(rawData.reportDate.month).padStart(2, '0')}`,
    year: rawData.reportDate.year,
    month: rawData.reportDate.month,
    report_date: `${rawData.reportDate.year}-${String(rawData.reportDate.month).padStart(2, '0')}-01`,
    raw_data: {
      energyUsage: {
        electricityKwh: rawData.energyUsage.electricityKwh,
        waterM3: rawData.energyUsage.waterM3,
        gasM3: rawData.energyUsage.gasM3,
        solarGenerationKwh: rawData.energyUsage.solarGenerationKwh || { value: 0, unit: 'kWh' },
      },
      weather: { averageTemperatureC: { value: 10, unit: '°C'} },
      energyCosts: {
        electricity: {
          basicCharge: { value: rawData.energyCosts.electricity.baseRate.value },
          usageCharge: { value: rawData.energyCosts.electricity.energyRate.value },
          demandCharge: { value: rawData.energyCosts.electricity.climateEnvRate.value },
          vat: { value: 0 },
          fund: { value: rawData.energyCosts.electricity.powerFund.value },
          finalAmount: { value: rawData.energyCosts.electricity.finalAmount.value },
        },
        water: {
          usageCharge: { value: rawData.energyCosts.water.waterSupplyRate.value },
          generalTotal: { value: rawData.energyCosts.water.generalTotal.value },
        },
        gas: { usageCharge: { value: rawData.energyCosts.gas.usageCharge.value } },
        total: rawData.energyCosts.total,
      },
      teamActivities: rawData.teamActivities,
    },
  };
};

const februaryReportData: MonthlyReport = transformRawDataToMonthlyReport(rawFebruaryReportData as unknown as RawReportData);

// Interfaces for Lease evaluation
interface KpiMetrics {
  baseline: number;
  mean: number;
  stdDev: number;
  targetHigh: number;
  targetLow: number;
  currentRealtimeRate: number;
}

interface RealtimeMetrics {
  totalRentableArea: number;
  totalLeasedArea: number;
  realtimeOccupancyRate: number;
}


interface IProjectDataContext extends IProjectData {
  kpiData: (KPI & { type: string; icon: React.ReactNode; color: string; })[];
  navigationState: NavigationState;
  isDataLoaded: boolean;
  units: Unit[];
  customTabs: CustomTab[];
  tenantInfo: TenantInfo[];
  contracts: (Contract & { status?: 'active' | 'expired' | 'pending' | 'unknown' })[];
  attachments: Attachment[];
  rentalHistory: RentalHistory[];
  evaluationResults: EvaluationResult[];
  latestEvaluationResult: EvaluationResult | null;
  leaseKpiMetrics: KpiMetrics | null;
  leaseRealtimeMetrics: RealtimeMetrics | null;
  setData: React.Dispatch<React.SetStateAction<IProjectData>>;
  addActivityToKpi: (kpiId: string, newActivity: Omit<Activity, 'id' | 'status' | 'tasks'>) => Promise<Activity>;
  updateActivityInKpi: (kpiId: string, updatedActivity: Activity) => void;
  deleteActivityFromKpi: (kpiId: string, activityId: string) => void;
  addTask: (kpiId: string, activityId: string, newTaskData: Omit<Task, 'id' | 'status' | 'records' | 'comments' | 'assigneeIds'>) => void;
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
  addHotspot: (newHotspot: Omit<HotSpot, 'id'>) => void;
  updateHotspot: (updatedHotspot: HotSpot) => void;
  deleteHotspot: (hotspotId: string) => void;
  setFacilities: React.Dispatch<React.SetStateAction<Facility[]>>;
  setComplexFacilities: React.Dispatch<React.SetStateAction<ComplexFacility[]>>;
  addComplexFacility: (newFacility: Omit<ComplexFacility, 'id'>) => void;
  updateComplexFacility: (updatedFacility: ComplexFacility) => void;
  deleteComplexFacility: (facilityId: string) => void;
  setTeamMembers: React.Dispatch<React.SetStateAction<TeamMember[]>>;
  addTeamMember: (newMember: Omit<TeamMember, 'id'>) => void;
  updateTeamMember: (updatedMember: TeamMember) => void;
  deleteTeamMember: (memberId: string) => void;
  setUnits: React.Dispatch<React.SetStateAction<Unit[]>>;
  addUnit: (newUnit: Omit<Unit, 'id'>) => Unit;
  updateUnit: (updatedUnit: Unit) => void;
  deleteUnit: (unitId: string) => void;
  setTenantInfo: React.Dispatch<React.SetStateAction<TenantInfo[]>>;
  addTenant: (newTenant: TenantInfo) => void;
  updateTenantInfo: (updatedTenant: TenantInfo) => void;
  deleteTenant: (tenantId: string) => void;
  setContracts: React.Dispatch<React.SetStateAction<Contract[]>>;
  addContract: (newContract: Omit<Contract, 'id'>) => void;
  updateContract: (updatedContract: Contract) => void;
  deleteContract: (contractId: string) => void;  
  addGeneralActivity: (newActivity: Omit<GeneralActivity, 'id'>) => void;
  updateGeneralActivity: (updatedActivity: GeneralActivity) => void;
  deleteGeneralActivity: (activityId: string) => void;
  addMonthlyReport: (newReport: MonthlyReport) => Promise<void>;
  addAttachment: (tenantId: string, file: File) => void;
  deleteAttachment: (attachmentId: string) => void;
  setRentalHistory: React.Dispatch<React.SetStateAction<RentalHistory[]>>;
  addRentalHistory: (newHistory: Omit<RentalHistory, 'id' | 'created_at'>) => void;
  updateRentalHistory: (updatedHistory: RentalHistory) => void;
  deleteRentalHistory: (historyId: string) => void;
  setEvaluationResults: React.Dispatch<React.SetStateAction<EvaluationResult[]>>;
  addEvaluationResult: (newResult: Omit<EvaluationResult, 'id'>) => void;
  updateEvaluationResult: (updatedResult: EvaluationResult) => void;
  deleteEvaluationResult: (resultId: string) => void;
}

const ProjectDataContext = createContext<IProjectDataContext | undefined>(undefined);

const initialData: IProjectData = { 
  safetyKPIs: [], 
  leaseKPIs: [], 
  assetKPIs: [], 
  infraKPIs: [], 
  hotspots: [], 
  facilities: [], 
  complexFacilities: initialComplexFacilities || [],
  teamMembers: initialTeamMembers || [],
  units: initialUnits || [],
  tenantInfo: initialTenantInfo || [],
  contracts: initialContracts || [],
  attachments: [],
  generalActivities: [],
  customTabs: [], 
  monthly_reports: [],
  rentalHistory: initialRentalHistory || [],
  evaluationResults: [],
};

// A safe version of initialData that is used ONLY for new user document creation.
const newUserInitialData: IProjectData = {
  safetyKPIs: [],
  leaseKPIs: [],
  assetKPIs: [],
  infraKPIs: [],
  hotspots: [],
  facilities: [],
  complexFacilities: initialComplexFacilities || [],
  teamMembers: initialTeamMembers || [],
  units: initialUnits || [],
  tenantInfo: initialTenantInfo || [],
  contracts: initialContracts || [],
  attachments: [],
  generalActivities: [],
  customTabs: [],
  monthly_reports: [],
  rentalHistory: initialRentalHistory || [],
  evaluationResults: [],
};

const sanitizeKpi = (partialKpi: Partial<KPI>): KPI => {
  const defaults: Omit<KPI, 'id'> = { title: '이름 없음 - 수정 필요', description: '', current: 0, target: 100, unit: '%', activities: [], previous: 0 };
  const id = partialKpi.id || `kpi-${Date.now()}-${Math.random()}`;

  const activities = (partialKpi.activities || []).map(act => ({
    ...act,
    id: act.id || `act-${Date.now()}-${Math.random()}`,
    status: (MASTER_STATUS_TRANSITION_MAP[act.status as any] || TASK_STATUS.NOT_STARTED) as TaskStatus,
    tasks: (act.tasks || []).map((task: any) => {
      const assigneeIds = task.assigneeIds || (task.assignees || []).map((a: TeamMember) => a.id);
      const newTask: Task = {
        ...task,
        id: task.id || `task-${Date.now()}-${Math.random()}`,
        name: task.name || '이름 없는 업무',
        startDate: task.startDate || new Date().toISOString(),
        endDate: task.endDate || new Date().toISOString(),
        status: (MASTER_STATUS_TRANSITION_MAP[task.status as any] || TASK_STATUS.NOT_STARTED) as TaskStatus,
        records: task.records || [],
        comments: task.comments || [],
        assigneeIds: assigneeIds,
      };
      delete (newTask as any).assignees; // Remove old field
      return newTask;
    }),
  }));

  return { ...defaults, ...partialKpi, id, activities };
};

export const ProjectDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const db = getFirestore();
  const [data, setData] = useState<IProjectData>(initialData);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [latestEvaluationResult, setLatestEvaluationResult] = useState<EvaluationResult | null>(null);
  
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
        reports.sort((a, b) => b.year - a.year || b.month - a.month);

        const februaryReportExists = reports.some(r => r.id === '2026-02');
        if (!februaryReportExists) {
            reports.push(februaryReportData);
        }

        let finalData: IProjectData;

        if (userDocSnap.exists()) {
            const firestoreData = userDocSnap.data() as any;
            let rentalHistoryFromDb = firestoreData.rentalHistory || [];
            let needsMigration = false;

            if (rentalHistoryFromDb.length > 0 && rentalHistoryFromDb.some((h: any) => h.hasOwnProperty('rentable_area'))) {
                needsMigration = true;
                rentalHistoryFromDb = rentalHistoryFromDb.map((h: any) => {
                    const newHistory: RentalHistory = {
                      id: h.id,
                      year: h.year,
                      total_rentable_area: h.rentable_area,
                      total_leased_area: h.leased_area,
                      occupancy_rate: h.occupancy_rate,
                      created_at: h.created_at,
                    };
                    // Fix the problematic 2021 data point
                    if (h.id === 'rh-2021' && h.leased_area === 0) {
                        newHistory.total_leased_area = 2450.0;
                        newHistory.occupancy_rate = (2450.0 / newHistory.total_rentable_area) * 100;
                    }
                    return newHistory;
                });
            }
            
            finalData = {
                safetyKPIs: (firestoreData.safetyKPIs || []).map(sanitizeKpi),
                leaseKPIs: (firestoreData.leaseKPIs || []).map(sanitizeKpi),
                assetKPIs: (firestoreData.assetKPIs || []).map(sanitizeKpi),
                infraKPIs: (firestoreData.infraKPIs || []).map(sanitizeKpi),
                hotspots: firestoreData.hotspots || [],
                facilities: firestoreData.facilities || [],
                complexFacilities: firestoreData.complexFacilities || [],
                teamMembers: firestoreData.teamMembers || [],
                units: firestoreData.units || initialUnits,
                tenantInfo: firestoreData.tenantInfo || [],
                contracts: firestoreData.contracts || [],
                attachments: firestoreData.attachments || [],
                generalActivities: firestoreData.generalActivities || [],
                customTabs: firestoreData.customTabs || [], 
                monthly_reports: reports,
                rentalHistory: rentalHistoryFromDb.length > 0 ? rentalHistoryFromDb : initialRentalHistory,
                evaluationResults: firestoreData.evaluationResults || [],
            };

            if (needsMigration) {
              await setDoc(userDocRef, { rentalHistory: rentalHistoryFromDb }, { merge: true });
            }

        } else {
          finalData = { ...newUserInitialData, monthly_reports: reports };
          const dataToSaveForNewUser = { ...newUserInitialData };
          delete (dataToSaveForNewUser as Partial<IProjectData>).monthly_reports;
          await setDoc(userDocRef, dataToSaveForNewUser); 
        }
        
        setData(finalData);

      } catch (error) { 
          console.error(error);
          setData({ ...initialData, monthly_reports: [februaryReportData] });
      } finally {
          setIsDataLoaded(true);
      }
    };

    fetchData();
  }, [currentUser, db]);
  

  const processedData = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const updatedContracts = (data.contracts || []).map(contract => {
      if (!contract.startDate || !contract.endDate) {
        return { ...contract, status: 'unknown' as const };
      }
      const startDate = new Date(contract.startDate);
      const endDate = new Date(contract.endDate);
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(0, 0, 0, 0);

      let status: 'active' | 'pending' | 'expired';
      if (today >= startDate && today <= endDate) {
        status = 'active';
      } else if (today < startDate) {
        status = 'pending';
      } else { // today > endDate
        status = 'expired';
      }
      return { ...contract, status };
    });

    const currentUnits = (data.units && data.units.length > 0) ? data.units : initialUnits;
    const updatedUnits = currentUnits.map(unit => {
      const activeOrPendingContracts = updatedContracts.filter(c => c.unitId === unit.id && c.status !== 'expired');
      
      let newStatus: 'occupied' | 'vacant' | 'notice' = 'vacant';

      if (activeOrPendingContracts.length > 0) {
        if (activeOrPendingContracts.some(c => c.status === 'active')) {
          newStatus = 'occupied';
        } else { 
          newStatus = 'notice';
        }
      } 

      return { ...unit, status: newStatus };
    });

    return { units: updatedUnits, contracts: updatedContracts };
  }, [data.units, data.contracts]);

    // --- LEASE EVALUATION LOGIC ---
    const leaseRealtimeMetrics = useMemo((): RealtimeMetrics | null => {
        const units = processedData.units;
        if (!units || units.length === 0) return null;
        
        const totalRentableArea = units.reduce((acc, u) => acc + u.area_sqm, 0);
        const totalLeasedArea = units
            .filter(u => u.status === 'occupied' || u.status === 'notice')
            .reduce((acc, u) => acc + u.area_sqm, 0);
            
        if (totalRentableArea === 0) return { totalRentableArea, totalLeasedArea, realtimeOccupancyRate: 0 };
        
        const realtimeOccupancyRate = (totalLeasedArea / totalRentableArea) * 100;
        return { totalRentableArea, totalLeasedArea, realtimeOccupancyRate };
    }, [processedData.units]);

    const leaseKpiMetrics = useMemo((): KpiMetrics | null => {
      const currentRentalHistory = (data.rentalHistory && data.rentalHistory.length > 0) 
          ? data.rentalHistory 
          : initialRentalHistory;
  
      if (!leaseRealtimeMetrics) return null;
  
      const historicalData = currentRentalHistory;
      const realtimeRate = leaseRealtimeMetrics.realtimeOccupancyRate;
  
      const pastData = historicalData.filter(h => h.total_leased_area > 0).sort((a, b) => b.year - a.year);
      if (pastData.length < 1) return null;
  
      // 기준치: 전년 실적과 직전 3개년 평균 실적 중 높은 값
      const prevYearRate = pastData.length > 0 ? pastData[0].occupancy_rate : realtimeRate;
      const lastThreeYears = pastData.slice(0, 3);
      const avgThreeYears = lastThreeYears.reduce((acc, cur) => acc + cur.occupancy_rate, 0) / lastThreeYears.length;
      const baseline = Math.max(prevYearRate, avgThreeYears);
      
      // 표준편차: 2022년~2025년 데이터 기반
      const stdDevData = pastData.filter(h => h.year >= 2022 && h.year <= 2025);
      if (stdDevData.length === 0) return null;

      const ratesForStdDev = stdDevData.map(h => h.occupancy_rate);
      const meanForStdDev = ratesForStdDev.reduce((a, b) => a + b, 0) / ratesForStdDev.length;
      const variance = ratesForStdDev.reduce((a, b) => a + Math.pow(b - meanForStdDev, 2), 0) / ratesForStdDev.length;
      const stdDev = Math.sqrt(variance);

      // 전체 기간 평균 (참고용)
      const allRates = pastData.map(h => h.occupancy_rate);
      const mean = allRates.reduce((a, b) => a + b, 0) / allRates.length;

      // 최고/최저 목표
      let targetHigh = baseline + (2 * stdDev);
      if (targetHigh > 100) targetHigh = 100;
  
      let targetLow = baseline - (2 * stdDev);
      if (targetLow < 0) targetLow = 0;
  
      return { baseline, mean, stdDev, targetHigh, targetLow, currentRealtimeRate: realtimeRate };
  }, [data.rentalHistory, leaseRealtimeMetrics]);

    useEffect(() => {
        if (!leaseRealtimeMetrics || !leaseKpiMetrics) {
            setLatestEvaluationResult(null); // Clear result if data is missing
            return;
        }

        const currentRate = leaseRealtimeMetrics.realtimeOccupancyRate;
        const { targetLow, targetHigh } = leaseKpiMetrics;

        let scoreForBar = 0;
        if (targetHigh > targetLow) {
            scoreForBar = ((currentRate - targetLow) / (targetHigh - targetLow)) * 100;
        } else if (currentRate >= targetHigh) {
            scoreForBar = 100;
        }
        scoreForBar = Math.max(0, Math.min(100, scoreForBar));

        // 평점 = 20 + ((실적 - 최저목표) / (최고목표 - 최저목표)) * 80
        let rating = 20 + (scoreForBar / 100) * 80;
        rating = Math.max(20, Math.min(100, rating));

        const weight = 2.5;
        const finalScore = (rating / 100) * weight;

        const result: EvaluationResult = {
            id: 'latest-lease-evaluation', 
            kpiId: 'lease-rate', 
            date: new Date().toISOString(),
            score: finalScore,
            rating: rating
        };
        
        setLatestEvaluationResult(result);

    }, [leaseKpiMetrics, leaseRealtimeMetrics]);


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

  const addTask = useCallback((kpiId: string, activityId: string, newTaskData: Omit<Task, 'id' | 'status' | 'records' | 'comments' | 'assigneeIds'>) => {
    const newTask: Task = { ...newTaskData, id: `task-${Date.now()}`, status: TASK_STATUS.NOT_STARTED, records: [], comments: [], assigneeIds: [] };
    const updateActivitiesFn = (kpi: KPI): KPI => ({ ...kpi, activities: (kpi.activities || []).map(act => act.id === activityId ? { ...act, tasks: [...(act.tasks || []), newTask] } : act) });
    updateKpiArray(data => findAndUpdatKpi(kpiId, data, updateActivitiesFn));
  }, [updateKpiArray, findAndUpdatKpi]);

  const updateTask = useCallback((kpiId: string, activityId: string, updatedTask: Task) => {
    if (!currentUser) return;

    const userDocRef = doc(db, 'users', currentUser.uid);

    setData(prevData => {
        const kpiArrays: (keyof IProjectData)[] = ['safetyKPIs', 'leaseKPIs', 'assetKPIs', 'infraKPIs'];
        let targetKpiKey: keyof IProjectData | undefined;

        for (const key of kpiArrays) {
            if ((prevData[key] as KPI[])?.some(kpi => kpi.id === kpiId)) {
                targetKpiKey = key;
                break;
            }
        }

        if (!targetKpiKey) {
            return prevData;
        }
        
        const cleanTask = (task: Task): Task => {
            const newTask = { ...task };
            delete (newTask as any).assignees; // Make sure to remove the old field before saving
            return newTask;
        };

        const updatedKpiArray = (prevData[targetKpiKey] as KPI[]).map(kpi => {
            if (kpi.id === kpiId) {
                const updatedActivities = kpi.activities.map(activity => {
                    if (activity.id === activityId) {
                        const updatedTasks = activity.tasks.map(task =>
                            task.id === updatedTask.id ? cleanTask(updatedTask) : task
                        );
                        return { ...activity, tasks: updatedTasks };
                    }
                    return activity;
                });
                return { ...kpi, activities: updatedActivities };
            }
            return kpi;
        });

        setDoc(userDocRef, { [targetKpiKey]: updatedKpiArray }, { merge: true });

        return { ...prevData, [targetKpiKey]: updatedKpiArray };
    });
}, [currentUser, db]);

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
    const reportId = `${newReport.year}-${String(newReport.month).padStart(2, '0')}`;
    newReport.id = reportId;
  
    const reportRef = doc(db, "monthly_reports", reportId);
    await setDoc(reportRef, newReport, { merge: true });
  
    setData(prev => {
      const existingReports = prev.monthly_reports || [];
      const reportIndex = existingReports.findIndex(r => r.id === reportId);
  
      if (reportIndex !== -1) {
        // Update existing report
        const updatedReports = [...existingReports];
        updatedReports[reportIndex] = newReport;
        return { ...prev, monthly_reports: updatedReports };
      } else {
        // Add new report and sort
        const updatedReports = [...existingReports, newReport];
        updatedReports.sort((a, b) => b.year - a.year || b.month - a.month);
        return { ...prev, monthly_reports: updatedReports };
      }
    });
  }, [db]);

    const addComplexFacility = useCallback((newFacility: Omit<ComplexFacility, 'id'>) => setData(prev => ({ ...prev, complexFacilities: [...(prev.complexFacilities || []), { ...newFacility, id: `complex-${Date.now()}` }] })), []);
    const updateComplexFacility = useCallback((updatedFacility: ComplexFacility) => setData(prev => ({ ...prev, complexFacilities: (prev.complexFacilities || []).map(f => f.id === updatedFacility.id ? updatedFacility : f) })), []);
    const deleteComplexFacility = useCallback((facilityId: string) => setData(prev => ({ ...prev, complexFacilities: (prev.complexFacilities || []).filter(f => f.id !== facilityId) })), []);
    const addTeamMember = useCallback((newMember: Omit<TeamMember, 'id'>) => setData(prev => ({ ...prev, teamMembers: [...(prev.teamMembers || []), { ...newMember, id: `member-${Date.now()}` }] })), []);
    const updateTeamMember = useCallback((updatedMember: TeamMember) => setData(prev => ({ ...prev, teamMembers: (prev.teamMembers || []).map(m => m.id === updatedMember.id ? updatedMember : m) })), []);
    const deleteTeamMember = useCallback((memberId: string) => setData(prev => ({ ...prev, teamMembers: (prev.teamMembers || []).filter(m => m.id !== memberId) })), []);
    const addUnit = useCallback((newUnit: Omit<Unit, 'id'>): Unit => {
        const newUnitWithId = { ...newUnit, id: `unit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` };
        setData(prev => ({ ...prev, units: [...(prev.units || []), newUnitWithId] }));
        return newUnitWithId;
    }, []);
    const updateUnit = useCallback((updatedUnit: Unit) => setData(prev => ({ ...prev, units: (prev.units || []).map(u => u.id === updatedUnit.id ? updatedUnit : u) })), []);
    const deleteUnit = useCallback((unitId: string) => {
      setData(prev => ({
        ...prev,
        units: (prev.units || []).filter(u => u.id !== unitId),
        contracts: (prev.contracts || []).filter(c => c.unitId !== unitId),
      }));
    }, []);

    const addHotspot = useCallback((newHotspot: Omit<HotSpot, 'id'>) => {
        setData(prev => ({ ...prev, hotspots: [...(prev.hotspots || []), { ...newHotspot, id: `hs-${Date.now()}` }] }));
    }, []);

    const updateHotspot = useCallback((updatedHotspot: HotSpot) => {
        setData(prev => ({ ...prev, hotspots: (prev.hotspots || []).map(h => h.id === updatedHotspot.id ? updatedHotspot : h) }));
    }, []);

    const deleteHotspot = useCallback((hotspotId: string) => {
        setData(prev => ({ ...prev, hotspots: (prev.hotspots || []).filter(h => h.id !== hotspotId) }));
    }, []);
    
    const addTenant = useCallback((newTenant: TenantInfo) => {
        setData(prev => ({ ...prev, tenantInfo: [...(prev.tenantInfo || []), newTenant] }));
    }, []);

    const updateTenantInfo = useCallback((updatedTenant: TenantInfo) => {
        setData(prev => ({ ...prev, tenantInfo: (prev.tenantInfo || []).map(t => t.id === updatedTenant.id ? updatedTenant : t) }));
    }, []);

    const deleteTenant = useCallback((tenantId: string) => {
        setData(prev => ({
        ...prev,
        tenantInfo: (prev.tenantInfo || []).filter(t => t.id !== tenantId),
        contracts: (prev.contracts || []).filter(c => c.tenantId !== tenantId),
        attachments: (prev.attachments || []).filter(a => a.tenantId !== tenantId),
        }));
    }, []);

    const addContract = useCallback((newContract: Omit<Contract, 'id'>) => {
        const newContractWithId = { ...newContract, id: `contract-${Date.now()}` };
        setData(prev => ({ ...prev, contracts: [...(prev.contracts || []), newContractWithId] }));
    }, []);

    const updateContract = useCallback((updatedContract: Contract) => {
        setData(prev => ({ ...prev, contracts: (prev.contracts || []).map(c => c.id === updatedContract.id ? updatedContract : c) }));
    }, []);

    const deleteContract = useCallback((contractId: string) => {
        setData(prev => ({ ...prev, contracts: (prev.contracts || []).filter(c => c.id !== contractId) }));
    }, []);

    const addAttachment = useCallback((tenantId: string, file: File) => {
      const newAttachment: Attachment = {
          id: `att-${Date.now()}`,
          tenantId: tenantId,
          fileName: file.name,
          url: URL.createObjectURL(file), // Note: This is a temporary URL
          uploadedAt: new Date().toISOString(),
      };
      setData(prev => ({ ...prev, attachments: [...(prev.attachments || []), newAttachment] }));
  }, []);

  const deleteAttachment = useCallback((attachmentId: string) => {
      setData(prev => ({ ...prev, attachments: (prev.attachments || []).filter(a => a.id !== attachmentId) }));
  }, []);
  
  const addRentalHistory = useCallback((newHistoryData: Omit<RentalHistory, 'id' | 'created_at'>) => {
    const newHistory: RentalHistory = { 
      ...newHistoryData, 
      id: `rh-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    setData(prev => ({ ...prev, rentalHistory: [newHistory, ...(prev.rentalHistory || [])] }));
  }, []);

  const updateRentalHistory = useCallback((updatedHistory: RentalHistory) => {
    setData(prev => ({ ...prev, rentalHistory: (prev.rentalHistory || []).map(h => h.id === updatedHistory.id ? updatedHistory : h) }));
  }, []);

  const deleteRentalHistory = useCallback((historyId: string) => {
    setData(prev => ({ ...prev, rentalHistory: (prev.rentalHistory || []).filter(h => h.id !== historyId) }));
  }, []);

  const addEvaluationResult = useCallback((newResultData: Omit<EvaluationResult, 'id'>) => {
    const newResult: EvaluationResult = { ...newResultData, id: `er-${Date.now()}` };
    setData(prev => ({ ...prev, evaluationResults: [newResult, ...(prev.evaluationResults || [])] }));
  }, []);

  const updateEvaluationResult = useCallback((updatedResult: EvaluationResult) => {
    setData(prev => ({ ...prev, evaluationResults: (prev.evaluationResults || []).map(r => r.id === updatedResult.id ? updatedResult : r) }));
  }, []);

  const deleteEvaluationResult = useCallback((resultId: string) => {
    setData(prev => ({ ...prev, evaluationResults: (prev.evaluationResults || []).filter(r => r.id !== resultId) }));
  }, []);

    const kpiData = useMemo(() => [
        ...(data.safetyKPIs || []).map(k => ({ ...k, type: '안전 관리', icon: <Shield size={16}/>, color: 'text-pink-500' })),
        ...(data.leaseKPIs || []).map(k => ({ ...k, type: '임대 및 세대', icon: <Handshake size={16}/>, color: 'text-black' })),
        ...(data.assetKPIs || []).map(k => ({ ...k, type: '자산 가치', icon: <DollarSign size={16}/>, color: 'text-blue-500' })),
        ...(data.infraKPIs || []).map(k => ({ ...k, type: '인프라 개발', icon: <DraftingCompass size={16}/>, color: 'text-gray-400' }))
    ], [data]);

  
  const value: IProjectDataContext = {
    ...data,
    kpiData, 
    navigationState, 
    isDataLoaded, 
    units: processedData.units,
    customTabs: data.customTabs || [], 
    tenantInfo: data.tenantInfo || [], 
    contracts: processedData.contracts,
    attachments: data.attachments || [],
    rentalHistory: (data.rentalHistory && data.rentalHistory.length > 0) ? data.rentalHistory : initialRentalHistory,
    evaluationResults: data.evaluationResults || [],
    latestEvaluationResult,
    leaseKpiMetrics,
    leaseRealtimeMetrics,
    setData, 
    addActivityToKpi, 
    updateActivityInKpi, 
    deleteActivityFromKpi, 
    addTask, 
    updateTask, 
    deleteTask, 
    addCommentToTask, 
    navigateTo, 
    setSelectedMonth,
    setSafetyKPIs: (kpis) => setData(p => ({...p, safetyKPIs: typeof kpis === 'function' ? kpis(p.safetyKPIs || []) : kpis})),
    setLeaseKPIs: (kpis) => setData(p => ({...p, leaseKPIs: typeof kpis === 'function' ? kpis(p.leaseKPIs || []) : kpis})),
    setAssetKPIs: (kpis) => setData(p => ({...p, assetKPIs: typeof kpis === 'function' ? kpis(p.assetKPIs || []) : kpis})),
    setInfraKPIs: (kpis) => setData(p => ({...p, infraKPIs: typeof kpis === 'function' ? kpis(p.infraKPIs || []) : kpis})),
    setHotspots: (spots) => setData(p => ({...p, hotspots: typeof spots === 'function' ? spots(p.hotspots || []) : spots})),
    addHotspot,
    updateHotspot,
    deleteHotspot,
    setFacilities: (facilities) => setData(p => ({...p, facilities: typeof facilities === 'function' ? facilities(p.facilities || []) : facilities})),
    setComplexFacilities: (facilities) => setData(p => ({...p, complexFacilities: typeof facilities === 'function' ? facilities(p.complexFacilities || []) : facilities})),
    addComplexFacility, 
    updateComplexFacility, 
    deleteComplexFacility,
    setTeamMembers: (members) => setData(p => ({...p, teamMembers: typeof members === 'function' ? members(p.teamMembers || []) : members})),
    addTeamMember, 
    updateTeamMember, 
    deleteTeamMember,
    setUnits: (units) => setData(p => ({...p, units: typeof units === 'function' ? units(p.units || []) : units})),
    addUnit, 
    updateUnit, 
    deleteUnit,
    setTenantInfo: (info) => setData(p => ({...p, tenantInfo: typeof info === 'function' ? info(p.tenantInfo || []) : info})),
    addTenant, 
    updateTenantInfo, 
    deleteTenant,
    setContracts: (contracts) => setData(p => ({...p, contracts: typeof contracts === 'function' ? contracts(p.contracts || []) : contracts})),
    addContract,
    updateContract,
    deleteContract,
    addGeneralActivity, 
    updateGeneralActivity, 
    deleteGeneralActivity,
    addMonthlyReport,
    addAttachment,
    deleteAttachment,
    setRentalHistory: (history) => setData(p => ({...p, rentalHistory: typeof history === 'function' ? history(p.rentalHistory || []) : history})),
    addRentalHistory,
    updateRentalHistory,
    deleteRentalHistory,
    setEvaluationResults: (results) => setData(p => ({...p, evaluationResults: typeof results === 'function' ? results(p.evaluationResults || []) : results})),
    addEvaluationResult,
    updateEvaluationResult,
    deleteEvaluationResult,
  };

  return <ProjectDataContext.Provider value={value}>{children}</ProjectDataContext.Provider>;
};

export const useProjectData = (): IProjectDataContext => {
  const context = useContext(ProjectDataContext);
  if (context === undefined) { throw new Error('useProjectData must be used within a ProjectDataProvider'); }
  return context;
};
