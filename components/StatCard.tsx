
import React from 'react';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  max?: string;
  change: number;
  isPositive: boolean;
  bgColor: string;
  desc?: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, max, change, isPositive, bgColor, desc }) => {
  return (
    <div className="bg-white p-6 rounded-4xl shadow-sm border border-gray-50 flex flex-col justify-between group hover:shadow-md transition-all cursor-pointer min-h-[140px]">
      <div className="flex justify-between items-start">
        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{label}</p>
        <div className={`w-8 h-8 ${bgColor} rounded-full flex items-center justify-center text-black`}>
          {icon}
        </div>
      </div>
      
      <div className="mt-4">
        <div className="flex items-baseline gap-1">
          <h4 className="text-2xl font-black text-[#1A1D1F] tracking-tight">{value}</h4>
          {max && <span className="text-sm font-bold text-gray-400">{max}</span>}
        </div>
        
        <div className="flex items-center gap-2 mt-2">
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
            isPositive ? 'bg-pink-100 text-pink-600' : 'bg-blue-100 text-blue-600'
          }`}>
            {isPositive ? '↗' : '↘'} {Math.abs(change)}%
          </span>
          <span className="text-[10px] text-gray-300 font-bold truncate">{desc}</span>
        </div>
      </div>
    </div>
  );
};

export default StatCard;
