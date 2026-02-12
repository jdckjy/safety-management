
import React, { useState } from 'react';
import { ChevronRight, PlusCircle } from 'lucide-react';
import { useAppData } from '../providers/AppDataContext';
// 1. 수정된 타입 정의를 정확하게 임포트합니다.
import { KPI, Activity } from '../types';

interface ActivityManagerProps {
  kpi: KPI;
}

const ActivityManager: React.FC<ActivityManagerProps> = ({ kpi }) => {
  const { addActivityToKpi, navigateTo } = useAppData();
  const [newActivityName, setNewActivityName] = useState('');

  const handleActivitySelect = (activityId: string) => {
    // navigateTo의 시그니처가 변경되었으므로, kpiId도 함께 전달합니다.
    navigateTo({ menuKey: 'activityDetail', selectedKpiId: kpi.id, activityId });
  };

  const handleAddNewActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (newActivityName.trim() === '') return;

    // 2. 변경된 addActivityToKpi 시그니처에 맞게 호출합니다. (tasks 속성 제외)
    addActivityToKpi(kpi.id, {
      name: newActivityName.trim(),
    });

    setNewActivityName('');
  };

  const calculateProgress = (activity: Activity) => {
    const totalTasks = activity.tasks?.length || 0;
    if (totalTasks === 0) return 0;
    // Task의 status 필드가 변경되었으므로, 올바르게 참조합니다.
    const completedTasks = activity.tasks.filter(t => t.status === 'completed').length;
    return Math.round((completedTasks / totalTasks) * 100);
  };

  return (
    <div className="bg-gray-50/80 rounded-b-3xl -mt-2 pt-4 pb-6 px-6 border-t border-gray-200/80 animate-fade-in-down">
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Activity Ledger</h3>
            <span className="text-xs font-semibold text-gray-400">Total {kpi.activities?.length || 0} Records</span>
        </div>
        
        <div className="space-y-3">
          {(kpi.activities || []).map((activity: Activity) => {
            const progress = calculateProgress(activity);
            return (
              <div
                key={activity.id}
                onClick={() => handleActivitySelect(activity.id)}
                className="bg-white p-3 rounded-lg border border-gray-200/90 cursor-pointer hover:bg-white hover:border-gray-300 transition-all shadow-sm"
              >
                <div className="flex justify-between items-center">
                  <p className="font-semibold text-gray-700 text-sm">{activity.name}</p>
                  <div className="flex items-center gap-3">
                    <div className="w-20 bg-gray-200 rounded-full h-1.5">
                        <div className="bg-blue-500 h-1.5 rounded-full" style={{width: `${progress}%`}}></div>
                    </div>
                    <span className="text-xs font-medium text-gray-500 w-8 text-right">{progress}%</span>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              </div>
            )
          })}

          <form onSubmit={handleAddNewActivity} className="mt-4 pt-3">
            <div className="relative">
              <input
                type="text"
                value={newActivityName}
                onChange={(e) => setNewActivityName(e.target.value)}
                placeholder="새로운 성과 활동 입력..."
                className="w-full pl-4 pr-20 py-3 text-sm font-semibold text-gray-700 bg-white border-2 border-gray-200 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
              <button
                type="submit"
                className="absolute inset-y-0 right-0 flex items-center justify-center w-16 text-sm font-bold text-white bg-blue-600 rounded-r-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-400 transition-colors"
                disabled={!newActivityName.trim()}
              >
                등록
              </button>
            </div>
          </form>
        </div>
    </div>
  );
};

export default ActivityManager;
