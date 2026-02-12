
import React, { useState, useMemo } from 'react';
import { X, PlusCircle } from 'lucide-react';
import { useAppData } from '../providers/AppDataContext';
import { KPI, Activity, Task, WeeklyRecord, TaskStatus } from '../types';
import TaskEditModal from './TaskEditModal';
import { 
    startOfWeek, 
    endOfWeek, 
    format, 
    startOfMonth, 
    endOfMonth, 
    parseISO,
    addDays,
    isSameDay,
    getDate, 
    getDay, 
    eachDayOfInterval
} from 'date-fns';
import { ko } from 'date-fns/locale';

const getWeeksForMonth = (date: Date) => {
    const monthStart = startOfMonth(date);
    const monthEnd = endOfMonth(date);
    const firstDayOfMonth = getDay(monthStart);

    const weeks = [];
    let currentDay = monthStart;
    let weekNumber = 1;

    while (currentDay <= monthEnd) {
        const weekStart = startOfWeek(currentDay, { weekStartsOn: 0 });
        const weekEnd = endOfWeek(currentDay, { weekStartsOn: 0 });

        const dayOfMonth = getDate(currentDay);
        const calculatedWeekNumber = Math.ceil((dayOfMonth + firstDayOfMonth) / 7);

        weeks.push({
            weekNumber: calculatedWeekNumber,
            startDate: weekStart,
            dateRange: `${format(weekStart, 'M/d')}~${format(weekEnd, 'M/d')}`
        });

        currentDay = addDays(weekEnd, 1);
        weekNumber++;
    }
    
    const uniqueWeeks = weeks.filter((week, index, self) =>
        index === self.findIndex((t) => t.weekNumber === week.weekNumber)
    );

    return uniqueWeeks;
};

const getWeekOfMonth = (date: Date) => {
    const monthStart = startOfMonth(date);
    const firstDayOfMonth = getDay(monthStart);
    const dayOfMonth = getDate(date);
    return Math.ceil((dayOfMonth + firstDayOfMonth) / 7);
}

interface TaskManagerProps {
  kpiId: string;
  activityId: string;
  onClose: () => void;
}

const TaskManager: React.FC<TaskManagerProps> = ({ kpiId, activityId, onClose }) => {
  const { kpiData, addTask, updateTask, deleteActivityFromKpi } = useAppData();
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [newTaskName, setNewTaskName] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [daySelection, setDaySelection] = useState<[number | null, number | null]>([null, null]);

  const selectedYear = currentDate.getFullYear();
  const selectedMonth = currentDate.getMonth() + 1;
  const monthWeeks = useMemo(() => getWeeksForMonth(currentDate), [currentDate]);
  const selectedWeekNumber = useMemo(() => getWeekOfMonth(currentDate), [currentDate]);

  const { kpi, activity } = useMemo(() => {
    const currentKpi = kpiData.find((k: KPI) => k.id === kpiId);
    const currentActivity = currentKpi?.activities.find((a: Activity) => a.id === activityId);
    return { kpi: currentKpi, activity: currentActivity };
  }, [kpiData, kpiId, activityId]);

  const tasksForSelectedWeek = useMemo(() => {
    if (!activity?.tasks) return [];
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
    const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 });
    return activity.tasks.filter(task => {
        try {
            const taskStart = parseISO(task.startDate);
            const taskEnd = parseISO(task.endDate);
            return taskStart <= weekEnd && taskEnd >= weekStart;
        } catch (e) { return false; }
    }).sort((a, b) => parseISO(a.startDate).getTime() - parseISO(b.startDate).getTime());
  }, [activity?.tasks, currentDate]);

  const handleDayClick = (dayIndex: number) => {
    const [start, end] = daySelection;
    if (start === null || (start !== null && end !== null)) {
        setDaySelection([dayIndex, null]);
    } else {
        if (dayIndex < start) { setDaySelection([dayIndex, start]); } 
        else { setDaySelection([start, dayIndex]); }
    }
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    const [startDay, endDay] = daySelection;

    if (!newTaskName.trim() || !kpi || !activity) return;
    if (startDay === null || endDay === null) {
        alert("업무를 등록할 요일의 시작과 끝을 모두 선택해주세요.");
        return;
    }
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
    const startDate = addDays(weekStart, startDay);
    const endDate = addDays(weekStart, endDay);

    addTask(kpi.id, activity.id, { 
        name: newTaskName.trim(), 
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
    });

    setNewTaskName('');
    setDaySelection([null, null]);
  };
  
  const formatTaskDate = (task: Task): string => {
    try {
        const start = parseISO(task.startDate);
        const end = parseISO(task.endDate);
        const startFormat = format(start, 'M월 d일 (eee)', { locale: ko });

        if (isSameDay(start, end)) return startFormat;

        const endFormat = format(end, 'M월 d일 (eee)', { locale: ko });
        return `${startFormat} ~ ${endFormat}`;
    } catch (e) { return "날짜 형식 오류"; }
  };

  const selectedDayIndices = useMemo(() => {
      const [start, end] = daySelection;
      if (start === null) return new Set();
      if (end === null) return new Set([start]);
      const range = new Set<number>();
      for (let i = start; i <= end; i++) range.add(i);
      return range;
  }, [daySelection]);

  const handleTaskClick = (task: Task) => { setSelectedTask(task); setIsEditModalOpen(true); };
  
  // handleSaveTask가 이제 TaskEditModal에서 결정된 최종 상태(newStatus)를 인자로 받습니다.
  const handleSaveTask = (taskId: string, updatedRecords: WeeklyRecord[], newStatus: TaskStatus) => {
    if (!activity || !kpi) return;
    const taskToUpdate = activity.tasks.find(t => t.id === taskId);
    if (!taskToUpdate) return;

    // 업데이트된 실적과 함께, 새로 계산된 업무의 최종 상태(status)를 함께 저장합니다.
    updateTask(kpi.id, activity.id, { 
        ...taskToUpdate, 
        records: updatedRecords, 
        status: newStatus 
    });
    setIsEditModalOpen(false);
  };

  const handleDeleteActivity = () => {
      if (kpi && activity && window.confirm('이 활동과 모든 하위 업무를 삭제하시겠습니까?')) {
          deleteActivityFromKpi(kpi.id, activity.id);
          onClose();
      }
  };

  const handleWeekChange = (startDate: Date) => {
    setCurrentDate(startDate);
    setDaySelection([null, null]);
  };

  if (!kpi || !activity) {
    return <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center"><div className="bg-white p-8 rounded-lg shadow-xl">로딩 중...</div></div>;
  }

  const title = `${kpi.title || '성과지표 이름 없음'} - ${activity.name || '주요 활동'}`;
  const daysOfWeek = ['일', '월', '화', '수', '목', '금', '토'];

  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center animate-fade-in">
      <div className="bg-gray-100 flex flex-col h-[90vh] w-[90vw] max-w-5xl rounded-2xl shadow-2xl overflow-hidden">
          <header className="flex-shrink-0 flex justify-between items-start p-6 border-b border-gray-200">
              <div>
                  <p className="text-orange-500 font-bold text-sm tracking-wider">WEEKLY PERFORMANCE MONITORING</p>
                  <h1 className="text-3xl font-bold text-gray-800 mt-1">{title}</h1>
              </div>
              <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200/80 transition-colors"><X size={24} className="text-gray-500" /></button>
          </header>

          <section className="flex-shrink-0 p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex-shrink-0 flex gap-1 p-1 bg-white rounded-lg border border-gray-200 self-start">
                      {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                          <button key={m} onClick={() => handleWeekChange(new Date(selectedYear, m - 1, 1))} className={`px-3 py-1 text-sm font-semibold rounded ${selectedMonth === m ? 'bg-orange-500 text-white' : 'text-gray-500 hover:bg-orange-50'}`}>{m}월</button>
                      ))}
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2 p-1 bg-white rounded-lg border border-gray-200 w-full">
                      {monthWeeks.map(({ weekNumber, startDate, dateRange }) => (
                          <button key={weekNumber} onClick={() => handleWeekChange(startDate)} className={`px-3 py-1.5 text-xs text-center font-semibold rounded ${getWeekOfMonth(currentDate) === weekNumber ? 'bg-orange-100 text-orange-600' : 'text-gray-500 hover:bg-gray-100'}`}>
                              {weekNumber}주차 ({dateRange})
                          </button>
                      ))}
                  </div>
              </div>
          </section>

          <main className="flex-grow bg-white rounded-t-2xl m-6 mt-0 p-6 overflow-y-auto">
              <form onSubmit={handleAddTask} className="p-4 border rounded-lg bg-gray-50 space-y-4">
                  <div className="flex items-center gap-2">
                      <PlusCircle size={20} className="text-gray-400 flex-shrink-0" />
                      <input type="text" value={newTaskName} onChange={(e) => setNewTaskName(e.target.value)} placeholder={`${selectedMonth}월 ${selectedWeekNumber}주차 업무 입력...`} className="w-full bg-transparent focus:outline-none placeholder-gray-400 font-semibold" />
                      <button type="submit" disabled={!newTaskName.trim() || daySelection[0] === null || daySelection[1] === null} className="px-6 py-2 bg-orange-500 text-white font-bold rounded-lg hover:bg-orange-600 disabled:bg-gray-400 transition-colors flex-shrink-0">등록</button>
                  </div>
                  <div className="flex justify-center items-center gap-2 pt-2 border-t">
                      <span className="text-sm font-semibold text-gray-500 mr-2">요일 범위 선택:</span>
                      {daysOfWeek.map((day, index) => {
                          const isSelected = selectedDayIndices.has(index);
                          const isStartOrEnd = daySelection[0] === index || daySelection[1] === index;
                          let buttonClass = 'bg-white text-gray-700 border hover:bg-blue-50';
                          if (isSelected) buttonClass = 'bg-blue-200 text-blue-800';
                          if (isStartOrEnd) buttonClass = 'bg-blue-500 text-white';
                          
                          return (
                              <button key={index} type="button" onClick={() => handleDayClick(index)} className={`w-10 h-10 text-sm font-bold rounded-full transition-colors ${buttonClass}`}>
                                  {day}
                              </button>
                          )
                      })}
                  </div>
              </form>
              
              <div className="mt-6">
                  <div className="text-sm font-semibold text-gray-500 mb-2 border-b pb-2 flex justify-between items-center">
                      <span>{`${selectedMonth}월 ${selectedWeekNumber}주차 업무 목록`}</span>
                      <span className="text-xs text-gray-400">총 {tasksForSelectedWeek.length}개</span>
                  </div>
                  <div className="space-y-2 pt-2">
                      {tasksForSelectedWeek.length > 0 ? (
                          tasksForSelectedWeek.map(task => (
                              <div key={task.id} onClick={() => handleTaskClick(task)} className="p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-all group flex justify-between items-center">
                                  <p className="font-medium text-gray-800 group-hover:text-orange-600">{task.name}</p>
                                  <span className="text-sm font-semibold text-gray-500">{formatTaskDate(task)}</span>
                              </div>
                          ))
                      ) : (
                          <div className="text-center py-16 text-gray-400">
                              <p className="font-semibold">등록된 주간 계획이 없습니다.</p>
                              <p className="text-sm">업무를 입력하고 요일 범위를 선택하여 계획을 시작하세요.</p>
                          </div>
                      )}
                  </div>
              </div>
          </main>

          <footer className="flex-shrink-0 flex justify-between items-center p-6 border-t border-gray-200 bg-gray-50/50">
              <button onClick={handleDeleteActivity} className="text-sm font-semibold text-red-500 hover:text-red-700">활동 삭제</button>
              <button onClick={onClose} className="px-6 py-3 text-sm font-bold text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300">닫기</button>
          </footer>

          {isEditModalOpen && selectedTask && <TaskEditModal task={selectedTask} onClose={() => setIsEditModalOpen(false)} onSave={handleSaveTask} />} 
      </div>
    </div>
  );
};

export default TaskManager;
