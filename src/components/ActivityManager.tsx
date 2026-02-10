
import React from 'react';
import { ChevronRight, PlusCircle } from 'lucide-react';
import { useAppData } from '../providers/AppDataContext';
import { KPI, Activity } from '../types';

// 이 컴포넌트는 이제 전체 페이지가 아닌, 특정 KPI 아래에 확장되어 보이는 '패널' 역할을 합니다.
// 따라서 kpiId가 아닌 kpi 객체 전체를 prop으로 받아 불필요한 조회를 없애고 독립성을 높입니다.
interface ActivityManagerProps {
  kpi: KPI;
}

const ActivityManager: React.FC<ActivityManagerProps> = ({ kpi }) => {
  // 화면 이동이 필요할 때만 전역 상태의 navigateTo 함수를 직접 사용합니다.
  const { navigateTo } = useAppData();

  // 상세 Task 화면으로 이동하는 핸들러
  const handleActivitySelect = (activityId: string) => {
    // App.tsx가 이 상태 변경을 감지하고 TaskManager를 렌더링하게 됩니다.
    navigateTo({ kpiId: kpi.id, activityId }); 
  };

  const calculateProgress = (activity: Activity) => {
    const totalTasks = activity.tasks?.length || 0;
    if (totalTasks === 0) return 0;
    const completedTasks = activity.tasks.filter(t => t.records[0]?.status === 'completed').length;
    return Math.round((completedTasks / totalTasks) * 100);
  };

  return (
    // KPICard 아래에 자연스럽게 연결되는 패널 스타일
    // KPICard의 둥근 모서리(rounded-3xl)와 맞추기 위해 하단만 둥글게(rounded-b-3xl) 처리합니다.
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

          {/* 새로운 활동 추가 UI (기능은 추후 구현) */}
          <div className="bg-transparent border-2 border-dashed border-gray-200 rounded-lg mt-4 text-center py-4 px-4 cursor-pointer hover:border-gray-300 hover:bg-gray-100/50 transition-colors">
                <PlusCircle className="mx-auto h-7 w-7 text-gray-300 mb-1"/>
                <span className="text-sm font-semibold text-gray-400">Enter new activity performance...</span>
            </div>
        </div>
    </div>
  );
};

// CSS 애니메이션을 위한 클래스를 tailwind.config.js에 추가해야 할 수 있습니다.
// @keyframes fade-in-down { 0% { opacity: 0; transform: translateY(-10px); } 100% { opacity: 1; transform: translateY(0); } }
// .animate-fade-in-down { animation: fade-in-down 0.3s ease-out; }

export default ActivityManager;
