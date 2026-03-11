
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
  
  const [tenants, setTenants] = useState([]);
  const [activeTab, setActiveTab] = useState(subTabs[0].id);

  const mainValue = {
    rate: leaseKPIs[0]?.current || 0,
  };

  const tabBaseStyle = "px-6 py-3 font-bold text-sm rounded-full transition-all duration-300";
  const tabActiveStyle = "bg-blue-500 text-white shadow-lg";
  const tabInactiveStyle = "bg-transparent text-gray-500 hover:bg-blue-50";

  const renderActiveComponent = () => {
    const activeTabConfig = subTabs.find(tab => tab.id === activeTab);
    if (!activeTabConfig) return null;

    // 3. 탭 ID에 따라 올바른 컴포넌트를 렌더링하도록 로직 간소화
    if (activeTabConfig.id === 'performance') {
      return <KPIManager sectionTitle="KPI Reports" kpis={leaseKPIs} onUpdate={setLeaseKPIs} accentColor="blue" />;
    } else if (activeTabConfig.id === 'roster') {
      return <TenantManager tenants={tenants} onTenantsUpdate={setTenants} />;
    } else if (activeTabConfig.id === 'ai-recommender') {
        return <AITenantRecommender />;
    }
    return null;
  };

  return (
    <div className="space-y-8">
      {/* Main Occupancy Rate Display */}
      <div className="bg-white rounded-5xl p-10 shadow-sm border border-gray-50">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Lease & Tenant Management</p>
        <div className="flex items-baseline gap-2">
          <h2 className="text-6xl font-black tracking-tighter text-[#1A1D1F]">{mainValue.rate}%</h2>
          <span className="text-2xl font-bold text-gray-300 uppercase">Occupancy</span>
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

      {/* Tab Content */}
      <div>
        {renderActiveComponent()}
      </div>
    </div>
  );
};

export default LeaseRecruitment;
