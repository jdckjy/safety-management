
import React, { useState, useRef, useEffect } from 'react';
import { Activity } from '../types';
import { FileText, Edit, Trash2, Check, X } from 'lucide-react';
import { useProjectData } from '../providers/ProjectDataProvider';
import { TASK_STATUS } from '../constants'; // TASK_STATUS를 import합니다.

interface ActivityItemProps {
  kpiId: string;
  activity: Activity;
  onSelect: (activityId: string) => void;
}

// 이제 TASK_STATUS.COMPLETED를 사용하여 정확한 타입 비교를 수행합니다.
const calculateProgress = (activity: Activity) => {
  if (!activity.tasks || activity.tasks.length === 0) return 0;
  const completedTasks = activity.tasks.filter(t => t.status === TASK_STATUS.COMPLETED).length;
  return (completedTasks / activity.tasks.length) * 100;
};

export const ActivityItem: React.FC<ActivityItemProps> = ({ kpiId, activity, onSelect }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(activity.name);
  const editInputRef = useRef<HTMLInputElement>(null);

  const { updateActivityInKpi, deleteActivityFromKpi } = useProjectData();

  useEffect(() => {
    if (isEditing && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [isEditing]);

  const handleUpdate = () => {
    if (name.trim() && name.trim() !== activity.name) {
      updateActivityInKpi(kpiId, { ...activity, name: name.trim() });
    }
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (window.confirm('이 활동과 모든 하위 업무를 정말 삭제하시겠습니까?')) {
      deleteActivityFromKpi(kpiId, activity.id);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleUpdate();
    if (e.key === 'Escape') {
        setName(activity.name);
        setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <div className="bg-white p-3 rounded-lg border border-orange-400 shadow-md flex items-center gap-2">
        <input
          ref={editInputRef}
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleUpdate}
          className="flex-grow bg-transparent focus:outline-none font-semibold text-gray-800"
        />
        <button onClick={handleUpdate} className="p-1 text-gray-500 hover:text-green-600"><Check size={16} /></button>
        <button onClick={() => setIsEditing(false)} className="p-1 text-gray-500 hover:text-red-600"><X size={16} /></button>
      </div>
    );
  }

  const progress = calculateProgress(activity);

  return (
    <div className="bg-white p-3 rounded-lg border border-gray-200/90 group transition-all shadow-sm relative">
      <div className="flex justify-between items-center">
        <div onClick={() => onSelect(activity.id)} className="flex items-center gap-3 cursor-pointer w-full pr-10">
          <FileText size={18} className="text-gray-400" />
          <p className="font-semibold text-gray-800 truncate">{activity.name}</p>
        </div>
        <div className="w-24 flex-shrink-0">
          <div className="w-full bg-gray-200/70 rounded-full h-1.5">
            <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${progress}%` }}></div>
          </div>
        </div>
      </div>
      <div className="absolute top-1/2 right-3 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={() => setIsEditing(true)} className="p-1.5 rounded-full hover:bg-gray-200/70 text-gray-500 hover:text-blue-600">
          <Edit size={14} />
        </button>
        <button onClick={handleDelete} className="p-1.5 rounded-full hover:bg-gray-200/70 text-gray-500 hover:text-red-600">
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
};
