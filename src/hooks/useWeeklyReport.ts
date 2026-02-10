
import { useMemo } from 'react';
import { KPI } from '../types';
import { getWeek, startOfWeek, endOfWeek, format } from 'date-fns';

export const useWeeklyReport = (kpiData: {
    safetyKPIs?: KPI[];
    leaseKPIs?: KPI[];
    assetKPIs?: KPI[];
    infraKPIs?: KPI[];
  } | null, viewDate: Date) => {

  const reportContent = useMemo(() => {
    if (!kpiData) return '데이터를 불러오는 중입니다...';

    const year = viewDate.getFullYear();
    const weekNumber = getWeek(viewDate, { weekStartsOn: 1 });
    const weekStart = format(startOfWeek(viewDate, { weekStartsOn: 1 }), 'yyyy.MM.dd');
    const weekEnd = format(endOfWeek(viewDate, { weekStartsOn: 1 }), 'yyyy.MM.dd');

    const allKpis: KPI[] = [
      ...(kpiData.safetyKPIs || []),
      ...(kpiData.leaseKPIs || []),
      ...(kpiData.assetKPIs || []),
      ...(kpiData.infraKPIs || []),
    ];

    const recordsThisWeek = allKpis.flatMap(kpi => 
      (kpi.activities || []).flatMap(activity => 
        (activity.tasks || []).flatMap(task => 
          (task.records || [])
            .filter(record => record.year === viewDate.getFullYear() && record.week === weekNumber)
            .map(record => ({ ...record, kpiName: kpi.name, activityName: activity.name, taskName: task.name }))
        )
      )
    );

    const completed = recordsThisWeek.filter(r => r.status === 'completed');
    const inProgress = recordsThisWeek.filter(r => r.status === 'in_progress');
    const pending = recordsThisWeek.filter(r => r.status === 'pending' || r.status === 'on_hold');

    let content = `## 주간 업무 보고서 (${year}년 ${weekNumber}주차)\n`;
    content += `**기간:** ${weekStart} ~ ${weekEnd}\n\n`;

    content += '### 1. 금주 완료 업무\n';
    if (completed.length > 0) {
        completed.forEach(r => {
            content += `- [${r.kpiName}] ${r.taskName}\n`;
        });
    } else {
        content += '- 해당 없음\n';
    }
    content += '\n';

    content += '### 2. 진행 중 업무\n';
    if (inProgress.length > 0) {
        inProgress.forEach(r => {
            content += `- [${r.kpiName}] ${r.taskName}\n`;
        });
    } else {
        content += '- 해당 없음\n';
    }
    content += '\n';

    content += '### 3. 차주 예정 업무 (또는 보류)\n';
    if (pending.length > 0) {
        pending.forEach(r => {
            content += `- [${r.kpiName}] ${r.taskName}\n`;
        });
    } else {
        content += '- 해당 없음\n';
    }
    content += '\n';

    content += '### 4. 특이사항\n';
    content += '- \n';

    return content;

  }, [kpiData, viewDate]);

  const handleCopy = () => {
    navigator.clipboard.writeText(reportContent);
    alert('보고서 내용이 클립보드에 복사되었습니다.');
  };
  
  const year = viewDate.getFullYear();
  const weekNumber = getWeek(viewDate, { weekStartsOn: 1 });

  return { reportContent, handleCopy, year, weekNumber };
};
