
import React, { useState, useMemo, MouseEvent } from 'react';
import { X, PlusCircle, Trash2 } from 'lucide-react';
import { useAppData } from '../../providers/AppDataContext';
import { KPI, Activity, Task, WeeklyRecord, TaskStatus } from '../../types';
import TaskEditModal from '../TaskEditModal';
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
    getMonth,
    getWeekOfMonth
} from 'date-fns';
import { ko } from 'date-fns/locale';
import { getHolidaysForYear } from '../../data/holidays';

const getWeeksForMonth = (date: Date) => {
    const monthStart = startOfMonth(date);
    const monthEnd = endOfMonth(date);
    const weeks = [];
    let currentDay = monthStart;

    while (currentDay <= monthEnd) {
        const weekStart = startOfWeek(currentDay, { weekStartsOn: 1 });
        const weekEnd = endOfWeek(currentDay, { weekStartsOn: 1 });
        const weekNumber = getWeekOfMonth(weekStart, { weekStartsOn: 1 });
        
        weeks.push({
            weekNumber: weekNumber,
            startDate: weekStart, 
            dateRange: `${format(weekStart, 'M/d')}~${format(weekEnd, 'M/d')}`
        });
        
        currentDay = addDays(weekEnd, 1);
    }
    
    const uniqueWeeks = weeks.filter((week, index, self) =>
        index === self.findIndex((t) => t.dateRange === week.dateRange)
    );
    return uniqueWeeks;
};

interface WeeklyPerformanceModalProps {
  kpi: KPI;
  activity: Activity;
  onClose: () => void;
}

export const WeeklyPerformanceModal: React.FC<WeeklyPerformanceModalProps> = ({ kpi, activity, onClose }) => {
  // =========================================================================================
  // [핵심 수정] 1. 실시간 데이터 반영을 위해 Context에서 직접 최신 데이터를 가져옵니다.
  // =========================================================================================
  const { addTask, updateTask, deleteTask, deleteActivityFromKpi, kpiData } = useAppData();
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [newTaskName, setNewTaskName] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [daySelection, setDaySelection] = useState<[number | null, number | null]>([null, null]);

  const selectedYear = currentDate.getFullYear();
  const selectedMonth = currentDate.getMonth() + 1;

  // props로 받은 activity는 상태 업데이트 시 실시간 반영이 안되므로, 항상 최신 kpiData에서 현재 activity를 찾습니다.
  const liveActivity = useMemo(() => {
    const liveKpi = kpiData.find(k => k.id === kpi.id);
    return liveKpi?.activities.find(a => a.id === activity.id);
  }, [kpiData, kpi.id, activity.id]);

  const holidaysSet = useMemo(() => getHolidaysForYear(selectedYear), [selectedYear]);

  const monthWeeks = useMemo(() => getWeeksForMonth(currentDate), [currentDate]);
  const selectedWeekNumber = useMemo(() => getWeekOfMonth(currentDate, { weekStartsOn: 1 }), [currentDate]);

  const weekStart = useMemo(() => startOfWeek(currentDate, { weekStartsOn: 1 }), [currentDate]);
  const daysInWeek = useMemo(() => Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i)), [weekStart]);

  const tasksForSelectedWeek = useMemo(() => {
    if (!liveActivity?.tasks) return []; // 최신 activity 데이터 사용
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
    return liveActivity.tasks.filter(task => {
        try {
            const taskStart = parseISO(task.startDate);
            const taskEnd = parseISO(task.endDate);
            return taskStart <= weekEnd && taskEnd >= weekStart;
        } catch (e) { return false; }
    }).sort((a, b) => parseISO(a.startDate).getTime() - parseISO(b.startDate).getTime());
  }, [liveActivity?.tasks, currentDate]); // 종속성 배열에 최신 데이터 추가

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

    if (!newTaskName.trim() || startDay === null || endDay === null) {
        alert("업무를 등록할 요일의 시작과 끝을 모두 선택해주세요.");
        return;
    }
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
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
  
  // =========================================================================================
  // [핵심 수정] 2. 개별 업무를 삭제하는 핸들러 함수를 추가합니다.
  // =========================================================================================
  const handleDeleteTask = (e: MouseEvent<HTMLButtonElement>, taskId: string) => {
    e.stopPropagation(); // 부모의 onClick(수정 모달 열기) 이벤트가 실행되는 것을 방지
    if (window.confirm('이 업무를 정말 삭제하시겠습니까?')) {
      deleteTask(kpi.id, activity.id, taskId);
    }
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
  
  const handleSaveTask = (taskId: string, updatedRecords: WeeklyRecord[], newStatus: TaskStatus) => {
    const taskToUpdate = liveActivity?.tasks.find(t => t.id === taskId); // 최신 activity 데이터 사용
    if (!taskToUpdate) return;

    updateTask(kpi.id, activity.id, { 
        ...taskToUpdate, 
        records: updatedRecords, 
        status: newStatus 
    });
    setIsEditModalOpen(false);
  };

  const handleDeleteActivity = () => {
      if (window.confirm('이 활동과 모든 하위 업무를 삭제하시겠습니까?')) {
          deleteActivityFromKpi(kpi.id, activity.id);
          onClose();
      }
  };

  const handleWeekChange = (startDate: Date) => {
    setCurrentDate(startDate);
    setDaySelection([null, null]);
  };

  const title = `${kpi.title} - ${activity.name}`;

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
                          <button key={dateRange} onClick={() => handleWeekChange(startDate)} className={`px-3 py-1.5 text-xs text-center font-semibold rounded ${getWeekOfMonth(currentDate, { weekStartsOn: 1 }) === weekNumber && getMonth(startDate) === getMonth(currentDate) ? 'bg-orange-100 text-orange-600' : 'text-gray-500 hover:bg-gray-100'}`}>
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
                  
                  <div className="border-t pt-4 mt-4">
                      <div className="grid grid-cols-7 gap-2">
                        {daysInWeek.map((day, index) => {
                            const dayOfWeek = getDay(day);
                            const formattedDate = format(day, 'yyyy-MM-dd');
                            const isHoliday = holidaysSet.has(formattedDate);
                            const isSaturday = dayOfWeek === 6;
                            const isSunday = dayOfWeek === 0;

                            let textColor = 'text-gray-700';
                            if(isSunday || isHoliday) textColor = 'text-red-600';
                            else if (isSaturday) textColor = 'text-orange-600';

                            const isSelected = selectedDayIndices.has(index);
                            const isStartOrEnd = daySelection[0] === index || daySelection[1] === index;
                            const isToday = isSameDay(day, new Date());
                            const isCurrentMonth = getMonth(day) === getMonth(currentDate);

                            let buttonClass = 'transition-colors border';
                            if (isStartOrEnd) {
                                buttonClass += ' bg-blue-500 text-white border-blue-500'; 
                            } else if (isSelected) {
                                buttonClass += ' bg-blue-100 border-blue-200';
                                if(isSunday || isHoliday) buttonClass += ' text-red-700';
                                else if (isSaturday) buttonClass += ' text-orange-700';
                                else buttonClass += ' text-blue-700';
                            } else if (isToday) {
                                buttonClass += ' bg-orange-50 border-orange-200';
                            } else if (isCurrentMonth) {
                                buttonClass += ' bg-white hover:bg-gray-50 border-gray-200';
                            } else {
                                buttonClass += ' bg-gray-50 hover:bg-gray-100 border-gray-200'; 
                            }
                            if (!isCurrentMonth && !isSelected) {
                                textColor = 'text-gray-400';
                            }
                            
                            return (
                                <button 
                                  key={index} 
                                  type="button" 
                                  onClick={() => handleDayClick(index)} 
                                  className={`w-full h-16 flex flex-col items-center justify-center rounded-lg ${buttonClass}`}>
                                    <span className={`text-xs font-bold ${textColor}`}>{format(day, 'eee', { locale: ko })}</span>
                                    <span className={`text-lg font-bold mt-1 ${textColor}`}>{getDate(day)}</span>
                                </button>
                            )
                        })}
                      </div>
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
                                  <p className="font-medium text-gray-800 group-hover:text-orange-600 truncate">{task.name}</p>
                                  <div className="flex items-center gap-4 flex-shrink-0">
                                    <span className="text-sm font-semibold text-gray-500">{formatTaskDate(task)}</span>
                                    {/* ========================================================================================= */}
                                    {/* [핵심 수정] 3. 마우스를 올리면 나타나는 삭제 버튼을 추가합니다.                           */}
                                    {/* ========================================================================================= */}
                                    <button 
                                      onClick={(e) => handleDeleteTask(e, task.id)} 
                                      className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                      aria-label="업무 삭제"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  </div>
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

          {isEditModalOpen && selectedTask && 
            <TaskEditModal 
              task={selectedTask} 
              onClose={() => setIsEditModalOpen(false)} 
              onSave={handleSaveTask} 
            />
          } 
      </div>
    </div>
  );
};
