
import React from 'react';
import { Facility } from '../types';
import { AlertTriangle, Clock, ChevronRight, User, MapPin, Tag, Calendar, Building2 } from 'lucide-react';

interface StatutoryAlertListProps {
  facilities: Facility[];
  onAction: (facility: Facility) => void;
  fullWidth?: boolean;
}

const StatutoryAlertList: React.FC<StatutoryAlertListProps> = ({ facilities, onAction, fullWidth = false }) => {
  const getDDay = (dateStr: string) => {
    const today = new Date();
    const target = new Date(dateStr);
    const diffTime = target.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getBadgeStyle = (dDay: number) => {
    if (dDay < 0) return "bg-black text-white ring-0"; 
    if (dDay <= 7) return "bg-red-600 text-white animate-pulse ring-4 ring-red-600/20"; 
    if (dDay <= 30) return "bg-amber-500 text-white ring-4 ring-amber-500/20"; 
    return "bg-emerald-500 text-white ring-4 ring-emerald-500/20"; 
  };

  const sortedFacilities = [...facilities].sort((a, b) => 
    new Date(a.nextInspectionDate).getTime() - new Date(b.nextInspectionDate).getTime()
  );

  if (fullWidth) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedFacilities.map((facility) => {
          const dDay = getDDay(facility.nextInspectionDate);
          const isCritical = dDay <= 7;
          const isOverdue = dDay < 0;

          return (
            <div 
              key={facility.id} 
              className={`bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all p-8 flex flex-col justify-between group ${isCritical || isOverdue ? 'ring-2 ring-red-500/10 bg-red-50/10' : ''}`}
            >
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${getBadgeStyle(dDay)}`}>
                    {isOverdue ? `경과 ${Math.abs(dDay)}일` : dDay === 0 ? '당일 검사' : `D-${dDay}`}
                  </div>
                  <Tag className="w-5 h-5 text-slate-300" />
                </div>

                <div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight mb-2 group-hover:text-indigo-600 transition-colors">{facility.name}</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2.5 text-slate-500">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      <span className="text-xs font-bold">{facility.area}</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-slate-500">
                      <Tag className="w-4 h-4 text-indigo-400" />
                      <span className="text-xs font-black text-indigo-600 uppercase">{facility.category}</span>
                    </div>
                    {facility.manager && (
                      <div className="flex items-center gap-2.5 text-slate-500">
                        <User className="w-4 h-4 text-slate-400" />
                        <span className="text-xs font-bold">담당: {facility.manager}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-50">
                  <div className="flex items-center justify-between text-slate-400">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span className="text-[11px] font-bold">차기 검사 예정일</span>
                    </div>
                    <span className="text-sm font-black text-slate-700">{facility.nextInspectionDate}</span>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => onAction(facility)}
                className={`mt-8 w-full py-4 px-6 text-sm font-black rounded-2xl transition-all flex items-center justify-center gap-3 ${isCritical || isOverdue ? 'bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-100' : 'bg-slate-900 text-white hover:bg-black shadow-lg shadow-slate-100'}`}
              >
                <AlertTriangle className="w-4 h-4" />
                완료 보고서 작성
                <ChevronRight className="w-4 h-4 ml-auto" />
              </button>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
      <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
        <h2 className="font-black text-slate-800 flex items-center gap-2 tracking-tight">
          <Building2 className="w-5 h-5 text-indigo-500" />
          의료서비스센터 시설 관리 현황
        </h2>
        <span className="text-[10px] bg-indigo-100 px-2.5 py-1 rounded-full text-indigo-700 font-black uppercase tracking-tight">
          {facilities.length}개 자산
        </span>
      </div>
      
      <div className="overflow-y-auto flex-1">
        <ul className="divide-y divide-slate-50">
          {sortedFacilities.map((facility) => {
            const dDay = getDDay(facility.nextInspectionDate);
            const isCritical = dDay <= 7;
            const isOverdue = dDay < 0;

            return (
              <li key={facility.id} className={`p-5 transition-all relative ${isCritical || isOverdue ? 'bg-red-50/30' : 'hover:bg-slate-50'}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <p className="font-black text-slate-900 truncate leading-tight tracking-tight">{facility.name}</p>
                      {isOverdue && (
                        <span className="text-[9px] bg-black text-white px-1.5 py-0.5 rounded font-black uppercase tracking-tighter">
                          기한 만료
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col gap-1">
                      <p className="text-xs text-slate-500 font-bold">{facility.area} • <span className="text-indigo-600">{facility.category}</span></p>
                    </div>
                  </div>
                  
                  <div className="text-right shrink-0">
                    <div className={`inline-block px-2.5 py-1 rounded-lg text-[11px] font-black shadow-sm ${getBadgeStyle(dDay)}`}>
                      {isOverdue ? `경과 ${Math.abs(dDay)}일` : dDay === 0 ? '당일' : `D-${dDay}`}
                    </div>
                  </div>
                </div>
                
                <button 
                  onClick={() => onAction(facility)}
                  className={`mt-4 w-full py-2.5 px-3 border border-slate-200 text-[11px] font-black rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-sm ${isCritical || isOverdue ? 'bg-red-600 text-white border-transparent hover:bg-red-700' : 'bg-white text-slate-700 hover:bg-slate-50'}`}
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  점검 완료 처리
                  <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-50" />
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default StatutoryAlertList;
