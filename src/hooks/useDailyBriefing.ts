
import { useAppData } from '../providers/AppDataContext';
import { Task, KPI } from '../types';
import { isToday, isPast } from 'date-fns';

// Helper function to find urgent tasks from KPIs
const findUrgentTasks = (kpis: KPI[] = [], monthlyTasks: Task[] = []) => {
  const urgentKpiIds = kpis.filter(kpi => kpi.pulse?.trend === 'down').map(kpi => kpi.id);
  return monthlyTasks.filter(task => urgentKpiIds.includes(task.kpiId) && task.status !== 'completed');
};

export const useDailyBriefing = () => {
  const { safetyKPIs, leaseKPIs, infraKPIs, monthlyTasks } = useAppData();

  // 1. 신규 발생 및 시급한 이슈 (데이터가 없을 경우 빈 배열로 처리)
  const urgentSafetyTasks = findUrgentTasks(safetyKPIs || [], monthlyTasks || []);
  const urgentLeaseTasks = findUrgentTasks(leaseKPIs || [], monthlyTasks || []);
  const urgentInfraTasks = findUrgentTasks(infraKPIs || [], monthlyTasks || []);
  const urgentIssues = [...urgentSafetyTasks, ...urgentLeaseTasks, ...urgentInfraTasks]
    .map(task => ({ id: task.id, text: `[${task.kpiId}] ${task.name}` }));

  // 2. 오늘 마감 업무 (데이터가 없을 경우 빈 배열로 처리)
  const dueToday = (monthlyTasks || [])
    .filter(task => task.dueDate && isToday(new Date(task.dueDate)))
    .map(task => ({ id: task.id, text: task.name }));

  // 3. 지연 중인 업무 (데이터가 없을 경우 빈 배열로 처리)
  const delayedTasks = (monthlyTasks || [])
    .filter(task => task.dueDate && isPast(new Date(task.dueDate)) && task.status !== 'completed')
    .map(task => ({ id: task.id, text: task.name }));

  const isLoading = !safetyKPIs || !leaseKPIs || !infraKPIs || !monthlyTasks;

  return {
    urgentIssues,
    dueToday,
    delayedTasks,
    isLoading,
  };
};
