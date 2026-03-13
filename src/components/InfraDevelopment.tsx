
import React, { useState } from 'react';
import KPIManager from './KPIManager';
import { useProjectData } from '../providers/ProjectDataProvider';

// Tab configuration
const subTabs = [
  { id: 'progress', label: 'Infra Progress', component: KPIManager },
];

const InfraDevelopment: React.FC = () => {
  const { infraKPIs, setInfraKPIs } = useProjectData();
  const [activeTab, setActiveTab] = useState(subTabs[0].id);
  
  const renderActiveComponent = () => {
    const activeTabConfig = subTabs.find(tab => tab.id === activeTab);
    if (!activeTabConfig) return null;

    // For now, we only have one component type. This can be expanded with more else-if blocks.
    return <KPIManager sectionTitle="Infra Progress" kpis={infraKPIs} onUpdate={setInfraKPIs} />;
  };

  return (
    <div className="space-y-4">
      {/* Tab Navigation */}
      <div className="inline-flex bg-white p-1.5 rounded-full shadow-sm border border-gray-100 self-start">
        {subTabs.map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id)} 
            className={`px-6 py-2.5 rounded-full text-xs font-bold transition-all ${activeTab === tab.id ? 'bg-purple-500 text-white shadow-md' : 'text-gray-400 hover:text-purple-500'}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {renderActiveComponent()}
    </div>
  );
};

export default InfraDevelopment;
