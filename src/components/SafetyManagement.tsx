
import React, { useState } from 'react';
import KPIManager from './KPIManager';
import HotSpotMap from './HotSpotMap';
import { useProjectData } from '../providers/ProjectDataProvider';
import { HotSpot } from '../types';

// Tab configuration
const subTabs = [
  { id: 'monitoring', label: 'Monitoring', component: HotSpotMap },
  { id: 'kpi', label: 'KPI Reports', component: KPIManager },
];

const SafetyManagement: React.FC = () => {
  const {
    safetyKPIs,
    setSafetyKPIs,
    facilities,
    hotspots,
    setHotspots
  } = useProjectData();
  
  const [activeSubTab, setActiveSubTab] = useState(subTabs[0].id);

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

  const renderActiveComponent = () => {
    const activeTabConfig = subTabs.find(tab => tab.id === activeSubTab);
    if (!activeTabConfig) return null;

    if (activeTabConfig.id === 'kpi') {
      return <KPIManager sectionTitle="Safety Index" kpis={safetyKPIs} onUpdate={setSafetyKPIs} />;
    } else if (activeTabConfig.id === 'monitoring') {
      return <HotSpotMap 
        facilities={facilities}
        hotspots={hotspots}
        onAddHotspot={handleAddHotspot}
        onUpdateHotspot={handleUpdateHotspot}
        onDeleteHotspot={handleDeleteHotspot}
      />;
    }
    return null;
  };

  return (
    <div className="space-y-4 h-full flex flex-col">
      <div className="inline-flex bg-white p-1.5 rounded-full shadow-sm border border-gray-100 self-start">
        {subTabs.map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id)} 
            className={`px-6 py-2.5 rounded-full text-xs font-bold transition-all ${activeSubTab === tab.id ? 'bg-black text-white shadow-md' : 'text-gray-400 hover:text-black'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-grow">
        {renderActiveComponent()}
      </div>
    </div>
  );
};

export default SafetyManagement;
