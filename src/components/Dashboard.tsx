
import React, { useState, useEffect, useMemo } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { useProjectData } from '../providers/ProjectDataProvider';
import DailyBriefing from './DailyBriefing';
import { TASK_STATUS, TASK_STATUS_DISPLAY_NAMES } from '../constants';
import { startOfMonth, endOfMonth, parseISO, subDays, isAfter, formatDistanceToNow, isBefore } from 'date-fns';
import { ko } from 'date-fns/locale';
import LeaseStatusWidget from './dashboard/LeaseStatusWidget';

const Dashboard: React.FC = () => {
  const { kpiData, navigationState } = useProjectData();
  const [isBriefingOpen, setBriefingOpen] = useState(false);

  useEffect(() => {
    const hasSeenBriefing = sessionStorage.getItem('hasSeenDailyBriefing');
    if (!hasSeenBriefing) {
      setBriefingOpen(true);
      sessionStorage.setItem('hasSeenDailyBriefing', 'true');
    }
  }, []);
  
  const taskStats = useMemo(() => {
    if (!kpiData) return { completed: 0, inProgress: 0, notStarted: 0, overdue: 0, total: 0 };

    const viewDate = new Date();
    viewDate.setMonth(navigationState.selectedMonth ?? viewDate.getMonth());
    const monthStart = startOfMonth(viewDate);
    const monthEnd = endOfMonth(viewDate);
    const now = new Date();

    const allTasks = kpiData.flatMap(kpi => kpi.activities ?? []).flatMap(activity => activity.tasks ?? []);
    
    const tasksForMonth = allTasks.filter(task => {
      try {
        const taskStart = parseISO(task.startDate);
        const taskEnd = parseISO(task.endDate);
        return taskStart <= monthEnd && taskEnd >= monthStart;
      } catch (e) {
        return false;
      }
    });

    const initialStats = { completed: 0, inProgress: 0, notStarted: 0, overdue: 0, total: 0 };

    const stats = tasksForMonth.reduce((acc, task) => {
        acc.total += 1;
        try {
            if (task.status !== TASK_STATUS.COMPLETED && isBefore(parseISO(task.endDate), now)) {
                acc.overdue += 1;
                return acc;
            }
        } catch(e) { /* empty */ }

        switch (task.status) {
          case TASK_STATUS.COMPLETED:
            acc.completed += 1;
            break;
          case TASK_STATUS.IN_PROGRESS:
            acc.inProgress += 1;
            break;
          case TASK_STATUS.NOT_STARTED:
            acc.notStarted += 1;
            break;
          default:
            if (!task.status) acc.notStarted +=1;
            break;
        }
        return acc;
      },
      initialStats
    );

    return stats;
  }, [kpiData, navigationState.selectedMonth]);
  
  const recentActivities = useMemo(() => {
    if (!kpiData) return [];
    const allTasks = kpiData.flatMap(kpi => kpi.activities ?? []).flatMap(activity => activity.tasks ?? []);
    const sevenDaysAgo = subDays(new Date(), 7);

    const recentlyCompletedTasks = allTasks
        .filter(task => {
            if (task.status === TASK_STATUS.COMPLETED) {
                try {
                    const taskEndDate = parseISO(task.endDate);
                    return isAfter(taskEndDate, sevenDaysAgo);
                } catch (e) { return false; }
            }
            return false;
        })
        .sort((a, b) => parseISO(b.endDate).getTime() - parseISO(a.endDate).getTime());

    return recentlyCompletedTasks.map(task => {
        let parentKpiTitle = '';
        for (const kpi of kpiData) {
            const activity = kpi.activities?.find(act => act.tasks?.some(t => t.id === task.id));
            if (activity) {
                parentKpiTitle = kpi.title;
                break;
            }
        }
        return {
            ...task,
            parentKpiTitle,
            activityType: 'taskCompleted',
            timestamp: task.endDate,
        };
    }).slice(0, 10); 
  }, [kpiData]);

  const selectedMonthName = useMemo(() => {
      const month = navigationState.selectedMonth ?? (new Date().getMonth());
      return new Date(0, month).toLocaleString('ko-KR', { month: 'long' });
  }, [navigationState.selectedMonth]);

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6">
      <DailyBriefing isOpen={isBriefingOpen} onClose={() => setBriefingOpen(false)} />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-white p-5 rounded-2xl shadow-sm"><p className="text-sm text-gray-500">{selectedMonthName} 총 업무</p><p className="text-3xl font-bold text-gray-800">{taskStats.total}</p></div>
        <div className="bg-white p-5 rounded-2xl shadow-sm"><p className="text-sm text-gray-500">{TASK_STATUS_DISPLAY_NAMES[TASK_STATUS.NOT_STARTED]} 업무</p><p className="text-3xl font-bold text-gray-500">{taskStats.notStarted}</p></div>
        <div className="bg-white p-5 rounded-2xl shadow-sm"><p className="text-sm text-gray-500">{TASK_STATUS_DISPLAY_NAMES[TASK_STATUS.IN_PROGRESS]} 업무</p><p className="text-3xl font-bold text-yellow-500">{taskStats.inProgress}</p></div>
        <div className="bg-white p-5 rounded-2xl shadow-sm"><p className="text-sm text-gray-500">{TASK_STATUS_DISPLAY_NAMES[TASK_STATUS.COMPLETED]} 업무</p><p className="text-3xl font-bold text-blue-500">{taskStats.completed}</p></div>
        <div className="bg-white p-5 rounded-2xl shadow-sm"><p className="text-sm text-gray-500">{TASK_STATUS_DISPLAY_NAMES[TASK_STATUS.OVERDUE]} 업무</p><p className="text-3xl font-bold text-red-500">{taskStats.overdue}</p></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <LeaseStatusWidget />
        </div>
        <div className="lg:col-span-2">
            <div className="bg-white p-6 rounded-2xl shadow-md h-full">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">주요 KPI 요약</h3>
                <div className="space-y-4">
                    {kpiData && kpiData.length > 0 ? (
                    kpiData.slice(0, 5).map((kpi) => {
                        const change = kpi.current - (kpi.previous || 0);
                        const isPositive = change >= 0;

                        return (
                        <div key={kpi.id} className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 ${kpi.color}`}>
                                {kpi.icon}
                            </div>
                            <div className="flex-1">
                                <p className="font-semibold text-gray-800">{kpi.title}</p>
                                <p className="text-sm text-gray-500">{kpi.description}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xl font-bold text-gray-900">{`${kpi.current.toLocaleString()}${kpi.unit}`}</p>
                                <p className={`text-sm font-medium ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                                    {isPositive ? '▲' : '▼'} {Math.abs(change).toLocaleString()}{kpi.unit}
                                </p>
                            </div>
                        </div>
                        );
                    })
                    ) : (
                    <div className="text-center py-8 text-gray-500">KPI 데이터가 없습니다.</div>
                    )}
                </div>
            </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-md">
           <h3 className="text-lg font-semibold text-gray-900 mb-4">최근 활동 피드</h3>
           <div className="space-y-2">
            {recentActivities && recentActivities.length > 0 ? (
                recentActivities.map(activity => (
                    <div key={activity.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                        <CheckCircle2 size={20} className="text-green-500 flex-shrink-0" />
                        <div className='flex-1'>
                            <p className="text-sm text-gray-800">
                                <span className="font-semibold">{activity.name}</span>
                            </p>
                             <p className="text-xs text-gray-500">
                                {activity.parentKpiTitle} › {formatDistanceToNow(parseISO(activity.timestamp), { addSuffix: true, locale: ko })} 완료
                            </p>
                        </div>
                    </div>
                ))
            ) : (
              <div className="text-center py-8 text-gray-500">최근 7일간 완료된 활동이 없습니다.</div>
            )}
           </div>
      </div>
    </div>
  );
};

export default Dashboard;
