
import React, { useState, useEffect, useMemo } from 'react';
import { ArrowUpRight, TrendingUp } from 'lucide-react';
import { useAppData } from '../providers/AppDataContext';
import DailyBriefing from './DailyBriefing';

// 이 카드는 이제 완전히 독립적이며, 받은 데이터만으로 렌더링됩니다.
const ProjectStatCard: React.FC<{
  title: string;
  value: string;
  status: string;
  isPrimary?: boolean;
}> = ({ title, value, status, isPrimary = false }) => {
  const cardClasses = isPrimary ? 'bg-teal-800 text-white' : 'bg-white text-gray-800 border border-gray-100';
  const statusIconColor = isPrimary ? 'text-teal-300' : 'text-gray-400';

  return (
    <div className={`p-6 rounded-3xl shadow-sm flex flex-col justify-between h-full ${cardClasses}`}>
      <div>
        <div className="flex justify-between items-start">
          <p className={`font-bold ${isPrimary ? 'text-teal-200' : 'text-gray-600'}`}>{title}</p>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isPrimary ? 'bg-white/10' : 'bg-gray-100'}`}>
            <ArrowUpRight size={16} className={`${isPrimary ? 'text-white' : 'text-gray-500'}`} />
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
  // 1. 중앙 데이터 소스 사용: 타입이 수정되어 이제 selectedMonth가 정상적으로 인식됩니다.
  const { kpiData, navigationState } = useAppData();
  const [isBriefingOpen, setBriefingOpen] = useState(false);

  useEffect(() => {
    const hasSeenBriefing = sessionStorage.getItem('hasSeenDailyBriefing');
    if (!hasSeenBriefing) {
      setBriefingOpen(true);
      sessionStorage.setItem('hasSeenDailyBriefing', 'true');
    }
  }, []);
  
  // 2. 월별 업무 통계 로직 (이제 `tasks` 속성이 Activity 타입에 정상적으로 존재합니다)
  const taskStats = useMemo(() => {
    const selectedMonth = navigationState.selectedMonth ?? (new Date().getMonth());
    
    const tasksForMonth = kpiData
      .flatMap(kpi => kpi.activities || [])
      .flatMap(activity => activity.tasks || []) // 이제 오류 없음
      .filter(task => new Date(task.dueDate).getMonth() === selectedMonth);

    const completed = tasksForMonth.filter(t => t.status === 'completed').length;
    const inProgress = tasksForMonth.filter(t => t.status === 'in-progress').length;
    const pending = tasksForMonth.filter(t => t.status === 'not-started' || t.status === 'pending').length;
    const total = tasksForMonth.length;

    return { completed, inProgress, pending, total };
  }, [kpiData, navigationState.selectedMonth]);
  
  const selectedMonthName = useMemo(() => {
      const month = navigationState.selectedMonth ?? (new Date().getMonth());
      return new Date(0, month).toLocaleString('ko-KR', { month: 'long' });
  }, [navigationState.selectedMonth]);

  const projectStats = [
    { title: `${selectedMonthName} 총 업무`, value: taskStats.total.toString(), status: '실시간 업데이트', isPrimary: true },
    { title: '완료된 업무', value: taskStats.completed.toString(), status: '지난 달 대비 증가' },
    { title: '진행중인 업무', value: taskStats.inProgress.toString(), status: '지난 달 대비 증가' },
    { title: '보류된 업무', value: taskStats.pending.toString(), status: '논의 중' },
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
            <h3 className="font-bold text-lg">플랫폼 가치</h3>
            <div className="flex gap-1">
              <button className="px-3 py-1 bg-black text-white text-[10px] font-bold rounded-full">수익</button>
              <button className="px-3 py-1 text-gray-400 text-[10px] font-bold">리드</button>
            </div>
          </div>
          <div className="space-y-6">
            {kpiData.length > 0 ? (
              kpiData.slice(0, 4).map((kpi) => {
                // 3. 'previous' 속성이 이제 KPI 타입에 존재하므로, 런타임 오류 방지만 추가합니다.
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
           <div className="flex-1 flex items-center justify-center">
             <p className="text-gray-400 font-bold">선택된 월의 상세 작업 내용은 각 KPI 섹션에서 확인해주세요.</p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
