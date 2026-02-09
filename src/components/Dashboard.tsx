
import React from 'react';
import { Building2, ArrowUpRight, TrendingUp, Shield, Handshake, DollarSign, DraftingCompass } from 'lucide-react';
import { useUnifiedData } from '../contexts/UnifiedDataContext';
import { KPI } from '../types';

const ProjectStatCard: React.FC<{
  title: string;
  value: string;
  status: string;
  isPrimary?: boolean;
}> = ({ title, value, status, isPrimary = false }) => {
  const cardClasses = isPrimary ? 'bg-teal-800 text-white' : 'bg-white text-gray-800 border border-gray-100';
  const statusIconColor = isPrimary ? 'text-teal-300' : 'text-gray-400';

  return (
    <div className={`p-6 rounded-3xl shadow-sm flex flex-col justify-between h-full ${cardClasses}`}>
      <div>
        <div className="flex justify-between items-start">
          <p className={`font-bold ${isPrimary ? 'text-teal-200' : 'text-gray-600'}`}>{title}</p>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isPrimary ? 'bg-white/10' : 'bg-gray-100'}`}>
            <ArrowUpRight size={16} className={`${isPrimary ? 'text-white' : 'text-gray-500'}`} />
          </div>
        </div>
        <h3 className="text-5xl font-black tracking-tighter mt-4">{value}</h3>
      </div>
      <div className="flex items-center gap-2 text-xs mt-6">
        <TrendingUp size={14} className={statusIconColor} />
        <span className={statusIconColor}>{status}</span>
      </div>
    </div>
  );
};

const Dashboard: React.FC = () => {
  const { 
    selectedMonth, 
    totalMonthlyPlans,
    safetyKPIs,
    leaseKPIs,
    assetKPIs,
    infraKPIs,
  } = useUnifiedData();
  
  const selectedMonthName = new Date(0, selectedMonth).toLocaleString('ko-KR', { month: 'long' });

  const projectStats = [
    { title: `${selectedMonthName} 수행업무`, value: totalMonthlyPlans.toString(), status: 'Updated in real-time', isPrimary: true },
    { title: 'Ended Projects', value: '10', status: 'Increased from last month' },
    { title: 'Running Projects', value: '12', status: 'Increased from last month' },
    { title: 'Pending Project', value: '2', status: 'On Discuss' },
  ];

  const allKpis = [
    ...(safetyKPIs || []).map(k => ({ ...k, type: '안전 관리', icon: <Shield size={16}/>, color: 'text-pink-500' })),
    ...(leaseKPIs || []).map(k => ({ ...k, type: '임대 및 세대', icon: <Handshake size={16}/>, color: 'text-black' })),
    ...(assetKPIs || []).map(k => ({ ...k, type: '자산 가치', icon: <DollarSign size={16}/>, color: 'text-blue-500' })),
    ...(infraKPIs || []).map(k => ({ ...k, type: '인프라 개발', icon: <DraftingCompass size={16}/>, color: 'text-gray-400' })),
  ];

  return (
    <div className="flex flex-col gap-8 pb-10">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {projectStats.map(stat => (
          <ProjectStatCard key={stat.title} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-12 lg:col-span-4 bg-white p-8 rounded-5xl shadow-sm border border-gray-50">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold text-lg">플랫폼 가치</h3>
            <div className="flex gap-1">
              <button className="px-3 py-1 bg-black text-white text-[10px] font-bold rounded-full">수익</button>
              <button className="px-3 py-1 text-gray-400 text-[10px] font-bold">리드</button>
            </div>
          </div>
          <div className="space-y-6">
            {allKpis.length > 0 ? (
              allKpis.slice(0, 4).map((kpi) => {
                if (!kpi) return null; // Add a null check for kpi object
                const pulse = kpi.pulse || { value: 0, trend: 'stable' };
                const isPositive = pulse.trend === 'up';
                const change = Math.abs(pulse.value);

                return (
                  <div key={kpi.id} className="flex items-center justify-between group cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center ${kpi.color}`}>
                        {kpi.icon}
                      </div>
                      <span className="text-xs font-bold text-gray-500 group-hover:text-black transition-colors">{kpi.name}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black tracking-tight">{`${kpi.current}${kpi.unit}`}</p>
                      <div className={`flex items-center justify-end gap-1 text-[10px] font-bold ${isPositive ? 'text-pink-500' : 'text-blue-500'}`}>
                        {isPositive ? '↗' : '↘'}
                        <span>{change}%</span>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center text-gray-400 font-bold">KPI 데이터가 없습니다.</div>
            )}
          </div>
        </div>

        <div className="col-span-12 lg:col-span-8 bg-white p-8 rounded-5xl shadow-sm border border-gray-50 flex flex-col min-h-[400px]">
           <div className="flex-1 flex items-center justify-center">
             <p className="text-gray-400 font-bold">선택된 월의 상세 작업 내용은 각 KPI 섹션에서 확인해주세요.</p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
