
import React from 'react';
import KPIManager from './KPIManager';
import { useAppData } from '../providers/AppDataContext'; // Import useAppData hook

const AssetManagement: React.FC = () => {
  const { assetKPIs, setAssetKPIs } = useAppData();

  const mainValue = {
    value: assetKPIs[0]?.current || 0,
    change: 0 // Placeholder
  };

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-5xl p-10 shadow-sm border border-gray-50">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Asset Value Management</p>
        <div className="flex items-baseline gap-2">
          <h2 className="text-6xl font-black tracking-tighter text-[#1A1D1F]">${mainValue.value}M</h2>
          <span className="text-2xl font-bold text-gray-300 uppercase">Total Value</span>
        </div>
      </div>
      <KPIManager sectionTitle="Asset Value Indices" kpis={assetKPIs} onUpdate={setAssetKPIs} accentColor="emerald" />
    </div>
  );
};

export default AssetManagement;
