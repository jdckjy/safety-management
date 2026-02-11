
import React, { useState, useEffect, useMemo } from 'react';
import { X, Plus, Trash2, ChevronDown, Circle, CheckCircle, PauseCircle, PlayCircle, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAppData } from '../providers/AppDataContext';
import { Task, TaskStatus } from '../types';

// --- 2026 Holidays --- //
const holidays2026 = new Set([
    '1-1',   // 신정
    '2-16',  // 설날 연휴
    '2-17',  // 설날
    '2-18',  // 설날 연휴
    '3-1',   // 삼일절 (Sunday)
    '5-5',   // 어린이날
    '5-25',  // 부처님오신날 (대체공휴일)
    '6-6',   // 현충일 (Saturday)
    '8-15',  // 광복절 (Saturday)
    '9-24',  // 추석 연휴
    '9-25',  // 추석
    '9-26',  // 추석 연휴 (Saturday)
    '10-3',  // 개천절 (Saturday)
    '10-9',  // 한글날
    '12-25', // 성탄절
]);

const isHoliday = (year: number, month: number, day: number) => {
    if (year === 2026) {
        return holidays2026.has(`${month}-${day}`);
    }
    return false;
};

const dayOfWeekNames = ['일', '월', '화', '수', '목', '금', '토'];

interface WeeklyPerformanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedMonth?: number;
  selectedWeek?: number;
}

const getStatusStyle = (status: TaskStatus) => {
  switch (status) {
    case 'completed':
      return { icon: <CheckCircle size={20} className="text-green-500" />, text: '완료', color: 'text-green-500' };
    case 'in-progress':
      return { icon: <PlayCircle size={20} className="text-blue-500" />, text: '진행중', color: 'text-blue-500' };
    case 'pending':
      return { icon: <PauseCircle size={20} className="text-yellow-500" />, text: '보류', color: 'text-yellow-500' };
    default:
      return { icon: <Circle size={20} className="text-gray-400" />, text: '시작 전', color: 'text-gray-400' };
  }
};

const StatusDropdown: React.FC<{ task: Task }> = ({ task }) => {
  const { updateTaskStatus } = useAppData();
  const [isOpen, setIsOpen] = useState(false);
  const statuses: TaskStatus[] = ['not-started', 'in-progress', 'pending', 'completed'];
  const currentStyle = getStatusStyle(task.status);

  return (
    <div className="relative">
      <button onClick={() => setIsOpen(!isOpen)} className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold transition-colors ${currentStyle.color} bg-gray-100 hover:bg-gray-200`}>
        {currentStyle.icon}
        <span>{currentStyle.text}</span>
        <ChevronDown size={16} />
      </button>
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10 w-36">
          {statuses.map(status => {
            const style = getStatusStyle(status);
            return (
              <div
                key={status}
                onClick={() => { updateTaskStatus(task.id, status); setIsOpen(false); }}
                className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 cursor-pointer"
              >
                {style.icon}
                <span className={style.color}>{style.text}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const WeeklyPerformanceModal: React.FC<WeeklyPerformanceModalProps> = ({ isOpen, onClose, selectedMonth, selectedWeek }) => {
  const { monthlyTasks, addTask, deleteTask } = useAppData();
  const [newTaskName, setNewTaskName] = useState('');
  
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [currentWeekIndex, setCurrentWeekIndex] = useState(0);

  const [selectionStart, setSelectionStart] = useState<number | null>(null);
  const [selectionEnd, setSelectionEnd] = useState<number | null>(null);

  const getCalendarWeeks = (year: number, month: number): number[][] => {
    if (month < 1 || month > 12) return [];
    const lastDayOfMonth = new Date(year, month, 0);
    const numDays = lastDayOfMonth.getDate();
    
    const weeks: number[][] = [];
    let currentWeek: number[] = [];

    for (let day = 1; day <= numDays; day++) {
        const date = new Date(year, month - 1, day);
        const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday

        if (day > 1 && dayOfWeek === 1) { // It's a Monday, start a new week
            if (currentWeek.length > 0) {
                weeks.push(currentWeek);
            }
            currentWeek = [];
        }
        currentWeek.push(day);
    }
    if (currentWeek.length > 0) {
        weeks.push(currentWeek);
    }
    
    return weeks;
  };

  useEffect(() => {
    if (isOpen) {
        const year = 2026;
        const now = new Date();
        
        let month, weekIndex;

        if (selectedMonth && selectedMonth >= 1 && selectedMonth <= 12) {
            month = selectedMonth;
            const weeksForMonth = getCalendarWeeks(year, month);
            weekIndex = (selectedWeek && selectedWeek > 0) 
              ? Math.min(selectedWeek - 1, weeksForMonth.length - 1) 
              : 0;
        } else {
            month = now.getMonth() + 1;
            const day = now.getDate();
            const weeksForMonth = getCalendarWeeks(year, month);
            const foundIndex = weeksForMonth.findIndex(w => w.includes(day));
            weekIndex = foundIndex !== -1 ? foundIndex : 0;
        }

        setCurrentYear(year);
        setCurrentMonth(month);
        setCurrentWeekIndex(weekIndex);
        setSelectionStart(null);
        setSelectionEnd(null);
    }
}, [isOpen, selectedMonth, selectedWeek]);

  const calendarWeeks = useMemo(() => getCalendarWeeks(currentYear, currentMonth), [currentYear, currentMonth]);
  const daysForCurrentWeek = calendarWeeks[currentWeekIndex] || [];

  const handleDayClick = (day: number) => {
    if (selectionStart && !selectionEnd && day < selectionStart) {
      setSelectionEnd(selectionStart);
      setSelectionStart(day);
    } else if (selectionStart && !selectionEnd) {
      setSelectionEnd(day);
    } else {
      setSelectionStart(day);
      setSelectionEnd(null);
    }
  };

  const clearSelection = () => {
    setSelectionStart(null);
    setSelectionEnd(null);
  };
  
  const handleYearChange = (delta: number) => {
      const newYear = currentYear + delta;
      setCurrentYear(newYear);
      setCurrentWeekIndex(0);
      clearSelection();
  }

  const handleMonthChange = (month: number) => {
    setCurrentMonth(month);
    setCurrentWeekIndex(0);
    clearSelection();
  };

  const handleWeekChange = (weekIndex: number) => {
    setCurrentWeekIndex(weekIndex);
    clearSelection();
  };

  const handleAddTask = () => {
    if (!newTaskName.trim()) return;
    addTask({
      name: newTaskName.trim(),
      month: currentMonth,
      week: currentWeekIndex + 1,
      startDate: selectionStart || undefined,
      endDate: selectionEnd || selectionStart || undefined,
    });
    setNewTaskName('');
    clearSelection();
  };

  const handleDeleteTask = (taskId: string) => {
    if(window.confirm("정말로 이 업무를 삭제하시겠습니까?")) deleteTask(taskId);
  };
  
  const filteredTasks = monthlyTasks.filter(t => t.month === currentMonth && t.week === currentWeekIndex + 1);

  const getDayClassName = (day: number) => {
    const date = new Date(currentYear, currentMonth - 1, day);
    const dayOfWeek = date.getDay(); // 0:Sun, 6:Sat
    const isSun = dayOfWeek === 0;
    const isSat = dayOfWeek === 6;
    const holiday = isHoliday(currentYear, currentMonth, day);

    let textColor = 'text-gray-600';
    if (isSun || holiday) {
        textColor = 'text-red-500';
    } else if (isSat) {
        textColor = 'text-orange-500';
    }

    if (day === selectionStart || day === selectionEnd) {
      return 'w-10 h-12 flex flex-col justify-center items-center rounded-lg bg-blue-600 text-white transition-colors';
    }
    if (selectionStart && selectionEnd && day > selectionStart && day < selectionEnd) {
        let intervalTextColor = 'text-blue-700';
        if (isSun || holiday) {
            intervalTextColor = 'text-red-500';
        } else if (isSat) {
            intervalTextColor = 'text-orange-500';
        }
        return `w-10 h-12 flex flex-col justify-center items-center rounded-lg bg-blue-100 ${intervalTextColor} transition-colors`;
    }
    return `w-10 h-12 flex flex-col justify-center items-center rounded-lg bg-gray-200 hover:bg-gray-300 ${textColor} transition-colors`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl shadow-xl flex flex-col" style={{maxHeight: '90vh'}}>
        <header className="border-b border-gray-200 p-5 flex justify-between items-center">
          <div className='flex items-center gap-4'>
            <div className='flex items-center gap-2'>
                <button onClick={() => handleYearChange(-1)} className='p-1 rounded-full hover:bg-gray-200'><ChevronLeft size={20}/></button>
                <span className='text-xl font-bold text-gray-800 w-24 text-center'>{currentYear}년</span>
                <button onClick={() => handleYearChange(1)} className='p-1 rounded-full hover:bg-gray-200'><ChevronRight size={20}/></button>
            </div>
            <h2 className="text-xl font-bold text-gray-800">업무 관리</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100"><X size={20} /></button>
        </header>

        <main className="p-6 flex-grow overflow-y-auto">
          <div className="mb-6 space-y-3">
            <div className="flex items-center gap-2 border-b border-gray-200 pb-3 mb-3 overflow-x-auto">
              {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                <button key={month} onClick={() => handleMonthChange(month)} className={`flex-shrink-0 px-4 py-1.5 text-sm font-semibold rounded-lg ${currentMonth === month ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:bg-gray-100'}`}>{month}월</button>
              ))}
            </div>
            <div className="flex items-center gap-2 border-b border-gray-200 pb-3 mb-3">
              {calendarWeeks.map((_, index) => (
                <button key={index} onClick={() => handleWeekChange(index)} className={`px-3 py-1 text-xs font-bold rounded-full ${currentWeekIndex === index ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}>{index + 1}주차</button>
              ))}
            </div>
            <div className="flex items-center gap-2 flex-wrap pb-3">
              <button onClick={clearSelection} className={`px-3 py-1 text-xs font-bold rounded-full ${!selectionStart ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}>기간 없음</button>
              {daysForCurrentWeek.map(day => {
                  const date = new Date(currentYear, currentMonth - 1, day);
                  const dayIndex = date.getDay();
                  const dayOfWeekName = dayOfWeekNames[dayIndex];
                  const isSun = dayIndex === 0;
                  const isSat = dayIndex === 6;
                  const holiday = isHoliday(currentYear, currentMonth, day);
                  
                  let textColor = 'text-gray-500';
                  if (isSun || holiday) {
                      textColor = 'text-red-500';
                  } else if (isSat) {
                      textColor = 'text-orange-500';
                  }

                  const weekDayTextColor = (selectionStart === day || selectionEnd === day) 
                    ? 'text-white/80' 
                    : textColor;

                  return (
                      <button key={day} onClick={() => handleDayClick(day)} className={getDayClassName(day)}>
                          <span className={`text-xs font-medium ${weekDayTextColor}`}>{dayOfWeekName}</span>
                          <span className='font-bold text-base'>{day}</span>
                      </button>
                  )
              })}
            </div>
          </div>

          <div className="flex gap-2 items-center mb-6">
            <Plus size={22} className="text-blue-500"/>
            <input 
              type="text" 
              value={newTaskName} 
              onChange={(e) => setNewTaskName(e.target.value)}
              placeholder="새로운 업무를 입력하고 Enter를 누르세요..." 
              className="flex-grow bg-transparent border-b-2 border-gray-300 focus:border-blue-500 py-2 text-gray-800 focus:outline-none"
              onKeyPress={(e) => e.key === 'Enter' && handleAddTask()}
            />
            <button onClick={handleAddTask} className="bg-blue-600 text-white font-semibold px-5 py-2 rounded-lg hover:bg-blue-700">등록</button>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-bold text-gray-500 mb-2">{`${currentYear}년 ${currentMonth}월 ${currentWeekIndex + 1}주차 업무 목록`}</h3>
            {filteredTasks.length > 0 ? (
              filteredTasks.map(task => (
                <div key={task.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg group">
                  <div className='flex items-center'>
                    <span className="text-gray-700">{task.name}</span>
                    {task.startDate && (
                      <span className='text-xs text-gray-500 ml-3 flex items-center gap-1'>
                        <Calendar size={12}/>
                        {task.startDate}{task.endDate && task.endDate !== task.startDate ? `일 - ${task.endDate}일` : '일'}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                     <StatusDropdown task={task} />
                     <button onClick={() => handleDeleteTask(task.id)} className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 transition-opacity"><Trash2 size={16}/></button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl">
                <p className="text-gray-500">등록된 업무가 없습니다.</p>
                <p className="text-sm text-gray-400">새로운 업무를 추가하여 계획을 시작하세요.</p>
              </div>
            )}
          </div>
        </main>

        <footer className="p-4 bg-gray-50 border-t rounded-b-2xl flex justify-end">
            <button onClick={onClose} className="px-6 py-2.5 text-sm font-semibold text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg">닫기</button>
        </footer>
      </div>
    </div>
  );
};

export default WeeklyPerformanceModal;
