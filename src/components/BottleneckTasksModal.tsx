
import React from 'react';
import { Task } from '../types';
import Modal from './ui/Modal';
import { Badge } from './ui/badge';
import { AlertTriangle, X } from 'lucide-react';

interface BottleneckTasksModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
}

const BottleneckTasksModal: React.FC<BottleneckTasksModalProps> = ({ isOpen, onClose, tasks }) => {
  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <div className="bg-white rounded-lg shadow-xl">
        {/* 헤더 */}
        <div className="p-6 bg-red-50 border-b border-red-200 flex justify-between items-center">
          <div className="flex items-center">
            <AlertTriangle className="h-7 w-7 text-red-600 mr-3" />
            <h2 className="text-xl font-bold text-red-800">주의가 필요한 업무 목록</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-red-100 transition-colors">
            <X className="h-6 w-6 text-red-500" />
          </button>
        </div>

        {/* 내용 */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {tasks.length > 0 ? (
            <div className="space-y-4">
              {tasks.map(task => (
                <div key={task.id} className="flex justify-between items-center bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                  <div>
                    <p className="font-semibold text-gray-800">{task.name}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      마감일: {task.endDate} / 상태: <Badge variant="destructive">{task.status}</Badge>
                    </p>
                  </div>
                  <div className="flex -space-x-2 overflow-hidden ml-4">
                    {task.assignees?.map(a => (
                      <img key={a.id} className="inline-block h-9 w-9 rounded-full ring-2 ring-white" src={a.photo} alt={a.name} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">감지된 병목 업무가 없습니다.</p>
          )}
        </div>

         {/* 푸터 */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 text-right">
            <button 
                onClick={onClose} 
                className="bg-gray-600 text-white font-bold py-2 px-5 rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-4 focus:ring-gray-300 transition-all"
            >
                닫기
            </button>
        </div>
      </div>
    </Modal>
  );
};

export default BottleneckTasksModal;
