
import React, { useState, useMemo } from 'react';
import { useProjectData } from '../providers/ProjectDataProvider';
import { Task, TaskStatus, TeamMember } from '../types'; // TeamMember 타입을 임포트합니다.
import { TASK_STATUS } from '../constants';
import { Plus } from 'lucide-react';
import TaskEditModal from './TaskEditModal';

// Board 내에서 사용할 확장된 Task 타입 정의
interface BoardTask extends Task {
  kpiId: string;
  activityId: string;
}

// --- TaskCard Component ---
const TaskCard: React.FC<{ task: BoardTask; onClick: () => void }> = ({ task, onClick }) => {
  const assignees = task.assignees || [];

  return (
    <div 
      onClick={onClick} 
      className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md hover:border-orange-500 cursor-pointer transition-all mb-3"
    >
      <p className="font-bold text-base text-gray-800 mb-3">{task.name}</p>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {assignees.length > 0 ? (
            <div className="flex -space-x-3 rtl:space-x-reverse">
              {assignees.slice(0, 3).map(assignee => (
                <img 
                  key={assignee.id} 
                  className="w-8 h-8 border-2 border-white rounded-full dark:border-gray-800 object-cover" 
                  src={assignee.photo} 
                  alt={assignee.name} 
                  title={assignee.name} // 툴팁으로 이름 표시
                />
              ))}
              {assignees.length > 3 && (
                <div className="flex items-center justify-center w-8 h-8 text-xs font-medium text-white bg-gray-500 border-2 border-white rounded-full hover:bg-gray-600 dark:border-gray-800">
                  +{assignees.length - 3}
                </div>
              )}
            </div>
          ) : (
            <span className="text-sm text-gray-400 italic">미지정</span>
          )}
        </div>
      </div>
    </div>
  );
};

// --- TaskBoard Component ---
const TaskBoard: React.FC = () => {
  const { kpiData } = useProjectData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<BoardTask | null>(null);

  const tasks = useMemo((): BoardTask[] => {
    return kpiData.flatMap(kpi => 
      kpi.activities.flatMap(activity => 
        activity.tasks.map(task => ({ ...task, activityId: activity.id, kpiId: kpi.id }))
      )
    );
  }, [kpiData]);

  const handleCardClick = (task: BoardTask) => {
    // Defensive Programming: 모달을 열기 전, 필수 데이터가 모두 있는지 확인합니다.
    if (!task.kpiId || !task.activityId) {
        console.error("CRITICAL: Task is missing kpiId or activityId. Cannot open modal.", task);
        alert("처리 중 오류가 발생했습니다. 이 업무의 상위 정보를 찾을 수 없어 수정할 수 없습니다. 페이지를 새로고침한 후 다시 시도해 주세요.");
        return;
    }
    setSelectedTask(task);
    setIsModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTask(null);
  };

  const handleAddNewTask = () => { /* 향후 구현 */ };

  const columns = useMemo(() => ({
    [TASK_STATUS.NOT_STARTED]: { title: '시작 전', tasks: tasks.filter(t => t.status === TASK_STATUS.NOT_STARTED), style: 'border-t-4 border-gray-400' },
    [TASK_STATUS.IN_PROGRESS]: { title: '진행 중', tasks: tasks.filter(t => t.status === TASK_STATUS.IN_PROGRESS), style: 'border-t-4 border-orange-500' },
    [TASK_STATUS.COMPLETED]: { title: '완료', tasks: tasks.filter(t => t.status === TASK_STATUS.COMPLETED), style: 'border-t-4 border-green-500' },
  }), [tasks]);

  return (
    <>
      <div className="bg-white p-6 rounded-2xl shadow-md border">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-900">업무 칸반 보드</h3>
          <button onClick={handleAddNewTask} className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition-colors">
            <Plus size={18} />
            <span>새 업무</span>
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.values(columns).map((column, index) => (
            <div key={index} className={`bg-gray-50/70 p-4 rounded-xl ${column.style}`}>
              <h4 className="font-bold text-gray-800 mb-4 tracking-tight">{column.title} <span className="text-gray-400 font-normal">({column.tasks.length})</span></h4>
              <div className="min-h-[400px] space-y-3">
                {column.tasks.length > 0 ? (
                  column.tasks.map(task => <TaskCard key={task.id} task={task} onClick={() => handleCardClick(task)} />)
                ) : (
                  <div className="flex items-center justify-center h-full pt-10 rounded-lg bg-gray-100/60">
                    <p className="text-sm text-gray-400">해당 업무가 없습니다.</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {isModalOpen && selectedTask && (
        <TaskEditModal 
          task={selectedTask}
          kpiId={selectedTask.kpiId}
          activityId={selectedTask.activityId}
          onClose={handleCloseModal}
        />
      )}
    </>
  );
};

export default TaskBoard;
