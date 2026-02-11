
import React, { useState } from 'react';
import KPIManager from './KPIManager';
import { useAppData } from '../providers/AppDataContext';

// Tab configuration
const subTabs = [
  { id: 'progress', label: 'Infra Progress', component: KPIManager },
];

const InfraDevelopment: React.FC = () => {
  const { infraKPIs, setInfraKPIs } = useAppData();
  const [activeTab, setActiveTab] = useState(subTabs[0].id);
  
  const mainValue = {
    progress: infraKPIs[0]?.current || 0,
    change: 0 // Placeholder
  };

  const tabBaseStyle = "px-6 py-3 font-bold text-sm rounded-full transition-all duration-300";
  const tabActiveStyle = "bg-purple-500 text-white shadow-lg";
  const tabInactiveStyle = "bg-transparent text-gray-500 hover:bg-purple-50";

  const renderActiveComponent = () => {
    const activeTabConfig = subTabs.find(tab => tab.id === activeTab);
    if (!activeTabConfig) return null;

    // For now, we only have one component type. This can be expanded with more else-if blocks.
    return <KPIManager sectionTitle="Infra Progress" kpis={infraKPIs} onUpdate={setInfraKPIs} accentColor="purple" />;
  };

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-5xl p-10 shadow-sm border border-gray-50">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Infrastructure Development</p>
        <div className="flex items-baseline gap-2">
          <h2 className="text-6xl font-black tracking-tighter text-[#1A1D1F]">{mainValue.progress}%</h2>
          <span className="text-2xl font-bold text-gray-300 uppercase">Completion</span>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white p-2 rounded-full shadow-sm border border-gray-50 inline-flex items-center">
        {subTabs.map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id)} 
            className={`${tabBaseStyle} ${activeTab === tab.id ? tabActiveStyle : tabInactiveStyle}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {renderActiveComponent()}
    </div>
  );
};

export default InfraDevelopment;
