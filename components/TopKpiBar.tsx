
import React from 'react';
import { ShieldAlert, CalendarClock, PieChart } from 'lucide-react';

interface TopKpiBarProps {
  safetyScore: number;
  dDayCount: number;
  preventiveRatio: number;
}

const TopKpiBar: React.FC<TopKpiBarProps> = ({ safetyScore, dDayCount, preventiveRatio }) => {
  return (
    <div className="grid grid-cols-3 gap-6">
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center justify-between group hover:border-indigo-200 transition-all">
        <div>
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">안전 지수</p>
          <p className="text-3xl font-black text-slate-800 tracking-tighter">{safetyScore}%</p>
        </div>
        <div className="bg-indigo-50 p-4 rounded-2xl group-hover:scale-110 transition-transform">
          <ShieldAlert className="w-8 h-8 text-indigo-600" />
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center justify-between group hover:border-red-200 transition-all">
        <div>
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">긴급 알림</p>
          <p className="text-3xl font-black text-red-600 tracking-tighter">{dDayCount}건</p>
        </div>
        <div className="bg-red-50 p-4 rounded-2xl group-hover:scale-110 transition-transform">
          <CalendarClock className="w-8 h-8 text-red-600" />
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center justify-between group hover:border-emerald-200 transition-all">
        <div>
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">예방 정비</p>
          <p className="text-3xl font-black text-emerald-600 tracking-tighter">{preventiveRatio}%</p>
        </div>
        <div className="bg-emerald-50 p-4 rounded-2xl group-hover:scale-110 transition-transform">
          <PieChart className="w-8 h-8 text-emerald-600" />
        </div>
      </div>
    </div>
  );
};

export default TopKpiBar;
