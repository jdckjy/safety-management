
import React from 'react';
import { ShieldAlert, CalendarClock, PieChart } from 'lucide-react';

interface TopKpiBarProps {
  safetyScore: number;
  dDayCount: number;
  preventiveRatio: number;
}

const TopKpiBar: React.FC<TopKpiBarProps> = ({ safetyScore, dDayCount, preventiveRatio }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-indigo-500 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 uppercase">현재 안전 지수</p>
          <p className="text-3xl font-bold text-slate-800">{safetyScore}%</p>
        </div>
        <div className="bg-indigo-50 p-3 rounded-full">
          <ShieldAlert className="w-8 h-8 text-indigo-600" />
        </div>
      </div>

      <div className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-red-500 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 uppercase">긴급 점검 알림</p>
          <p className="text-3xl font-bold text-red-600">{dDayCount}건</p>
        </div>
        <div className="bg-red-50 p-3 rounded-full">
          <CalendarClock className="w-8 h-8 text-red-600" />
        </div>
      </div>

      <div className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-emerald-500 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 uppercase">예방 정비 비율</p>
          <p className="text-3xl font-bold text-emerald-600">{preventiveRatio}%</p>
        </div>
        <div className="bg-emerald-50 p-3 rounded-full">
          <PieChart className="w-8 h-8 text-emerald-600" />
        </div>
      </div>
    </div>
  );
};

export default TopKpiBar;
