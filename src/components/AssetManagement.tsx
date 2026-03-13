
import React, { useState } from 'react';
import KPIManager from './KPIManager';
import { useProjectData } from '../providers/ProjectDataProvider';

// Tab configuration
const subTabs = [
  { id: 'value', label: 'Asset Value Indices', component: KPIManager },
];

const AssetManagement: React.FC = () => {
  const { assetKPIs, setAssetKPIs } = useProjectData();
  const [activeTab, setActiveTab] = useState(subTabs[0].id);

  const renderActiveComponent = () => {
    const activeTabConfig = subTabs.find(tab => tab.id === activeTab);
    if (!activeTabConfig) return null;

    return <KPIManager sectionTitle="Asset Value Indices" kpis={assetKPIs} onUpdate={setAssetKPIs} />;
  };

  return (
    <div className="space-y-4">
      {/* Tab Navigation */}
      <div className="inline-flex bg-white p-1.5 rounded-full shadow-sm border border-gray-100 self-start">
        {subTabs.map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id)} 
            className={`px-6 py-2.5 rounded-full text-xs font-bold transition-all ${activeTab === tab.id ? 'bg-emerald-500 text-white shadow-md' : 'text-gray-400 hover:text-emerald-500'}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {renderActiveComponent()}
    </div>
  );
};

export default AssetManagement;
