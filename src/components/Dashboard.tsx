
import React, { useState, useEffect, useMemo } from 'react';
// 1. AlertCircle 아이콘을 추가로 임포트하여 '지연' 상태 표시에 사용합니다.
import { ArrowUpRight, TrendingUp, CheckCircle2, AlertCircle } from 'lucide-react';
import { useProjectData } from '../providers/ProjectDataProvider';
import DailyBriefing from './DailyBriefing';
import { TASK_STATUS, TASK_STATUS_DISPLAY_NAMES } from '../constants';
// 2. isBefore 함수를 임포트하여 날짜 비교 로직의 가독성을 높입니다.
import { startOfMonth, endOfMonth, parseISO, subDays, isAfter, formatDistanceToNow, isBefore } from 'date-fns';
import { ko } from 'date-fns/locale';

// 3. ProjectStatCard 컴포넌트를 개선하여 '지연'과 같은 경고성 상태를 시각적으로 표현할 수 있도록 합니다.
const ProjectStatCard: React.FC<{
  title: string;
  value: string;
  status: string;
  isPrimary?: boolean;
  isAlert?: boolean; // isAlert prop 추가
}> = ({ title, value, status, isPrimary = false, isAlert = false }) => {
  // isAlert 값에 따라 카드 스타일을 동적으로 결정합니다.
  const cardClasses = isAlert
    ? 'bg-rose-800 text-white' // 지연 상태 카드 (경고)
    : isPrimary
    ? 'bg-teal-800 text-white' // 주요 상태 카드 (총 업무)
    : 'bg-white text-gray-800 border border-gray-100'; // 일반 카드

  const statusIconColor = isAlert ? 'text-rose-300' : isPrimary ? 'text-teal-300' : 'text-gray-400';
  const iconContainerBg = isAlert ? 'bg-white/10' : isPrimary ? 'bg-white/10' : 'bg-gray-100';
  const titleColor = isAlert ? 'text-rose-200' : isPrimary ? 'text-teal-200' : 'text-gray-600';
  const IconComponent = isAlert ? AlertCircle : ArrowUpRight; // isAlert에 따라 아이콘 변경
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
  
  // 4. '지연' 상태를 포함하도록 업무 통계 집계 로직을 업데이트합니다.
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

    // 초기 누적값에 'overdue'를 추가합니다.
    const initialStats = { completed: 0, inProgress: 0, notStarted: 0, overdue: 0, total: 0 };

    const stats = tasksForMonth.reduce((acc, task) => {
        acc.total += 1;
        try {
            // 지연 상태 판별 로직을 최우선으로 배치하여 중복 집계를 방지합니다.
            if (task.status !== TASK_STATUS.COMPLETED && isBefore(parseISO(task.endDate), now)) {
                acc.overdue += 1;
                return acc; // 지연으로 판별되면 다른 상태로 집계하지 않고 즉시 반환
            }
        } catch(e) { /* 날짜 파싱 오류 시, 아래 기본 로직으로 처리 */ }

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
  
  // --- 최근 활동 피드 로직 (변경 없음) ---
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

  // 5. 통계 카드 목록에 '지연 업무' 카드를 추가합니다.
  const projectStats = [
    { title: `${selectedMonthName} 총 업무`, value: taskStats.total.toString(), status: '실시간 업데이트', isPrimary: true },
    // '지연 업무' 카드를 두 번째에 배치하고, isAlert prop을 true로 설정하여 시각적 경고를 전달합니다.
    { title: TASK_STATUS_DISPLAY_NAMES[TASK_STATUS.OVERDUE] + ' 업무', value: taskStats.overdue.toString(), status: '즉시 조치 필요', isAlert: true },
    { title: TASK_STATUS_DISPLAY_NAMES[TASK_STATUS.COMPLETED] + ' 업무', value: taskStats.completed.toString(), status: '지난 달 대비 증가' },
    { title: TASK_STATUS_DISPLAY_NAMES[TASK_STATUS.IN_PROGRESS] + ' 업무', value: taskStats.inProgress.toString(), status: '지난 달 대비 증가' },
  ];

  return (
    <div className="flex flex-col gap-8 pb-10">
      <DailyBriefing isOpen={isBriefingOpen} onClose={() => setBriefingOpen(false)} />
      {/* '지연 업무' 카드가 포함된 그리드. 순서와 디자인이 자동으로 업데이트됩니다. */}
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
