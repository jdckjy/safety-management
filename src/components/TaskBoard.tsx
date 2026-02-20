
// src/components/TaskBoard.tsx
import React, { useState, useMemo } from 'react';
import { useAppData } from '../providers/AppDataContext';
import { Task } from '../types';
import { TASK_STATUS } from '../constants';
import { Plus } from 'lucide-react';

const TaskCard: React.FC<{ task: Task }> = ({ task }) => {
  return (
    <div className="bg-white p-3 rounded-md border shadow-sm mb-3">
      <p className="font-semibold text-sm text-gray-800">{task.title}</p>
      <p className="text-xs text-gray-500 mt-1">{task.description}</p>
      {/* 추가 정보 (담당자, 기한 등)는 추후 확장 가능 */}
    </div>
  );
};

const TaskBoard: React.FC = () => {
  const { tasks, addTask, updateTask } = useAppData();

  const columns = useMemo(() => ({
    [TASK_STATUS.TODO]: {
      title: '할 일',
      tasks: tasks.filter(t => t.status === TASK_STATUS.TODO),
      style: 'border-t-4 border-gray-400',
    },
    [TASK_STATUS.IN_PROGRESS]: {
      title: '진행 중',
      tasks: tasks.filter(t => t.status === TASK_STATUS.IN_PROGRESS),
      style: 'border-t-4 border-blue-500',
    },
    [TASK_STATUS.DONE]: {
      title: '완료',
      tasks: tasks.filter(t => t.status === TASK_STATUS.DONE),
      style: 'border-t-4 border-green-500',
    },
  }), [tasks]);

  // 드래그 앤 드롭 로직은 추후 구현 (react-beautiful-dnd 등 라이브러리 활용)

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-800">업무 관리 보드</h3>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600">
          <Plus size={18} />
          <span>새 업무</span>
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Object.entries(columns).map(([status, column]) => (
          <div key={status} className={`bg-gray-50 p-4 rounded-lg ${column.style}`}>
            <h4 className="font-bold text-gray-700 mb-4">{column.title} ({column.tasks.length})</h4>
            <div className="min-h-[300px]">
              {column.tasks.length > 0 ? (
                column.tasks.map(task => <TaskCard key={task.id} task={task} />)
              ) : (
                <div className="flex items-center justify-center h-full pt-10">
                    <p className="text-sm text-gray-400">업무가 없습니다.</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaskBoard;
