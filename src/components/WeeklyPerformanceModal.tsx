
import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, ChevronDown, Circle, CheckCircle, PauseCircle, PlayCircle } from 'lucide-react';
import { useAppData } from '../providers/AppDataContext';
import { Task, TaskStatus } from '../types';

interface WeeklyPerformanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedMonth: number;
  selectedWeek: number;
}

// ... (getStatusStyle and StatusDropdown components remain the same)
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
                onClick={() => {
                  updateTaskStatus(task.id, status);
                  setIsOpen(false);
                }}
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
  const [currentMonth, setCurrentMonth] = useState(selectedMonth);
  const [currentWeek, setCurrentWeek] = useState(selectedWeek);
  const [currentDay, setCurrentDay] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      setCurrentMonth(selectedMonth);
      setCurrentWeek(selectedWeek);
      setCurrentDay(null); // Reset day selection when modal opens
    }
  }, [selectedMonth, selectedWeek, isOpen]);

  const handleAddTask = () => {
    if (!newTaskName.trim()) return;
    addTask({ 
      name: newTaskName.trim(), 
      month: currentMonth, 
      week: currentWeek, 
      day: currentDay ?? undefined // Add day if selected
    });
    setNewTaskName('');
  };
  
  const handleDeleteTask = (taskId: string) => {
    if(window.confirm("정말로 이 업무를 삭제하시겠습니까?")){
      deleteTask(taskId)
    }
  }

  const filteredTasks = monthlyTasks.filter(t => {
    const weekMatch = t.month === currentMonth && t.week === currentWeek;
    if (!weekMatch) return false;
    // If a day is selected, filter by day. Otherwise, show all tasks for the week.
    // A task without a day property should show up when no day is selected.
    return currentDay === null || t.day === currentDay || (currentDay !== null && t.day === undefined);
  });


  const getDaysInMonth = (month: number) => {
      // Note: Month is 1-based. Date object is 0-based for month.
      return new Date(new Date().getFullYear(), month, 0).getDate();
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl shadow-xl flex flex-col" style={{maxHeight: '90vh'}}>
        <header className="border-b border-gray-200 p-5 flex justify-between items-center flex-shrink-0">
          <h2 className="text-xl font-bold text-gray-800">업무 관리</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100"><X size={20} /></button>
        </header>

        <main className="p-6 flex-grow overflow-y-auto">
          {/* Date selectors */}
          <div className="mb-6 space-y-3">
              <div className="flex items-center gap-2 border-b border-gray-200 pb-3 mb-3 overflow-x-auto">
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                      <button key={month} onClick={() => { setCurrentMonth(month); setCurrentDay(null); }} className={`flex-shrink-0 px-4 py-1.5 text-sm font-semibold rounded-lg ${currentMonth === month ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:bg-gray-100'}`}>{month}월</button>
                  ))}
              </div>
              <div className="flex items-center gap-2 border-b border-gray-200 pb-3 mb-3">
                  {Array.from({ length: 5 }, (_, i) => i + 1).map(week => (
                      <button key={week} onClick={() => { setCurrentWeek(week); setCurrentDay(null); }} className={`px-3 py-1 text-xs font-bold rounded-full ${currentWeek === week ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}>{week}주차</button>
                  ))}
              </div>
              <div className="flex items-center gap-2 flex-wrap pb-3">
                  <button onClick={() => setCurrentDay(null)} className={`px-3 py-1 text-xs font-bold rounded-full ${currentDay === null ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}>전체</button>
                  {Array.from({ length: getDaysInMonth(currentMonth) }, (_, i) => i + 1).map(day => (
                       <button key={day} onClick={() => setCurrentDay(day)} className={`w-8 h-8 text-xs font-bold rounded-full ${currentDay === day ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}>{day}</button>
                  ))}
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
             <h3 class="text-sm font-bold text-gray-500 mb-2">{`${currentMonth}월 ${currentWeek}주차 ${currentDay ? `${currentDay}일` : '전체'} 업무`}</h3>
            {filteredTasks.length > 0 ? (
              filteredTasks.map(task => (
                <div key={task.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg group">
                  <span className="flex-grow text-gray-700">{task.name}</span>
                  <div className="flex items-center gap-4">
                     <StatusDropdown task={task} />
                     <button onClick={() => handleDeleteTask(task.id)} className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 transition-opacity">
                         <Trash2 size={16}/>
                     </button>
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

        <footer className="p-4 bg-gray-50 border-t rounded-b-2xl flex justify-end flex-shrink-0">
            <button onClick={onClose} className="px-6 py-2.5 text-sm font-semibold text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg">닫기</button>
        </footer>
      </div>
    </div>
  );
};

export default WeeklyPerformanceModal;
