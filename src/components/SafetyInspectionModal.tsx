
// src/components/SafetyInspectionModal.tsx
import React, { useState, useMemo, useEffect } from 'react';
import { X, Calendar } from 'lucide-react';
import WeeklyPerformanceModal from './WeeklyPerformanceModal';
import { BusinessActivity, KPI } from '../types';
import { useAppData } from '../providers/AppDataContext';

interface SafetyInspectionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SafetyInspectionModal: React.FC<SafetyInspectionModalProps> = ({ isOpen, onClose }) => {
  const { safetyKPIs, setSafetyKPIs } = useAppData();
  const [activities, setActivities] = useState<BusinessActivity[]>([]);

  // Ultra-defensive data processing from global state
  useEffect(() => {
    if (isOpen) {
      try {
        const kpis = (safetyKPIs && Array.isArray(safetyKPIs)) ? safetyKPIs : [];
        const validKpis = kpis.filter(kpi => kpi && typeof kpi === 'object');

        const allActivities = validKpis.flatMap(kpi => {
          const activities = (kpi && Array.isArray(kpi.activities)) ? kpi.activities : [];
          const validActivities = activities.filter(act => act && typeof act === 'object' && act.id);
          return validActivities.map(a => ({ ...a, status: a.status || 'pending' }));
        });

        setActivities(allActivities);
      } catch (error) {
        console.error("Critical Error: Failed to process data in SafetyInspectionModal", error);
        // In case of any error, reset to a safe, empty state to prevent crashing.
        setActivities([]);
      }
    }
  }, [isOpen, safetyKPIs]);

  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [isWeeklyModalOpen, setIsWeeklyModalOpen] = useState(false);

  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const weeks = [1, 2, 3, 4, 5];

  const handleOpenWeeklyModal = (week: number) => {
    setSelectedWeek(week);
    setIsWeeklyModalOpen(true);
  };

  const handleUpdateActivity = (updatedActivity: BusinessActivity) => {
    setActivities(acts => acts.map(act => act.id === updatedActivity.id ? updatedActivity : act));
  };
  
  const handleDeleteActivity = (activityId: string) => {
    setActivities(acts => acts.filter(act => act.id !== activityId));
  };
  
  const handleAddActivity = (newActivity: BusinessActivity) => {
    setActivities(prev => [...prev, { ...newActivity, status: newActivity.status || 'pending' }]);
  };

  const handleSaveChanges = () => {
    if (!safetyKPIs || !Array.isArray(safetyKPIs)) {
      console.error("Save Changes Error: Data structure is not as expected.");
      onClose();
      return;
    }

    const originalKpis = safetyKPIs.filter(kpi => kpi && typeof kpi === 'object');
    const originalActivityToKpiMap = new Map<string, string>();
    
    originalKpis.forEach(kpi => {
      const kpiActivities = (kpi && Array.isArray(kpi.activities)) ? kpi.activities : [];
      kpiActivities.forEach(act => {
        if (act && act.id && kpi.id) {
          originalActivityToKpiMap.set(act.id, kpi.id);
        }
      });
    });

    const updatedKpis = originalKpis.map(kpi => {
      const currentKpiActivities = activities.filter(act => act && originalActivityToKpiMap.get(act.id) === kpi.id);
      return { ...kpi, activities: currentKpiActivities };
    });

    const newActivities = activities.filter(act => act && !originalActivityToKpiMap.has(act.id));

    if (newActivities.length > 0) {
      if (updatedKpis.length > 0) {
        const firstKpi = updatedKpis[0];
        firstKpi.activities = [...(firstKpi.activities || []), ...newActivities];
      } else {
        console.warn("New activities were created but no KPIs exist to assign them to.");
      }
    }

    setSafetyKPIs(updatedKpis);
    onClose();
  };
  
  const weeklyActivities = useMemo(() => {
    if (!Array.isArray(activities)) {
        return [];
    }
    return activities.filter(a => a && a.month === selectedMonth && a.week === selectedWeek);
  }, [activities, selectedMonth, selectedWeek]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-50 rounded-2xl w-full max-w-4xl shadow-xl flex flex-col" style={{maxHeight: '90vh'}}>
        <header className="bg-white border-b border-gray-200 p-5 rounded-t-2xl flex justify-between items-center">
            <div className="flex items-center gap-3">
                <div className="bg-blue-100 text-blue-600 p-2 rounded-lg"><Calendar size={22} /></div>
                <div>
                    <h2 className="text-xl font-bold text-gray-800">월간 안전 점검</h2>
                    <p className="text-sm text-gray-500">주간 성과 모니터링</p>
                </div>
            </div>
            <button onClick={onClose} className="bg-gray-100 p-2 rounded-full hover:bg-gray-200 transition-colors"><X size={18} /></button>
        </header>

        <main className="p-6 flex-grow overflow-y-auto">
            <h3 className="font-bold text-gray-700 mb-3">{selectedMonth}월 주차별 업무 요약</h3>
            <div className="grid grid-cols-5 gap-4">
                {weeks.map(week => {
                    const weekActs = Array.isArray(activities) ? activities.filter(a => a && a.month === selectedMonth && a.week === week) : [];
                    const completed = weekActs.filter(a => a.status === 'completed').length;
                    const total = weekActs.length;
                    return (
                        <div key={week} onClick={() => handleOpenWeeklyModal(week)} className="bg-white p-4 rounded-lg border border-gray-200 hover:border-blue-500 hover:shadow-lg transition-all cursor-pointer">
                            <div className="flex justify-between items-center mb-2">
                                <p className="font-bold text-gray-800">{week}주차</p>
                                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${total > 0 && completed === total ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                    {total > 0 ? `${completed}/${total} 완료` : '업무 없음'}
                                </span>
                            </div>
                            <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                                <div className="h-full bg-green-500" style={{width: total > 0 ? `${(completed/total)*100}%` : '0%'}}></div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </main>

        <footer className="p-4 bg-white border-t border-gray-200 rounded-b-2xl flex justify-end gap-3">
            <button onClick={onClose} className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg">닫기</button>
            <button onClick={handleSaveChanges} className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm">변경사항 저장</button>
        </footer>
      </div>

      <WeeklyPerformanceModal 
        isOpen={isWeeklyModalOpen}
        onClose={() => setIsWeeklyModalOpen(false)}
        activities={weeklyActivities}
        onUpdateActivity={handleUpdateActivity}
        onDeleteActivity={handleDeleteActivity}
        onAddActivity={handleAddActivity}
        selectedMonth={selectedMonth}
        selectedWeek={selectedWeek}
      />
    </div>
  );
};

export default SafetyInspectionModal;
