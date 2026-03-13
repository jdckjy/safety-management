
import React, { useState } from 'react';
import KPIManager from './KPIManager';
import TenantManager from './TenantManager';
import AITenantRecommender from './AITenantRecommender'; // 1. AI Recommender 컴포넌트 임포트
import { useProjectData } from '../providers/ProjectDataProvider';

// Tab configuration
const subTabs = [
  { id: 'performance', label: 'KPI Reports', component: KPIManager },
  { id: 'roster', label: 'Tenant Roster', component: TenantManager },
  { id: 'ai-recommender', label: 'AI Tenant Recommender', component: AITenantRecommender }, // 2. 새로운 탭 추가
];

const LeaseRecruitment: React.FC = () => {
  const {
    leaseKPIs,
    setLeaseKPIs,
  } = useProjectData();
  
  const [activeTab, setActiveTab] = useState(subTabs[0].id);

  const renderActiveComponent = () => {
    const activeTabConfig = subTabs.find(tab => tab.id === activeTab);
    if (!activeTabConfig) return null;

    // 3. 탭 ID에 따라 올바른 컴포넌트를 렌더링하도록 로직 간소화
    if (activeTabConfig.id === 'performance') {
      return <KPIManager sectionTitle="KPI Reports" kpis={leaseKPIs} onUpdate={setLeaseKPIs} />;
    } else if (activeTabConfig.id === 'roster') {
      return <TenantManager />;
    } else if (activeTabConfig.id === 'ai-recommender') {
        return <AITenantRecommender />;
    }
    return null;
  };

  return (
    <div className="space-y-4">
      {/* Tab Navigation */}
      <div className="inline-flex bg-white p-1.5 rounded-full shadow-sm border border-gray-100 self-start">
        {subTabs.map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id)} 
            className={`px-6 py-2.5 rounded-full text-xs font-bold transition-all ${activeTab === tab.id ? 'bg-blue-500 text-white shadow-md' : 'text-gray-400 hover:text-blue-500'}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div>
        {renderActiveComponent()}
      </div>
    </div>
  );
};

export default LeaseRecruitment;
