
import React from 'react';
import { useDailyBriefing } from '../hooks/useDailyBriefing';
import Modal from './ui/Modal';
import { Badge } from './ui/badge';
import { AlertCircle, Calendar, MessageSquare, TrendingDown, X } from 'lucide-react';

interface DailyBriefingProps {
  isOpen: boolean;
  onClose: () => void;
}

const DailyBriefing: React.FC<DailyBriefingProps> = ({ isOpen, onClose }) => {
  const { tasksDueToday, importantUpdates, kpisNeedingAttention } = useDailyBriefing();

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl">
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="p-8 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
          <div className="flex items-center">
            <AlertCircle className="mr-4 h-8 w-8 text-blue-500" />
            <div>
              <h2 className="text-2xl font-bold text-gray-800">오늘의 브리핑</h2>
              <p className="text-sm text-gray-500">오늘의 주요 업무와 업데이트를 확인하세요.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 transition-colors">
            <X className="h-6 w-6 text-gray-500" />
          </button>
        </div>

        <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto">
          <BriefingSection
            icon={<Calendar className="text-red-500" />}
            title="오늘 마감 업무"
            count={tasksDueToday.length}
          >
            {tasksDueToday.length > 0 ? (
              <ul className="space-y-2 text-gray-700">
                {tasksDueToday.map(task => (
                  <li key={task.id} className="flex items-center">
                    <span className="font-semibold">{task.name}</span>
                    <div className="ml-auto flex -space-x-2 overflow-hidden">
                      {task.assignees && task.assignees.length > 0 ? (
                        task.assignees.map(a => <img key={a.id} className="inline-block h-6 w-6 rounded-full ring-2 ring-white" src={a.photo} alt={a.name} />)
                      ) : (
                        <Badge variant="outline">미지정</Badge>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 italic">오늘 마감되는 업무가 없습니다. 여유로운 하루를 시작하세요!</p>
            )}
          </BriefingSection>

          <BriefingSection
            icon={<MessageSquare className="text-yellow-500" />}
            title="주요 업데이트"
            count={importantUpdates.length}
          >
            {importantUpdates.length > 0 ? (
              <ul className="space-y-3 text-gray-700">
                {importantUpdates.map(update => (
                  <li key={update.id} className="p-2 rounded-md hover:bg-gray-100 transition-colors">
                    <span className="font-semibold text-gray-500">[{update.parentKpiTitle}]</span> {update.name}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 italic">어제자 주요 업데이트가 없습니다.</p>
            )}
          </BriefingSection>

          <BriefingSection
            icon={<TrendingDown className="text-purple-500" />}
            title="관리가 필요한 KPI"
            count={kpisNeedingAttention.length}
          >
            {kpisNeedingAttention.length > 0 ? (
              <div className="flex flex-wrap gap-3">
                {kpisNeedingAttention.map(kpi => (
                  <Badge key={kpi.id} variant="secondary" className="text-lg py-1 px-3">
                    {kpi.title}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic">모든 KPI가 정상 범위에 있습니다. 훌륭합니다!</p>
            )}
          </BriefingSection>
        </div>

        <div className="p-6 bg-gray-50 border-t border-gray-200 text-right">
            <button 
                onClick={onClose} 
                className="bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-all shadow-md hover:shadow-lg"
            >
                확인하고 시작하기
            </button>
        </div>
      </div>
    </Modal>
  );
};


interface BriefingSectionProps {
  icon: React.ReactNode;
  title: string;
  count?: number;
  children: React.ReactNode;
}

const BriefingSection: React.FC<BriefingSectionProps> = ({ icon, title, count, children }) => (
  <div>
    <div className="flex items-center mb-4">
      <div className="w-8 h-8 flex items-center justify-center mr-3">{icon}</div>
      <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
      {count !== undefined && <Badge variant="default" className="ml-3">{count}</Badge>}
    </div>
    <div className="pl-11 border-l-2 border-gray-100 ml-4">
        <div className="pl-8 pb-4">
            {children}
        </div>
    </div>
  </div>
);

export default DailyBriefing;
