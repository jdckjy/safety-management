
import React from 'react';
import StatCard from './StatCard';
import TaskList from './TaskList';
// Fixed: Added 'Plus' to the imports from lucide-react
import { ShieldCheck, Building2, Landmark, HardHat, ChevronDown, PlusCircle, MoreHorizontal, Plus } from 'lucide-react';
import { TaskItem, StateUpdater, SummaryStats } from '../types';

interface DashboardProps {
  tasks: TaskItem[];
  onTasksUpdate: StateUpdater<TaskItem[]>;
  summaryStats: SummaryStats;
  onAddTaskOpen?: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ tasks, onTasksUpdate, summaryStats, onAddTaskOpen }) => {
  return (
    <div className="flex flex-col gap-8 pb-10">
      <div className="flex items-center justify-between">
        <h2 className="text-4xl font-bold text-gray-300">New report</h2>
        <div className="flex items-center gap-4">
           <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-full shadow-sm text-xs font-bold text-gray-500">
             <div className="w-2 h-2 bg-pink-500 rounded-full animate-pulse"></div>
             Real-time Monitoring
           </div>
        </div>
      </div>

      {/* Main KPI Card */}
      <div className="bg-white p-10 rounded-5xl shadow-sm border border-gray-50 flex flex-col md:flex-row justify-between gap-10">
        <div className="flex-1">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Total Project Value</p>
          <div className="flex items-center gap-4 mb-4">
            <h1 className="text-5xl font-black tracking-tighter text-[#1A1D1F]">${(summaryStats.asset.value * 1000).toLocaleString()}.00</h1>
            <div className="px-3 py-1 bg-pink-100 text-pink-600 rounded-full text-xs font-black flex items-center gap-1">
              ↗ 7.9%
            </div>
            <div className="px-3 py-1 bg-pink-500 text-white rounded-full text-xs font-black">
              $27,335.09
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
            <span>vs prev. ${(summaryStats.asset.value * 940).toLocaleString()}.00</span>
            <ChevronDown size={14} />
            <span className="ml-2">Jan 1 - Dec 31, 2024</span>
          </div>
          
          {/* Sub progress bars */}
          <div className="mt-10 grid grid-cols-3 gap-10">
            {[
              { label: 'Asset Value', val: summaryStats.asset.value, color: 'bg-black' },
              { label: 'Lease Rate', val: summaryStats.lease.rate, color: 'bg-blue-400' },
              { label: 'Safety Index', val: summaryStats.safety.days, color: 'bg-pink-500' }
            ].map((bar, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  <span>{bar.label}</span>
                  <span className="text-black">{bar.val}%</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full ${bar.color}`} style={{ width: `${Math.min(100, bar.val)}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="w-full md:w-80 flex flex-col gap-4">
          <div className="bg-gray-50/50 p-6 rounded-4xl border border-gray-100 flex items-center justify-between group cursor-pointer hover:bg-white transition-all">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Top asset</p>
              <h4 className="text-lg font-black leading-tight">72</h4>
              <div className="flex items-center gap-2 mt-2">
                <div className="w-5 h-5 rounded-full overflow-hidden bg-white shadow-sm">
                  <img src="https://i.pravatar.cc/100?u=Mikasa" alt="Mikasa" />
                </div>
                <span className="text-[10px] font-bold">Mikasa</span>
              </div>
            </div>
            <ChevronDown size={18} className="text-gray-300 group-hover:text-black transition-colors" />
          </div>
          <div className="bg-black p-6 rounded-4xl text-white flex items-center justify-between group cursor-pointer hover:scale-[1.02] transition-all">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Best deal</p>
              <h4 className="text-xl font-black leading-tight">$42,300</h4>
              <p className="text-[10px] font-bold text-gray-400 mt-1">Rolf Inc.</p>
            </div>
            <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-white transition-all group-hover:bg-white group-hover:text-black">
              <Plus size={18} />
            </div>
          </div>
        </div>
      </div>

      {/* Grid for more charts/tasks */}
      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-12 lg:col-span-4 bg-white p-8 rounded-5xl shadow-sm border border-gray-50">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold text-lg">Platform value</h3>
            <div className="flex gap-1">
              <button className="px-3 py-1 bg-black text-white text-[10px] font-bold rounded-full">Revenue</button>
              <button className="px-3 py-1 text-gray-400 text-[10px] font-bold">Leads</button>
            </div>
          </div>
          <div className="space-y-6">
            {[
              { name: 'Safety Mgt', val: '$227,459', pct: 43, color: 'text-pink-500' },
              { name: 'Lease & Units', val: '$142,823', pct: 27, color: 'text-blue-500' },
              { name: 'Asset Value', val: '$89,935', pct: 11, color: 'text-black' },
              { name: 'Infra Dev', val: '$37,028', pct: 7, color: 'text-gray-400' }
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between group cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center ${item.color}`}>
                    <Building2 size={16} />
                  </div>
                  <span className="text-xs font-bold text-gray-500 group-hover:text-black transition-colors">{item.name}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black tracking-tight">{item.val}</p>
                  <p className="text-[10px] font-bold text-gray-300">{item.pct}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="col-span-12 lg:col-span-8 bg-white p-8 rounded-5xl shadow-sm border border-gray-50 flex flex-col min-h-[400px]">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold text-lg">Project Task Activity</h3>
            <button 
              onClick={onAddTaskOpen}
              className="p-2 bg-gray-50 text-gray-400 rounded-full hover:bg-black hover:text-white transition-all"
            >
              <Plus size={20} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto scrollbar-hide">
             <TaskList tasks={tasks} onUpdate={onTasksUpdate} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
