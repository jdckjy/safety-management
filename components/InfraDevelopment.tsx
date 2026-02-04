
import React from 'react';
import { HardHat, Compass, Layers, TrendingUp, ChevronDown } from 'lucide-react';
import KPIManager from './KPIManager';
import { KPI, StateUpdater } from '../types';

interface InfraDevelopmentProps {
  kpis: KPI[];
  onUpdate: StateUpdater<KPI[]>;
  mainValue: { progress: number; change: number };
}

const InfraDevelopment: React.FC<InfraDevelopmentProps> = ({ kpis, onUpdate, mainValue }) => {
  return (
    <div className="space-y-8">
       <div className="bg-white rounded-5xl p-10 shadow-sm border border-gray-50 flex flex-col md:flex-row justify-between items-center gap-10">
        <div className="flex-1">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Infrastructure Completion Rate</p>
          <div className="flex items-baseline gap-2">
            <h2 className="text-6xl font-black tracking-tighter text-[#1A1D1F]">{mainValue.progress}%</h2>
            <div className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-xs font-black">↗ +{mainValue.change}% Month over Month</div>
          </div>
          <div className="mt-8 grid grid-cols-2 max-w-sm gap-4">
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-black" style={{ width: `${mainValue.progress}%` }}></div>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-pink-500" style={{ width: `${Math.max(0, mainValue.progress - 10)}%` }}></div>
            </div>
          </div>
        </div>
        
        <div className="w-full md:w-80 flex flex-col gap-4">
           <div className="bg-gray-50/50 p-6 rounded-4xl border border-gray-100 flex items-center justify-between group cursor-pointer hover:bg-white transition-all">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Current Phase</p>
                <h4 className="text-lg font-black leading-tight">Stage 02</h4>
                <p className="text-[10px] font-bold text-blue-500 mt-1 uppercase tracking-widest font-black">Construction</p>
              </div>
              <ChevronDown size={18} className="text-gray-300 group-hover:text-black transition-colors" />
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1">
        <KPIManager sectionTitle="Infrastructure Progress" kpis={kpis} onUpdate={onUpdate} accentColor="purple" />
      </div>
    </div>
  );
};

export default InfraDevelopment;
