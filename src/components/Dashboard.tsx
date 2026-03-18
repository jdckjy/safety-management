
import React, { useState, useEffect, useMemo } from 'react';
import { ArrowUpRight, TrendingUp, CheckCircle2, AlertCircle } from 'lucide-react';
import { useProjectData } from '../providers/ProjectDataProvider';
import DailyBriefing from './DailyBriefing';
import { TASK_STATUS, TASK_STATUS_DISPLAY_NAMES } from '../constants';
import { startOfMonth, endOfMonth, parseISO, subDays, isAfter, formatDistanceToNow, isBefore } from 'date-fns';
import { ko } from 'date-fns/locale';

const ProjectStatCard: React.FC<{
  title: string;
  value: string;
  status: string;
  isPrimary?: boolean;
  isAlert?: boolean;
}> = ({ title, value, status, isPrimary = false, isAlert = false }) => {
  const cardClasses = isAlert
    ? 'bg-rose-800 text-white'
    : isPrimary
    ? 'bg-teal-800 text-white'
    : 'bg-white text-gray-800 border border-gray-100';

  const statusIconColor = isAlert ? 'text-rose-300' : isPrimary ? 'text-teal-300' : 'text-gray-400';
  const iconContainerBg = isAlert ? 'bg-white/10' : isPrimary ? 'bg-white/10' : 'bg-gray-100';
  const titleColor = isAlert ? 'text-rose-200' : isPrimary ? 'text-teal-200' : 'text-gray-600';
  const IconComponent = isAlert ? AlertCircle : ArrowUpRight;
  const iconColor = isAlert ? 'text-white' : isPrimary ? 'text-white' : 'text-gray-500';

  return (
    <div className={`p-6 rounded-3xl shadow-sm flex flex-col justify-between h-full ${cardClasses}`}>
      <div>
        <div className="flex justify-between items-start">
          <p className={`font-bold ${titleColor}`}>{title}</p>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${iconContainerBg}`}>
            <IconComponent size={16} className={iconColor} />
          </div>
        </div>
        <h3 className="text-5xl font-black tracking-tighter mt-4">{value}</h3>
      </div>
      <div className="flex items-center gap-2 text-xs mt-6">
        <TrendingUp size={14} className={statusIconColor} />
        <span className={statusIconColor}>{status}</span>
      </div>
    </div>
  );
};

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

  const projectStats = [
    { title: `${selectedMonthName} 총 업무`, value: taskStats.total.toString(), status: '실시간 업데이트', isPrimary: true },
    { title: TASK_STATUS_DISPLAY_NAMES[TASK_STATUS.OVERDUE] + ' 업무', value: taskStats.overdue.toString(), status: '즉시 조치 필요', isAlert: true },
    { title: TASK_STATUS_DISPLAY_NAMES[TASK_STATUS.COMPLETED] + ' 업무', value: taskStats.completed.toString(), status: '지난 달 대비 증가' },
    { title: TASK_STATUS_DISPLAY_NAMES[TASK_STATUS.IN_PROGRESS] + ' 업무', value: taskStats.inProgress.toString(), status: '지난 달 대비 증가' },
  ];

  return (
    <div className="flex flex-col gap-8 pb-10">
      <DailyBriefing isOpen={isBriefingOpen} onClose={() => setBriefingOpen(false)} />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {projectStats.map(stat => (
          <ProjectStatCard key={stat.title} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-12 lg:col-span-4 bg-white p-8 rounded-3xl shadow-sm border border-gray-50">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold text-lg">주요 KPI 요약</h3>
          </div>
          <div className="space-y-6">
            {kpiData.length > 0 ? (
              kpiData.slice(0, 5).map((kpi) => {
                const isPositive = (kpi.current - (kpi.previous || 0)) >= 0;
                const change = Math.abs(kpi.current - (kpi.previous || 0));

                return (
                  <div key={kpi.id} className="flex items-center justify-between group cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center ${kpi.color}`}>
                        {kpi.icon}
                      </div>
                      <span className="text-xs font-bold text-gray-500 group-hover:text-black transition-colors">{kpi.title}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black tracking-tight">{`${kpi.current}${kpi.unit}`}</p>
                      <div className={`flex items-center justify-end gap-1 text-[10px] font-bold ${isPositive ? 'text-pink-500' : 'text-blue-500'}`}>
                        {isPositive ? '↗' : '↘'}
                        <span>{change}{kpi.unit}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center text-gray-400 font-bold">KPI 데이터가 없습니다.</div>
            )}
          </div>
        </div>

        <div className="col-span-12 lg:col-span-8 bg-white p-8 rounded-3xl shadow-sm border border-gray-50 flex flex-col min-h-[400px]">
           <h3 className="font-bold text-lg mb-4">최근 활동 피드</h3>
           <div className="space-y-3 flex-1 overflow-y-auto pr-2">
            {recentActivities.length > 0 ? (
                recentActivities.map(activity => (
                    <div key={activity.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                        <div className="w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center mt-0.5">
                            <CheckCircle2 size={16} className="text-teal-500" />
                        </div>
                        <div className='flex-1'>
                            <p className="text-sm font-bold text-gray-800 leading-snug">
                                {activity.name}
                            </p>
                             <p className="text-xs text-gray-400 mt-0.5">
                                <span className='font-semibold'>{activity.parentKpiTitle}</span> 섹션에서
                                {' '}{formatDistanceToNow(parseISO(activity.timestamp), { addSuffix: true, locale: ko })} 완료
                            </p>
                        </div>
                    </div>
                ))
            ) : (
              <div className="flex-1 flex items-center justify-center h-full">
                <p className="text-gray-400 font-bold">최근 7일간 완료된 활동이 없습니다.</p>
              </div>
            )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
