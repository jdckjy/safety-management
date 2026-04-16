
import React, { useState } from 'react';
import KPIManager from './KPIManager';
import TenantManager from './TenantManager';
import AITenantRecommender from './AITenantRecommender';
import LeaseAnalysisPage from '@/pages/LeaseAnalysisPage';
import LeaseStatusSummaryPage from '@/pages/LeaseStatusSummaryPage';
import { useProjectData } from '@/providers/ProjectDataProvider';
import TenantInfoView from '@/features/tenant-info/TenantInfoView';

// Tab configuration
const subTabs = [
  { id: 'performance', label: 'KPI Reports' },
  { id: 'lease-status', label: '주요 임대현황' },
  { id: 'tenant-info', label: '임차인 정보' },
  { id: 'roster', label: 'Tenant Roster' },
  { id: 'lease-analysis', label: '수익 분석' },
  { id: 'ai-recommender', label: 'AI Tenant Recommender' },
];

const LeaseRecruitment: React.FC = () => {
  const {
    leaseKPIs,
    setLeaseKPIs,
  } = useProjectData();
  
  const [activeTab, setActiveTab] = useState('tenant-info');

  const renderActiveComponent = () => {
    const activeTabConfig = subTabs.find(tab => tab.id === activeTab);
    if (!activeTabConfig) return null;

    switch (activeTabConfig.id) {
      case 'performance':
        return <KPIManager sectionTitle="KPI Reports" kpis={leaseKPIs} onUpdate={setLeaseKPIs} />;
      case 'lease-status':
        return <LeaseStatusSummaryPage />;
      case 'tenant-info':
        return <TenantInfoView />;
      case 'roster':
        return <TenantManager />;
      case 'lease-analysis':
        return <LeaseAnalysisPage />;
      case 'ai-recommender':
        return <AITenantRecommender />;
      default:
        return null;
    }
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
