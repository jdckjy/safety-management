
import { useMemo } from 'react';
import { KPI } from '../types';
import { getWeek, startOfWeek, endOfWeek, format } from 'date-fns';
// 1. "Single Source of Truth"를 임포트하여 모든 로직과 UI 텍스트의 기준으로 삼습니다.
import { TASK_STATUS, TASK_STATUS_DISPLAY_NAMES } from '../constants';

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

    // `AppDataContext`에서 이미 데이터가 완벽하게 정제되었으므로,
    // 이 곳의 로직은 안심하고 새로운 TASK_STATUS를 사용할 수 있습니다.
    const recordsThisWeek = allKpis.flatMap(kpi => 
      (kpi.activities || []).flatMap(activity => 
        (activity.tasks || []).flatMap(task => 
          (task.records || [])
            .filter(record => record.year === viewDate.getFullYear() && record.week === weekNumber)
            .map(record => ({ ...record, kpiName: kpi.title, activityName: activity.name, taskName: task.name, status: task.status }))
        )
      )
    );

    // 2. 새로운 상태 시스템(TASK_STATUS)을 기준으로 업무를 분류합니다.
    const completed = recordsThisWeek.filter(r => r.status === TASK_STATUS.COMPLETED);
    const inProgress = recordsThisWeek.filter(r => r.status === TASK_STATUS.IN_PROGRESS);
    // 'pending', 'on_hold'과 같은 모든 레거시 상태는 'NOT_STARTED'로 통합하여 집계합니다.
    const notStarted = recordsThisWeek.filter(r => r.status === TASK_STATUS.NOT_STARTED);

    let content = `## 주간 업무 보고서 (${year}년 ${weekNumber}주차)\n`;
    content += `**기간:** ${weekStart} ~ ${weekEnd}\n\n`;

    // 3. 보고서의 모든 섹션 제목과 내용을 "Single Source of Truth"에 기반하여 동적으로 생성합니다.
    content += `### 1. ${TASK_STATUS_DISPLAY_NAMES[TASK_STATUS.COMPLETED]} 업무\n`;
    if (completed.length > 0) {
        completed.forEach(r => {
            content += `- [${r.kpiName}] ${r.taskName}\n`;
        });
    } else {
        content += '- 해당 없음\n';
    }
    content += '\n';

    content += `### 2. ${TASK_STATUS_DISPLAY_NAMES[TASK_STATUS.IN_PROGRESS]} 업무\n`;
    if (inProgress.length > 0) {
        inProgress.forEach(r => {
            content += `- [${r.kpiName}] ${r.taskName}\n`;
        });
    } else {
        content += '- 해당 없음\n';
    }
    content += '\n';

    // "차주 예정 업무 (또는 보류)" 라는 모호한 표현을 "시작전 업무"로 명확히 수정합니다.
    content += `### 3. ${TASK_STATUS_DISPLAY_NAMES[TASK_STATUS.NOT_STARTED]} 업무\n`;
    if (notStarted.length > 0) {
        notStarted.forEach(r => {
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
