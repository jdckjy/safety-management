
import React from 'react';
import { X, Clipboard } from 'lucide-react';
import { useAppData } from '../providers/AppDataContext';
import { useWeeklyReport } from '../hooks/useWeeklyReport';

interface WeeklyReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const WeeklyReportModal: React.FC<WeeklyReportModalProps> = ({ isOpen, onClose }) => {
  const { safetyKPIs, leaseKPIs, assetKPIs, infraKPIs, viewDate } = useAppData();
  const { reportContent, handleCopy, year, weekNumber } = useWeeklyReport(
    { safetyKPIs, leaseKPIs, assetKPIs, infraKPIs }, 
    viewDate
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <header className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold">주간 업무 보고서 ({year}년 {weekNumber}주차)</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">
            <X size={24} />
          </button>
        </header>
        <main className="p-6 flex-1 overflow-y-auto">
          <textarea
            readOnly
            value={reportContent}
            className="w-full h-full p-4 bg-gray-50 border rounded-lg resize-none text-sm font-mono"
            rows={20}
          />
        </main>
        <footer className="p-6 border-t flex justify-end">
          <button 
            onClick={handleCopy}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Clipboard size={18} />
            내용 복사
          </button>
        </footer>
      </div>
    </div>
  );
};

export default WeeklyReportModal;
