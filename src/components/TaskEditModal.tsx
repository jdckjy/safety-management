
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Task, WeeklyRecord, TaskStatus } from '../types';
import { parseISO, eachWeekOfInterval, getYear, getMonth, startOfMonth, getDay, getDate } from 'date-fns';

interface TaskEditModalProps {
  task: Task | null;
  onClose: () => void;
  onSave: (taskId: string, updatedRecords: WeeklyRecord[]) => void;
}

// TaskManager와 동일한 주차 계산 로직을 사용하여 일관성 유지
const getWeekOfMonth = (date: Date) => {
    const monthStart = startOfMonth(date);
    const firstDayOfMonth = getDay(monthStart); // 0=일요일
    const dayOfMonth = getDate(date);
    return Math.ceil((dayOfMonth + firstDayOfMonth) / 7);
}

const statusOptions: { value: TaskStatus; label: string }[] = [
  { value: 'not-started', label: '시작전' },
  { value: 'in-progress', label: '진행중' },
  { value: 'pending', label: '대기' },
  { value: 'completed', label: '완료' },
  { value: 'deferred', label: '보류' },
];

const TaskEditModal: React.FC<TaskEditModalProps> = ({ task, onClose, onSave }) => {
  const [records, setRecords] = useState<WeeklyRecord[]>([]);

  useEffect(() => {
    if (task) {
      const startDate = parseISO(task.startDate);
      const endDate = parseISO(task.endDate);

      // Task의 시작일부터 종료일까지 매주에 대한 레코드를 생성/업데이트합니다.
      const weeks = eachWeekOfInterval({ start: startDate, end: endDate }, { weekStartsOn: 0 });

      const generatedRecords = weeks.map(weekStart => {
        const year = getYear(weekStart);
        const month = getMonth(weekStart) + 1;
        const week = getWeekOfMonth(weekStart);

        // 기존에 저장된 레코드가 있는지 확인
        const existingRecord = task.records.find(r => r.year === year && r.month === month && r.week === week);

        if (existingRecord) {
          return existingRecord; // 있으면 기존 레코드 사용
        }

        // 없으면 새로운 기본 레코드 생성
        return {
          year,
          month,
          week,
          status: 'not-started' as TaskStatus,
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
    onSave(task.id, records);
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
                {statusOptions.map(option => (
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
