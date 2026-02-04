
import React from 'react';
import { Landmark, ArrowUpRight, Plus, ChevronDown } from 'lucide-react';
import KPIManager from './KPIManager';
import { KPI, StateUpdater } from '../types';

interface AssetManagementProps {
  kpis: KPI[];
  onUpdate: StateUpdater<KPI[]>;
  mainValue: { value: number; change: number };
}

const AssetManagement: React.FC<AssetManagementProps> = ({ kpis, onUpdate, mainValue }) => {
  return (
    <div className="space-y-8">
      <div className="bg-white rounded-5xl p-10 shadow-sm border border-gray-50 flex flex-col md:flex-row justify-between items-center gap-10">
        <div className="flex-1">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Total Assets Under Management</p>
          <div className="flex items-baseline gap-2">
            <h2 className="text-6xl font-black tracking-tighter text-[#1A1D1F]">${mainValue.value}T</h2>
            <div className="px-3 py-1 bg-emerald-100 text-emerald-600 rounded-full text-xs font-black">↗ ${mainValue.change}T Growth</div>
          </div>
          <div className="flex items-center gap-4 mt-6">
             <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-full text-xs font-bold text-gray-500">
               <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
               Market Value Indexed
             </div>
             <span className="text-xs font-bold text-gray-400">Next Audit: Dec 2024</span>
          </div>
        </div>
        
        <div className="w-full md:w-80 flex flex-col gap-4">
           <div className="bg-emerald-50/50 p-6 rounded-4xl border border-emerald-100 flex items-center justify-between group cursor-pointer hover:bg-emerald-50 transition-all">
              <div>
                <p className="text-[10px] font-bold text-emerald-600/60 uppercase tracking-wider mb-1">Appreciation</p>
                <h4 className="text-lg font-black leading-tight text-emerald-700">+12.5%</h4>
              </div>
              <ChevronDown size={18} className="text-emerald-300" />
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1">
        <KPIManager sectionTitle="Asset Valuation" kpis={kpis} onUpdate={onUpdate} accentColor="emerald" />
      </div>
    </div>
  );
};

export default AssetManagement;
