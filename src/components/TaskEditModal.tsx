
import React, { useState, useEffect } from 'react';
import { X, User, CheckSquare, Square } from 'lucide-react';
import { Task, WeeklyRecord, TaskStatus, TeamMember } from '../types';
import { parseISO, eachWeekOfInterval, getYear, getMonth, startOfMonth, getDay, getDate } from 'date-fns';
import { UI_STATUS_OPTIONS, TASK_STATUS } from '../constants';
import { useProjectData } from '../providers/ProjectDataProvider';

// --- Helper Functions ---
const deriveTaskStatus = (records: WeeklyRecord[]): TaskStatus => {
  if (!records || records.length === 0) return TASK_STATUS.NOT_STARTED;
  if (records.some(r => r.status === TASK_STATUS.IN_PROGRESS)) return TASK_STATUS.IN_PROGRESS;
  if (records.every(r => r.status === TASK_STATUS.COMPLETED)) return TASK_STATUS.COMPLETED;
  return TASK_STATUS.NOT_STARTED;
};

const getWeekOfMonth = (date: Date) => {
    const dayOfMonth = getDate(date);
    const firstDayOfWeek = getDay(startOfMonth(date));
    return Math.ceil((dayOfMonth + firstDayOfWeek) / 7);
};

// --- Component Props Interface ---
interface TaskEditModalProps {
  task: Task | null;
  kpiId: string; // 명시적으로 kpiId와 activityId를 받습니다.
  activityId: string;
  onClose: () => void;
}

// --- Main Component ---
const TaskEditModal: React.FC<TaskEditModalProps> = ({ task, kpiId, activityId, onClose }) => {
  const { teamMembers, updateTask } = useProjectData();
  
  // --- State ---
  const [records, setRecords] = useState<WeeklyRecord[]>([]);
  const [selectedAssigneeIds, setSelectedAssigneeIds] = useState<string[]>([]);

  // --- Effects ---
  useEffect(() => {
    if (task) {
      // 담당자 ID 배열 설정
      setSelectedAssigneeIds(task.assignees?.map(a => a.id) || []);

      // 주간 실적 레코드 설정
      const startDate = parseISO(task.startDate);
      const endDate = parseISO(task.endDate);
      const weeks = eachWeekOfInterval({ start: startDate, end: endDate }, { weekStartsOn: 0 });
      const generatedRecords = weeks.map(weekStart => {
        const year = getYear(weekStart);
        const month = getMonth(weekStart) + 1;
        const week = getWeekOfMonth(weekStart);
        const existingRecord = task.records.find(r => r.year === year && r.month === month && r.week === week);
        return existingRecord || { year, month, week, status: TASK_STATUS.NOT_STARTED };
      });
      setRecords(generatedRecords);
    }
  }, [task]);

  if (!task) return null;

  // --- Event Handlers ---
  const handleStatusChange = (weekIndex: number, newStatus: TaskStatus) => {
    const updatedRecords = [...records];
    updatedRecords[weekIndex].status = newStatus;
    setRecords(updatedRecords);
  };

  const handleAssigneeChange = (memberId: string) => {
    setSelectedAssigneeIds(prevIds =>
      prevIds.includes(memberId)
        ? prevIds.filter(id => id !== memberId) // Deselect
        : [...prevIds, memberId] // Select
    );
  };

  const handleSave = () => {
    // Prop으로 받은 kpiId와 activityId를 사용합니다.
    if (!kpiId || !activityId) {
        console.error("FATAL: kpiId or activityId is missing in props!");
        return;
    }

    const newStatus = deriveTaskStatus(records);
    const selectedAssignees = teamMembers.filter(m => selectedAssigneeIds.includes(m.id));

    const updatedTaskData: Task = {
      ...task,
      status: newStatus,
      records: records,
      assignees: selectedAssignees, // 업데이트된 담당자 배열 저장
    };

    updateTask(kpiId, activityId, updatedTaskData);
    onClose();
  };

  // --- Render ---
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in-fast">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-2xl">
        <div className="flex justify-between items-center mb-6">
          <div>
            <p className="text-sm text-gray-500">업무 수정</p>
            <h2 className="text-2xl font-bold text-gray-800">{task.name}</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-8">
          {/* Left Column: Assignees */}
          <div>
            <h3 className="flex items-center gap-2 text-md font-semibold text-gray-700 mb-3">
              <User size={18} />
              담당자 (다중 선택 가능)
            </h3>
            <div className="space-y-2 max-h-60 overflow-y-auto p-3 bg-gray-50 rounded-lg border custom-scrollbar">
              {teamMembers.map(member => (
                <label key={member.id} className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-200 cursor-pointer">
                  <input
                    type="checkbox"
                    className="hidden"
                    checked={selectedAssigneeIds.includes(member.id)}
                    onChange={() => handleAssigneeChange(member.id)}
                  />
                  {selectedAssigneeIds.includes(member.id) 
                    ? <CheckSquare size={20} className="text-orange-500" /> 
                    : <Square size={20} className="text-gray-300" />}
                  <img src={member.photo} alt={member.name} className="w-8 h-8 rounded-full object-cover" />
                  <div>
                      <p className="font-semibold text-sm text-gray-800">{member.name}</p>
                      <p className="text-xs text-gray-500">{member.position}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Right Column: Weekly Records */}
          <div>
            <h3 className="text-md font-semibold text-gray-700 mb-3">주간 실적</h3>
            <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
              {records.length > 0 ? records.map((record, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <p className="font-semibold text-gray-600 text-sm">
                    {record.year}년 {record.month}월 {record.week}주차
                  </p>
                  <select
                    value={record.status}
                    onChange={(e) => handleStatusChange(index, e.target.value as TaskStatus)}
                    className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
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
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-8">
          <button onClick={onClose} className="px-5 py-2 rounded-lg bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition-colors">취소</button>
          <button onClick={handleSave} className="px-5 py-2 rounded-lg bg-orange-500 text-white font-semibold hover:bg-orange-600 transition-colors">저장</button>
        </div>
      </div>
    </div>
  );
};

export default TaskEditModal;
