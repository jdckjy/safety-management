
import React from 'react';
import Modal from './ui/Modal';
import { X, Loader } from 'lucide-react';
import { useDailyBriefing } from '../hooks/useDailyBriefing';

interface DailyBriefingProps {
  isOpen: boolean;
  onClose: () => void;
}

const DailyBriefing: React.FC<DailyBriefingProps> = ({ isOpen, onClose }) => {
  const { urgentIssues, dueToday, delayedTasks, isLoading } = useDailyBriefing();

  if (!isOpen) return null;

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-full">
          <Loader className="w-10 h-10 text-gray-400 animate-spin" />
          <p className="ml-4 text-gray-600">데이터를 불러오는 중입니다...</p>
        </div>
      );
    }

    return (
      <>
        <div className="space-y-6 overflow-y-auto flex-grow">
          {/* Section 1: Urgent Issues */}
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <h3 className="text-xl font-semibold text-red-600 mb-3">🚨 신규 발생 및 시급한 이슈</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              {urgentIssues.length > 0 ? (
                urgentIssues.map(item => <li key={item.id}>{item.text}</li>)
              ) : (
                <li className="text-gray-500">새로운 긴급 이슈가 없습니다.</li>
              )}
            </ul>
          </div>

          {/* Section 2: Today's Deadlines */}
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <h3 className="text-xl font-semibold text-blue-600 mb-3">🗓️ 오늘 마감 업무</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              {dueToday.length > 0 ? (
                dueToday.map(item => <li key={item.id}>{item.text}</li>)
              ) : (
                <li className="text-gray-500">오늘 마감 업무가 없습니다.</li>
              )}
            </ul>
          </div>

          {/* Section 3: Delayed Tasks */}
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <h3 className="text-xl font-semibold text-yellow-600 mb-3">⏳ 지연 중인 업무</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              {delayedTasks.length > 0 ? (
                delayedTasks.map(item => <li key={item.id}>{item.text}</li>)
              ) : (
                <li className="text-gray-500">지연 중인 업무가 없습니다.</li>
              )}
            </ul>
          </div>
        </div>
        <div className="mt-6 text-center">
            <button
                onClick={onClose}
                className="bg-gray-800 text-white font-bold py-3 px-8 rounded-full hover:bg-gray-900 transition-all shadow-md"
            >
                확인했습니다
            </button>
        </div>
      </>
    );
  };

  return (
    <Modal onClose={onClose} size="lg">
      <div className="p-8 flex flex-col h-[80vh] bg-gray-50">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">일일 브리핑 (Daily Briefing)</h2>
            <p className="text-gray-500">오늘의 주요 사항을 빠르게 확인하세요.</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 transition-colors">
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>
        {renderContent()}
      </div>
    </Modal>
  );
};

export default DailyBriefing;
