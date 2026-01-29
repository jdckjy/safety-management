
import React from 'react';
import { InspectionItem } from '../types';
import { Edit2, Trash2, ClipboardCheck, CalendarRange, Clock, AlertCircle, ShieldCheck, Zap, Layers } from 'lucide-react';

interface InspectionItemTableProps {
  items: InspectionItem[];
  onEdit: (item: InspectionItem) => void;
  onDelete: (id: string) => void;
}

const InspectionItemTable: React.FC<InspectionItemTableProps> = ({ items, onEdit, onDelete }) => {
  // 그룹별 분류
  const regularItems = items.filter(i => i.classification === '정기점검');
  const legalItems = items.filter(i => i.classification === '법정검사');
  const urgentItems = items.filter(i => i.classification === '긴급점검');
  const specialItems = items.filter(i => i.classification === '특별점검');

  const getBadgeStyle = (classification: InspectionItem['classification']) => {
    switch(classification) {
      case '정기점검': return 'bg-indigo-100 text-indigo-700';
      case '법정검사': return 'bg-violet-100 text-violet-700';
      case '긴급점검': return 'bg-rose-100 text-rose-700';
      case '특별점검': return 'bg-amber-100 text-amber-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getCategoryIcon = (classification: InspectionItem['classification']) => {
    switch(classification) {
      case '정기점검': return <Layers className="w-4 h-4" />;
      case '법정검사': return <ShieldCheck className="w-4 h-4" />;
      case '긴급점검': return <Zap className="w-4 h-4" />;
      case '특별점검': return <AlertCircle className="w-4 h-4" />;
      default: return <ClipboardCheck className="w-4 h-4" />;
    }
  };

  const renderRows = (itemsToRender: InspectionItem[]) => {
    if (itemsToRender.length === 0) return null;

    return itemsToRender.map((item, idx) => (
      <tr key={item.id} className="hover:bg-slate-50 transition-colors group">
        {idx === 0 && (
          <td 
            rowSpan={itemsToRender.length} 
            className="px-6 py-4 bg-slate-50/50 border-r border-slate-100 align-middle text-center"
          >
            <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap shadow-sm ${getBadgeStyle(item.classification)}`}>
              {item.classification}
            </span>
          </td>
        ) }
        <td className="px-6 py-4">
          <div className="flex items-center gap-3">
            <div className={`p-1.5 rounded-lg shadow-sm ${getBadgeStyle(item.classification)}`}>
              {getCategoryIcon(item.classification)}
            </div>
            <p className="text-sm font-black text-slate-800 tracking-tight">{item.target}</p>
          </div>
        </td>
        <td className="px-6 py-4">
          <div className="flex items-center gap-2 text-slate-500">
            <Clock className="w-4 h-4 text-slate-300" />
            <span className="text-xs font-bold">{item.cycle}</span>
          </div>
        </td>
        <td className="px-6 py-4">
          <p className="text-xs text-slate-400 font-medium italic">{item.remarks || '-'}</p>
        </td>
        <td className="px-6 py-4 text-right">
          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              onClick={() => onEdit(item)}
              className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button 
              onClick={() => onDelete(item.id)}
              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </td>
      </tr>
    ));
  };

  return (
    <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden mt-6">
      <div className="p-6 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-slate-900 rounded-xl shadow-lg">
            <CalendarRange className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900 tracking-tight leading-none">시설물 점검 계획 마스터</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1.5">Intelligent Facility Maintenance Protocol v2.0</p>
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/30">
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-center w-32">분류 구분</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">점검 대상 (설비 및 시설명)</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 w-40">점검 주기</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">비고 및 준수사항</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right w-24">작업</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {renderRows(regularItems)}
            {renderRows(legalItems)}
            {renderRows(urgentItems)}
            {renderRows(specialItems)}
          </tbody>
        </table>
        {items.length === 0 && (
          <div className="py-20 flex flex-col items-center justify-center text-slate-300">
            <CalendarRange className="w-16 h-16 stroke-[1] mb-4 opacity-20" />
            <p className="font-black uppercase tracking-[0.2em] text-[10px]">등록된 점검 데이터가 존재하지 않습니다</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InspectionItemTable;
