
import { useMemo } from 'react';
import { useProjectData } from '../providers/ProjectDataProvider';
import { isToday, isAfter, parseISO, subDays } from 'date-fns';
import { KPI, Task, Activity } from '../types';

export interface BriefingData {
  tasksDueToday: Task[];
  importantUpdates: (Activity & { parentKpiTitle: string })[];
  kpisNeedingAttention: KPI[];
}

export const useDailyBriefing = (): BriefingData => {
  const { kpiData } = useProjectData();

  const yesterday = subDays(new Date(), 1);

  const tasksDueToday = useMemo(() => {
    return kpiData
      .flatMap(kpi => kpi.activities?.flatMap(a => a.tasks) || [])
      .filter(task => task && isToday(parseISO(task.endDate)));
  }, [kpiData]);

  const importantUpdates = useMemo(() => {
    const allActivities = kpiData.flatMap(kpi => 
      (kpi.activities || []).map(a => ({ ...a, parentKpiTitle: kpi.title }))
    );
    
    return allActivities
      .filter(activity => 
        activity.tasks.some(task => 
          task.comments && task.comments.some(c => isAfter(parseISO(c.timestamp), yesterday))
        )
      );
  }, [kpiData, yesterday]);

  const kpisNeedingAttention = useMemo(() => {
    return kpiData.filter(kpi => {
      const progress = (kpi.current / kpi.target) * 100;
      return progress < 50; 
    });
  }, [kpiData]);

  return { tasksDueToday, importantUpdates, kpisNeedingAttention };
};
