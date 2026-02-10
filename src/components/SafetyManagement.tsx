
import React, { useState } from 'react';
import KPIManager from './KPIManager';
import HotSpotMap from './HotSpotMap';
import { useAppData } from '../providers/AppDataContext'; // Import useAppData hook
import { HotSpot } from '../types';

const SafetyManagement: React.FC = () => {
  const {
    safetyKPIs,
    setSafetyKPIs,
    facilities,
    hotspots,
    setHotspots
  } = useAppData();
  
  const [activeSubTab, setActiveSubTab] = useState<'kpi' | 'monitoring'>('monitoring');

  const mainValue = {
      days: safetyKPIs[0]?.current || 0, change: 0
  };

  const handleAddHotspot = (newHotspotData: Omit<HotSpot, 'id'>) => {
    const newHotspot: HotSpot = { ...newHotspotData, id: Date.now().toString() };
    setHotspots(prev => [...prev, newHotspot]);
  };

  const handleUpdateHotspot = (updatedHotspot: HotSpot) => {
    setHotspots(prev => prev.map(h => h.id === updatedHotspot.id ? updatedHotspot : h));
  };

  const handleDeleteHotspot = (hotspotId: string) => {
    setHotspots(prev => prev.filter(h => h.id !== hotspotId));
  };

  return (
    <div className="space-y-8 h-full flex flex-col">
      <div className="bg-white rounded-5xl p-10 shadow-sm border border-gray-50 flex flex-col md:flex-row justify-between items-center gap-10">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="px-2 py-0.5 bg-pink-50 text-pink-500 rounded-full text-[10px] font-black uppercase tracking-widest ring-1 ring-pink-100">Safety Control</span>
          </div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Accident-Free Days</p>
          <div className="flex items-baseline gap-2">
            <h2 className="text-6xl font-black tracking-tighter text-[#1A1D1F]">{mainValue.days}</h2>
            <span className="text-2xl font-bold text-gray-300 uppercase">Days</span>
          </div>
          <div className="flex items-center gap-2 mt-4">
             <div className="px-3 py-1 bg-emerald-50 text-emerald-500 rounded-full text-xs font-black">↗ Success Rate 98.2%</div>
             <span className="text-xs font-bold text-gray-400">Target: 1,000 Days Milestone</span>
          </div>
        </div>
        
        <div className="w-full md:w-80 flex flex-col gap-4">
          {/* ... (Existing UI) ... */}
        </div>
      </div>

      <div className="flex bg-white p-1.5 rounded-full shadow-sm border border-gray-100 self-start">
        <button onClick={() => setActiveSubTab('kpi')} className={`px-8 py-2.5 rounded-full text-xs font-bold transition-all ${activeSubTab === 'kpi' ? 'bg-black text-white shadow-md' : 'text-gray-400 hover:text-black'}`}>KPI Reports</button>
        <button onClick={() => setActiveSubTab('monitoring')} className={`px-8 py-2.5 rounded-full text-xs font-bold transition-all ${activeSubTab === 'monitoring' ? 'bg-black text-white shadow-md' : 'text-gray-400 hover:text-black'}`}>Monitoring</button>
      </div>

      <div className="flex-grow">
        {activeSubTab === 'kpi' ? (
          <KPIManager sectionTitle="Safety Index" kpis={safetyKPIs} onUpdate={setSafetyKPIs} accentColor="orange" />
        ) : (
          <HotSpotMap 
            facilities={facilities}
            hotspots={hotspots}
            onAddHotspot={handleAddHotspot}
            onUpdateHotspot={handleUpdateHotspot}
            onDeleteHotspot={handleDeleteHotspot}
          />
        )}
      </div>
    </div>
  );
};

export default SafetyManagement;
