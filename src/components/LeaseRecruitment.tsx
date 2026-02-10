
import React, { useState } from 'react';
import KPIManager from './KPIManager';
import TenantManager from './TenantManager';
import { useAppData } from '../providers/AppDataContext';

const LeaseRecruitment: React.FC = () => {
  const {
    leaseKPIs,
    setLeaseKPIs,
  } = useAppData();
  
  const [tenants, setTenants] = useState([]);
  const [activeTab, setActiveTab] = useState('performance');

  const mainValue = {
    rate: leaseKPIs[0]?.current || 0,
  };

  const tabBaseStyle = "px-6 py-3 font-bold text-sm rounded-full transition-all duration-300";
  const tabActiveStyle = "bg-blue-500 text-white shadow-lg";
  const tabInactiveStyle = "bg-transparent text-gray-500 hover:bg-blue-50";

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
          <button onClick={() => setActiveTab('performance')} className={`${tabBaseStyle} ${activeTab === 'performance' ? tabActiveStyle : tabInactiveStyle}`}>
            KPI Reports
          </button>
          <button onClick={() => setActiveTab('roster')} className={`${tabBaseStyle} ${activeTab === 'roster' ? tabActiveStyle : tabInactiveStyle}`}>
            Tenant Roster
          </button>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'performance' && (
          <KPIManager sectionTitle="KPI Reports" kpis={leaseKPIs} onUpdate={setLeaseKPIs} accentColor="blue" />
        )}
        {activeTab === 'roster' && (
          <TenantManager tenants={tenants} onTenantsUpdate={setTenants} />
        )}
      </div>
    </div>
  );
};

export default LeaseRecruitment;
