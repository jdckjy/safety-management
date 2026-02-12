
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Task, WeeklyRecord, TaskStatus } from '../types';
import { parseISO, eachWeekOfInterval, getYear, getMonth, startOfMonth, getDay, getDate } from 'date-fns';
import { UI_STATUS_OPTIONS, TASK_STATUS } from '../constants';

// 새로운 두뇌: 주간 실적(records)에 따라 업무(Task)의 상태를 결정하는 핵심 로직
const deriveTaskStatus = (records: WeeklyRecord[]): TaskStatus => {
  if (!records || records.length === 0) {
    return TASK_STATUS.NOT_STARTED; // 레코드가 없으면 시작전
  }

  const hasInProgress = records.some(r => r.status === TASK_STATUS.IN_PROGRESS);
  if (hasInProgress) {
    return TASK_STATUS.IN_PROGRESS; // 하나라도 '진행중'이면 전체는 '진행중'
  }

  const allCompleted = records.every(r => r.status === TASK_STATUS.COMPLETED);
  if (allCompleted) {
    return TASK_STATUS.COMPLETED; // 모두 '완료'면 전체는 '완료'
  }

  const allNotStarted = records.every(r => r.status === TASK_STATUS.NOT_STARTED);
  if (allNotStarted) {
      return TASK_STATUS.NOT_STARTED; // 모두 '시작전'이면 전체는 '시작전'
  }
  
  // '시작전'과 '완료'가 섞여있는 경우, '진행중'으로 간주합니다.
  return TASK_STATUS.IN_PROGRESS;
};

interface TaskEditModalProps {
  task: Task | null;
  onClose: () => void;
  // onSave 콜백이 이제 업무의 새로운 상태(newStatus)도 함께 전달합니다.
  onSave: (taskId: string, updatedRecords: WeeklyRecord[], newStatus: TaskStatus) => void;
}

// TaskManager와 동일한 주차 계산 로직을 사용하여 일관성 유지
const getWeekOfMonth = (date: Date) => {
    const monthStart = startOfMonth(date);
    const firstDayOfMonth = getDay(monthStart); // 0=일요일
    const dayOfMonth = getDate(date);
    return Math.ceil((dayOfMonth + firstDayOfMonth) / 7);
}

const TaskEditModal: React.FC<TaskEditModalProps> = ({ task, onClose, onSave }) => {
  const [records, setRecords] = useState<WeeklyRecord[]>([]);

  useEffect(() => {
    if (task) {
      const startDate = parseISO(task.startDate);
      const endDate = parseISO(task.endDate);

      const weeks = eachWeekOfInterval({ start: startDate, end: endDate }, { weekStartsOn: 0 });

      const generatedRecords = weeks.map(weekStart => {
        const year = getYear(weekStart);
        const month = getMonth(weekStart) + 1;
        const week = getWeekOfMonth(weekStart);

        const existingRecord = task.records.find(r => r.year === year && r.month === month && r.week === week);
        if (existingRecord) return existingRecord;

        return {
          year,
          month,
          week,
          status: TASK_STATUS.NOT_STARTED,
        };
      });

      setRecords(generatedRecords);
    }
  }, [task]);

  if (!task) return null;

  const handleStatusChange = (weekIndex: number, newStatus: TaskStatus) => {
    const updatedRecords = [...records];
    updatedRecords[weekIndex].status = newStatus;
    setRecords(updatedRecords);
  };

  const handleSave = () => {
    // 저장 시, deriveTaskStatus 함수를 호출하여 업무의 최종 상태를 결정합니다.
    const newStatus = deriveTaskStatus(records);
    onSave(task.id, records, newStatus);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in-fast">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <div>
            <p className="text-sm text-gray-500">주간 실적 수정</p>
            <h2 className="text-2xl font-bold text-gray-800">{task.name}</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        <div className="space-y-4 mb-8 max-h-80 overflow-y-auto pr-2">
          {records.length > 0 ? records.map((record, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <p className="font-semibold text-gray-700">
                {record.year}년 {record.month}월 {record.week}주차
              </p>
              <select
                value={record.status}
                onChange={(e) => handleStatusChange(index, e.target.value as TaskStatus)}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm font-medium focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                {UI_STATUS_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}> {option.label} </option>
                ))}
              </select>
            </div>
          )) : (
            <div className="text-center py-10 text-gray-400">
              <p>실적을 기록할 주차 정보가 없습니다.</p>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-3">
          <button 
            onClick={onClose} 
            className="px-5 py-2 rounded-lg bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition-colors"
          >
            취소
          </button>
          <button 
            onClick={handleSave} 
            className="px-5 py-2 rounded-lg bg-orange-500 text-white font-semibold hover:bg-orange-600 transition-colors"
          >
            저장
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskEditModal;
