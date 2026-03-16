
import React, { useState, useMemo, MouseEvent } from 'react';
import { X, PlusCircle, Trash2, MessageSquare, ArrowLeft, Send } from 'lucide-react';
import { useProjectData } from '../../providers/ProjectDataProvider';
import { KPI, Activity, Task, WeeklyRecord, TaskStatus, Comment } from '../../types';
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
    getWeekOfMonth,
    isSunday, 
    isSaturday
} from 'date-fns';
import { ko } from 'date-fns/locale';
import { getHolidaysForYear } from '../../data/holidays';
import { getComputedTaskStatus } from '../../utils/taskUtils';
import { TASK_STATUS, TASK_STATUS_DISPLAY_NAMES } from '../../constants';

// Helper function to get weeks in a month
const getWeeksForMonth = (date: Date) => {
    const monthStart = startOfMonth(date);
    const monthEnd = endOfMonth(date);
    let weeks = [];
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
    
    return weeks.filter((week, index, self) =>
        index === self.findIndex((t) => t.dateRange === week.dateRange)
    );
};

// Helper function for status badge styling
const getStatusBadgeClass = (status: TaskStatus): string => {
  switch (status) {
    case TASK_STATUS.OVERDUE: return 'bg-rose-100 text-rose-800 border-rose-200';
    case TASK_STATUS.COMPLETED: return 'bg-green-100 text-green-800 border-green-200';
    case TASK_STATUS.IN_PROGRESS: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case TASK_STATUS.NOT_STARTED: return 'bg-gray-100 text-gray-800 border-gray-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

interface WeeklyPerformanceModalProps {
  kpi: KPI;
  activity: Activity;
  onClose: () => void;
}

export const WeeklyPerformanceModal: React.FC<WeeklyPerformanceModalProps> = ({ kpi, activity, onClose }) => {
  // --- STATE MANAGEMENT ---
  const { addTask, updateTask, deleteTask, deleteActivityFromKpi, kpiData, addCommentToTask } = useProjectData();
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null); // This now controls the List vs. Comment view
  const [newTaskName, setNewTaskName] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [daySelection, setDaySelection] = useState<[number | null, number | null]>([null, null]);
  const [newComment, setNewComment] = useState(''); // State for the new comment input

  // --- MEMOIZED CALCULATIONS ---
  const selectedYear = currentDate.getFullYear();
  const selectedMonth = currentDate.getMonth() + 1;

  const liveActivity = useMemo(() => {
    const liveKpi = kpiData.find(k => k.id === kpi.id);
    return liveKpi?.activities.find(a => a.id === activity.id);
  }, [kpiData, kpi.id, activity.id]);

  // Find the most up-to-date version of the selected task, including comments
  const liveSelectedTask = useMemo(() => {
      if (!selectedTask || !liveActivity) return null;
      return liveActivity.tasks.find(t => t.id === selectedTask.id) || null;
  }, [liveActivity, selectedTask]);

  const holidaysSet = useMemo(() => getHolidaysForYear(selectedYear), [selectedYear]);
  const monthWeeks = useMemo(() => getWeeksForMonth(currentDate), [currentDate]);
  const selectedWeekNumber = useMemo(() => getWeekOfMonth(currentDate, { weekStartsOn: 1 }), [currentDate]);
  const weekStart = useMemo(() => startOfWeek(currentDate, { weekStartsOn: 1 }), [currentDate]);
  const daysInWeek = useMemo(() => Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i)), [weekStart]);

  const tasksForSelectedWeek = useMemo(() => {
    if (!liveActivity?.tasks) return [];
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
    return liveActivity.tasks.filter(task => {
        try {
            const taskStart = parseISO(task.startDate);
            const taskEnd = parseISO(task.endDate);
            return taskStart <= weekEnd && taskEnd >= weekStart;
        } catch (e) { return false; }
    }).sort((a, b) => parseISO(a.startDate).getTime() - parseISO(b.startDate).getTime());
  }, [liveActivity?.tasks, currentDate]);

  const selectedDayIndices = useMemo(() => {
      const [start, end] = daySelection;
      if (start === null) return new Set();
      if (end === null) return new Set([start]);
      const range = new Set<number>();
      for (let i = start; i <= end; i++) range.add(i);
      return range;
  }, [daySelection]);

  // --- EVENT HANDLERS ---
  const handleDayClick = (dayIndex: number) => {
    const [start, end] = daySelection;
    if (start === null || (start !== null && end !== null)) setDaySelection([dayIndex, null]);
    else if (dayIndex < start) setDaySelection([dayIndex, start]);
    else setDaySelection([start, dayIndex]);
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    const [startDay, endDay] = daySelection;
    if (!newTaskName.trim() || startDay === null || endDay === null) {
        alert("업무를 등록할 요일의 시작과 끝을 모두 선택해주세요.");
        return;
    }
    const startDate = addDays(weekStart, startDay);
    const endDate = addDays(weekStart, endDay);
    addTask(kpi.id, activity.id, { name: newTaskName.trim(), startDate: startDate.toISOString(), endDate: endDate.toISOString() });
    setNewTaskName('');
    setDaySelection([null, null]);
  };
  
  const handleDeleteTask = (e: MouseEvent<HTMLButtonElement>, taskId: string) => {
    e.stopPropagation();
    if (window.confirm('이 업무를 정말 삭제하시겠습니까?')) {
      deleteTask(kpi.id, activity.id, taskId);
    }
  };

  const handleTaskClick = (task: Task) => setSelectedTask(task);
  const handleBackToList = () => setSelectedTask(null);

  const handleAddComment = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newComment.trim() || !liveSelectedTask) return;
      
      // Call the new function from the provider
      addCommentToTask(kpi.id, activity.id, liveSelectedTask.id, newComment);
      
      setNewComment('');
  };

  const handleSaveTask = (taskId: string, updatedRecords: WeeklyRecord[], newStatus: TaskStatus) => {
    const taskToUpdate = liveActivity?.tasks.find(t => t.id === taskId);
    if (!taskToUpdate) return;
    updateTask(kpi.id, activity.id, { ...taskToUpdate, records: updatedRecords, status: newStatus });
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

  const formatTaskDate = (task: Task): string => {
    try {
        const start = parseISO(task.startDate);
        const end = parseISO(task.endDate);
        if (isSameDay(start, end)) return format(start, 'M월 d일 (eee)', { locale: ko });
        return `${format(start, 'M월 d일 (eee)', { locale: ko })} ~ ${format(end, 'M월 d일 (eee)', { locale: ko })}`;
    } catch (e) { return "날짜 형식 오류"; }
  };
  
  // --- RENDER METHODS ---

  const renderTaskList = () => (
    <>
      <form onSubmit={handleAddTask} className="p-4 border rounded-lg bg-gray-50 space-y-4">
        {/* New Task Input Form - content is unchanged */}
        <div className="flex items-center gap-2">
            <PlusCircle size={20} className="text-gray-400 flex-shrink-0" />
            <input type="text" value={newTaskName} onChange={(e) => setNewTaskName(e.target.value)} placeholder={`${selectedMonth}월 ${selectedWeekNumber}주차 업무 입력...`} className="w-full bg-transparent focus:outline-none placeholder-gray-400 font-semibold" />
            <button type="submit" disabled={!newTaskName.trim() || daySelection[0] === null || daySelection[1] === null} className="px-6 py-2 bg-orange-500 text-white font-bold rounded-lg hover:bg-orange-600 disabled:bg-gray-400 transition-colors flex-shrink-0">등록</button>
        </div>
        <div className="border-t pt-4 mt-4">
            <div className="grid grid-cols-7 gap-2">
              {daysInWeek.map((day, index) => {
                  const dayOfWeek = getDay(day);
                  const isHoliday = holidaysSet.has(format(day, 'yyyy-MM-dd'));
                  const isWeekend = isSunday(day) || isSaturday(day);
                  const textColor = (isSunday(day) || isHoliday) ? 'text-red-600' : isSaturday(day) ? 'text-orange-600' : 'text-gray-700';
                  const isSelected = selectedDayIndices.has(index);
                  const isStartOrEnd = daySelection[0] === index || daySelection[1] === index;
                  
                  let buttonClass = 'transition-colors border';
                  if (isStartOrEnd) buttonClass += ' bg-blue-500 text-white border-blue-500'; 
                  else if (isSelected) buttonClass += ' bg-blue-100 border-blue-200 text-blue-700';
                  else if (isSameDay(day, new Date())) buttonClass += ' bg-orange-50 border-orange-200';
                  else if (getMonth(day) === getMonth(currentDate)) buttonClass += ' bg-white hover:bg-gray-50 border-gray-200';
                  else buttonClass += ' bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-400';

                  return (
                      <button key={index} type="button" onClick={() => handleDayClick(index)} className={`w-full h-16 flex flex-col items-center justify-center rounded-lg ${buttonClass}`}>
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
            tasksForSelectedWeek.map(task => {
              const computedStatus = getComputedTaskStatus(task);
              return (
                <div key={task.id} onClick={() => handleTaskClick(task)} className="p-4 bg-white border rounded-lg cursor-pointer hover:bg-gray-50 transition-all group flex justify-between items-center shadow-sm hover:shadow-md">
                  <p className="font-semibold text-gray-800 group-hover:text-orange-600 truncate">{task.name}</p>
                  <div className="flex items-center gap-4 flex-shrink-0">
                    <span className={`px-3 py-1 text-xs font-bold rounded-full border ${getStatusBadgeClass(computedStatus)}`}>
                      {TASK_STATUS_DISPLAY_NAMES[computedStatus]}
                    </span>
                    <span className="text-sm font-medium text-gray-600 w-48 text-right">{formatTaskDate(task)}</span>
                    <button onClick={(e) => handleDeleteTask(e, task.id)} className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" aria-label="업무 삭제">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              )
            })
          ) : (
            <div className="text-center py-16 text-gray-400">
              <p className="font-semibold">등록된 주간 계획이 없습니다.</p>
              <p className="text-sm">업무를 입력하고 요일 범위를 선택하여 계획을 시작하세요.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );

  const renderCommentsView = () => {
    if (!liveSelectedTask) return null;

    const computedStatus = getComputedTaskStatus(liveSelectedTask);

    return (
        <div className="flex flex-col h-full">
            {/* Header for the comment view */}
            <div className="flex-shrink-0 pb-4 mb-4 border-b">
                <button onClick={handleBackToList} className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900 mb-3">
                    <ArrowLeft size={16} />
                    업무 목록으로 돌아가기
                </button>
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">{liveSelectedTask.name}</h2>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                             <span className={`px-3 py-1 text-xs font-bold rounded-full border ${getStatusBadgeClass(computedStatus)}`}>
                                {TASK_STATUS_DISPLAY_NAMES[computedStatus]}
                            </span>
                            <span>{formatTaskDate(liveSelectedTask)}</span>
                        </div>
                    </div>
                    <button onClick={() => { setIsEditModalOpen(true); }} className="px-4 py-2 text-sm font-semibold bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">
                        업무 수정
                    </button>
                </div>
            </div>

            {/* Comments List */}
            <div className="flex-grow overflow-y-auto space-y-4 pr-2">
                {liveSelectedTask.comments && liveSelectedTask.comments.length > 0 ? (
                    liveSelectedTask.comments.map(comment => (
                        <div key={comment.id} className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-500 text-sm flex-shrink-0">
                                {comment.author.substring(0, 1)}
                            </div>
                            <div className="flex-grow">
                                <div className="flex items-baseline gap-2">
                                    <span className="font-bold text-gray-800">{comment.author}</span>
                                    <span className="text-xs text-gray-400">{format(parseISO(comment.timestamp), 'yyyy.MM.dd HH:mm')}</span>
                                </div>
                                <p className="mt-1 bg-gray-100 p-3 rounded-lg text-gray-700">{comment.content}</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-16 text-gray-400 flex flex-col items-center">
                        <MessageSquare size={40} className="mb-4" />
                        <h3 className="font-bold">아직 댓글이 없습니다.</h3>
                        <p className="text-sm">이 작업에 대한 첫 번째 의견을 남겨보세요.</p>
                    </div>
                )}
            </div>

            {/* New Comment Form */}
            <div className="flex-shrink-0 pt-4 mt-4 border-t">
                <form onSubmit={handleAddComment} className="flex items-center gap-2">
                    <input
                        type="text"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="댓글을 입력하세요..."
                        className="w-full bg-gray-100 border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                    <button type="submit" disabled={!newComment.trim()} className="p-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:bg-gray-400 transition-colors flex-shrink-0">
                        <Send size={20} />
                    </button>
                </form>
            </div>
        </div>
    );
  };

  const title = `${kpi.title} - ${activity.name}`;

  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center animate-fade-in">
      <div className="bg-gray-100 flex flex-col h-[90vh] w-[90vw] max-w-5xl rounded-2xl shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <header className="flex-shrink-0 flex justify-between items-start p-6 border-b border-gray-200">
            <div>
                <p className="text-orange-500 font-bold text-sm tracking-wider">WEEKLY PERFORMANCE MONITORING</p>
                <h1 className="text-3xl font-bold text-gray-800 mt-1">{title}</h1>
            </div>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200/80 transition-colors"><X size={24} className="text-gray-500" /></button>
        </header>

        {/* Month/Week Navigation */}
        {!selectedTask && (
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
        )}

        {/* Main Content: Switches between Task List and Comments */}
        <main className="flex-grow bg-white rounded-t-2xl m-6 mt-0 p-6 overflow-y-auto">
            {selectedTask ? renderCommentsView() : renderTaskList()}
        </main>

        {/* Footer */}
        <footer className="flex-shrink-0 flex justify-between items-center p-6 border-t border-gray-200 bg-gray-50/50">
            <button onClick={handleDeleteActivity} className="text-sm font-semibold text-red-500 hover:text-red-700">활동 삭제</button>
            <button onClick={onClose} className="px-6 py-3 text-sm font-bold text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300">닫기</button>
        </footer>

        {/* The original Edit Modal is still available from the comments view */}
        {isEditModalOpen && liveSelectedTask && 
          <TaskEditModal 
            task={liveSelectedTask} 
            onClose={() => setIsEditModalOpen(false)} 
            onSave={handleSaveTask} 
          />
        }
      </div>
    </div>
  );
};
