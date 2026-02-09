
import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Calendar, CheckSquare, Square } from 'lucide-react';
import { BusinessActivity, MonthlyRecord, Plan } from '../types';

interface WeeklyPerformanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  activity: BusinessActivity | null;
  onSave: (updatedActivity: BusinessActivity) => void;
  onDelete: (activityId: string) => void;
}

const WeeklyPerformanceModal: React.FC<WeeklyPerformanceModalProps> = ({
  isOpen,
  onClose,
  activity,
  onSave,
  onDelete,
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [currentWeek, setCurrentWeek] = useState(1);
  const [newPlanContent, setNewPlanContent] = useState('');
  const [editableActivity, setEditableActivity] = useState<BusinessActivity | null>(null);

  useEffect(() => {
    // Deep copy the activity prop to a local state for editing
    if (activity) {
      setEditableActivity(JSON.parse(JSON.stringify(activity)));
    } else {
      setEditableActivity(null);
    }
  }, [activity]);

  if (!isOpen || !editableActivity) return null;

  const handleAddPlan = () => {
    if (!newPlanContent.trim()) return;

    const newPlan: Plan = {
      id: `plan-${Date.now()}`,
      content: newPlanContent.trim(),
      completed: false,
      week: currentWeek,
    };

    setEditableActivity(prevActivity => {
      if (!prevActivity) return null;
      const newActivity = { ...prevActivity };
      let monthRecord = newActivity.monthlyRecords?.find(r => r.month === currentMonth);

      if (monthRecord) {
        monthRecord.plans.push(newPlan);
      } else {
        if (!newActivity.monthlyRecords) {
          newActivity.monthlyRecords = [];
        }
        newActivity.monthlyRecords.push({ month: currentMonth, plans: [newPlan] });
      }
      return newActivity;
    });

    setNewPlanContent('');
  };

  const handleTogglePlan = (planId: string) => {
    setEditableActivity(prevActivity => {
      if (!prevActivity) return null;
      const newActivity = { ...prevActivity };
      newActivity.monthlyRecords = newActivity.monthlyRecords?.map(monthRecord => ({
        ...monthRecord,
        plans: monthRecord.plans.map(plan => 
          plan.id === planId ? { ...plan, completed: !plan.completed } : plan
        )
      }));
      return newActivity;
    });
  };

  const handleDeletePlan = (planId: string) => {
     setEditableActivity(prevActivity => {
      if (!prevActivity) return null;
       const newActivity = { ...prevActivity };
       newActivity.monthlyRecords = newActivity.monthlyRecords?.map(monthRecord => ({
         ...monthRecord,
         plans: monthRecord.plans.filter(plan => plan.id !== planId)
       }));
      return newActivity;
    });
  };

  const handleSave = () => {
    if (editableActivity) {
      onSave(editableActivity);
    }
    onClose();
  };

  const handleDeleteActivity = () => {
    if (window.confirm('정말로 이 활동을 삭제하시겠습니까? 활동에 포함된 모든 업무 기록이 사라집니다.')) {
      onDelete(editableActivity.id);
      onClose();
    }
  }

  const plansForCurrentWeek = editableActivity.monthlyRecords
    ?.find(r => r.month === currentMonth)
    ?.plans.filter(p => p.week === currentWeek) || [];

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[2000] p-4">
      <div className="bg-white/95 rounded-3xl w-full max-w-5xl h-[90vh] shadow-2xl flex flex-col">
        <header className="bg-blue-600 text-white p-6 rounded-t-3xl flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-2 rounded-lg"><Calendar size={24} /></div>
            <div>
              <h2 className="text-2xl font-bold">{editableActivity.content}</h2>
              <p className="text-sm opacity-80">주간 성과 모니터링</p>
            </div>
          </div>
          <button onClick={onClose} className="bg-white/20 p-2 rounded-full hover:bg-white/30 transition-colors"><X size={20} /></button>
        </header>

        <main className="flex-grow p-6 overflow-y-auto">
          <div className="mb-6">
              <div className="flex gap-2 border-b border-gray-200 pb-2 mb-2">
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                      <button key={month} onClick={() => setCurrentMonth(month)} className={`px-4 py-1.5 text-sm font-semibold rounded-lg ${currentMonth === month ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:bg-gray-100'}`}>{month}월</button>
                  ))}
              </div>
              <div className="flex gap-2">
                  {Array.from({ length: 5 }, (_, i) => i + 1).map(week => (
                      <button key={week} onClick={() => setCurrentWeek(week)} className={`px-3 py-1 text-xs font-bold rounded-full ${currentWeek === week ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}>{week}주차</button>
                  ))}
              </div>
          </div>
          <div className="flex gap-2 items-center mb-6">
              <Plus size={24} className="text-blue-500"/>
              <input type="text" value={newPlanContent} onChange={(e) => setNewPlanContent(e.target.value)} placeholder={`${currentMonth}월 ${currentWeek}주차에 수행할 단위 업무 실적을 입력하세요...`} className="flex-grow bg-transparent border-b-2 border-gray-300 focus:border-blue-500 py-2 text-gray-800 focus:outline-none" onKeyPress={(e) => e.key === 'Enter' && handleAddPlan()}/>
              <button onClick={handleAddPlan} className="bg-blue-600 text-white font-semibold px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">업무 등록</button>
          </div>
          <div className="space-y-3">
              <h3 className="text-sm font-bold text-gray-500 mb-2">{currentMonth}월 {currentWeek}주차 업무 리스트</h3>
              {plansForCurrentWeek.length > 0 ? (
                  plansForCurrentWeek.map(plan => (
                      <div key={plan.id} className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg group">
                          <button onClick={() => handleTogglePlan(plan.id)}>
                              {plan.completed ? <CheckSquare size={20} className="text-green-500"/> : <Square size={20} className="text-gray-300"/>}
                          </button>
                          <span className={`flex-grow text-gray-800 ${plan.completed ? 'line-through text-gray-400' : ''}`}>{plan.content}</span>
                          <button onClick={() => handleDeletePlan(plan.id)} className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 transition-opacity">
                              <Trash2 size={16}/>
                          </button>
                      </div>
                  ))
              ) : (
                  <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-xl">
                      <p className="text-gray-500">등록된 주간 계획이 없습니다.</p>
                      <p className="text-xs text-gray-400">SELECT WEEK OR ADD NEW PERFORMANCE</p>
                  </div>
              )}
          </div>
        </main>

        <footer className="p-6 bg-gray-50 rounded-b-3xl flex justify-between items-center border-t border-gray-200">
           <button onClick={handleDeleteActivity} className="flex items-center gap-2 text-sm text-red-600 hover:text-red-800 font-semibold"><Trash2 size={16}/>활동 삭제</button>
          <div>
            <button onClick={onClose} className="text-gray-600 font-semibold px-6 py-3 mr-2">닫기</button>
            <button onClick={handleSave} className="bg-blue-700 text-white font-bold px-8 py-3 rounded-lg hover:bg-blue-800 transition-transform active:scale-95">변경사항 저장</button>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default WeeklyPerformanceModal;
