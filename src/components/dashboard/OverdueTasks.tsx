
import React, { useMemo } from 'react';
import { useProjectData } from '../../providers/ProjectDataProvider';
import { TASK_STATUS } from '../../constants';
import { parseISO, isBefore, formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { AlertTriangle } from 'lucide-react';

const OverdueTasks: React.FC = () => {
  const { kpiData } = useProjectData();

  const overdueTasks = useMemo(() => {
    if (!kpiData) return [];

    const now = new Date();
    const allTasks = kpiData.flatMap(kpi => kpi.activities ?? []).flatMap(activity => activity.tasks ?? []);

    return allTasks
      .filter(task => {
        try {
          return task.status !== TASK_STATUS.COMPLETED && isBefore(parseISO(task.endDate), now);
        } catch (e) {
          return false;
        }
      })
      .sort((a, b) => parseISO(a.endDate).getTime() - parseISO(b.endDate).getTime());
  }, [kpiData]);

  return (
    <div className="bg-white p-6 rounded-2xl shadow-md">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <AlertTriangle className="text-red-500 mr-2" size={20} />
        지연 업무
      </h3>
      <div className="space-y-3">
        {overdueTasks.length > 0 ? (
          overdueTasks.slice(0, 5).map(task => {
            let parentKpiTitle = '';
            for (const kpi of kpiData) {
                const activity = kpi.activities?.find(act => act.tasks?.some(t => t.id === task.id));
                if (activity) {
                    parentKpiTitle = kpi.title;
                    break;
                }
            }
            return (
                <div key={task.id} className="p-3 bg-red-50 rounded-lg">
                    <p className="font-semibold text-sm text-red-800">{task.name}</p>
                    <p className="text-xs text-red-600">
                        {parentKpiTitle}
                    </p>
                    <p className="text-xs text-red-500 mt-1">
                        마감일: {formatDistanceToNow(parseISO(task.endDate), { addSuffix: true, locale: ko })}
                    </p>
                </div>
            )
        })
        ) : (
          <div className="text-center py-4 text-gray-500">지연된 업무가 없습니다.</div>
        )}
      </div>
    </div>
  );
};

export default OverdueTasks;
