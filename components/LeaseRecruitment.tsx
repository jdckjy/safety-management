
import React, { useState, useMemo } from 'react';
import { Building2, LayoutList, Map as MapIcon, Search, AlertCircle, Save, Trash2, Edit3, X, Plus, PlusCircle, ChevronRight, LayoutGrid } from 'lucide-react';
import KPIManager from './KPIManager';
import { KPI, StateUpdater, Tenant } from '../types';

interface LeaseRecruitmentProps {
  kpis: KPI[];
  onUpdate: StateUpdater<KPI[]>;
  tenants: Tenant[];
  onTenantsUpdate: StateUpdater<Tenant[]>;
  mainValue: { rate: number; change: number };
}

const LeaseRecruitment: React.FC<LeaseRecruitmentProps> = ({ kpis, onUpdate, tenants, onTenantsUpdate, mainValue }) => {
  const [activeSubTab, setActiveSubTab] = useState<'management' | 'occupancy'>('occupancy');
  const [selectedFloor, setSelectedFloor] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  
  const filteredTenants = useMemo(() => 
    tenants.filter(t => 
      t.floor === selectedFloor && 
      (t.status === 'occupied' || t.status === 'vacant') && 
      (t.name.includes(searchTerm) || t.id.includes(searchTerm))
    ),
  [tenants, selectedFloor, searchTerm]);

  const floorStats = useMemo(() => {
    const rentalTarget = tenants.filter(t => t.floor === selectedFloor && t.status !== 'public');
    const totalArea = rentalTarget.reduce((acc, t) => acc + (Number(t.area) || 0), 0);
    const occupiedArea = rentalTarget.filter(t => t.status === 'occupied').reduce((acc, t) => acc + (Number(t.area) || 0), 0);
    const vacantCount = rentalTarget.filter(t => t.status === 'vacant').length;
    const occupiedCount = rentalTarget.filter(t => t.status === 'occupied').length;
    return { totalArea, rate: totalArea > 0 ? ((occupiedArea / totalArea) * 100).toFixed(1) : "0", occupiedCount, vacantCount };
  }, [tenants, selectedFloor]);

  const totalLeaseRate = mainValue.rate.toFixed(1);

  const handleAddNewUnit = () => {
    const newId = `U-${selectedFloor}F-${Date.now().toString().slice(-4)}`;
    setEditingTenant({ id: newId, name: '신규 입점 예정', usage: '용도 미지정', area: 100, floor: selectedFloor, status: 'vacant' });
  };

  const handleSaveTenant = (updated: Tenant) => {
    onTenantsUpdate(prev => prev.find(t => t.id === updated.id) ? prev.map(t => t.id === updated.id ? updated : t) : [...prev, updated]);
    setEditingTenant(null);
  };

  const handleDeleteTenant = (id: string) => {
    if (confirm('Delete unit data?')) {
      onTenantsUpdate(prev => prev.filter(t => t.id !== id));
      setEditingTenant(null);
    }
  };

  const TenantListItem: React.FC<{ tenant: Tenant }> = ({ tenant }) => {
    const isVacant = tenant.status === 'vacant';
    return (
      <div 
        onClick={() => setEditingTenant(tenant)}
        className="bg-white p-6 rounded-4xl shadow-sm border border-gray-50 flex flex-col justify-between group hover:shadow-md transition-all cursor-pointer h-[160px]"
      >
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isVacant ? 'bg-pink-500 animate-pulse' : 'bg-blue-400'}`}></span>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{tenant.id}</p>
          </div>
          <div className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${isVacant ? 'bg-pink-50 text-pink-500' : 'bg-blue-50 text-blue-500'}`}>
            {isVacant ? 'Vacant' : 'Occupied'}
          </div>
        </div>
        
        <div className="mt-2">
          <h4 className="text-lg font-black text-[#1A1D1F] tracking-tight truncate leading-tight">{isVacant ? 'Lease Available' : tenant.name}</h4>
          <p className="text-[10px] font-bold text-gray-400 uppercase mt-1">{tenant.usage}</p>
        </div>

        <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-50">
          <div className="flex items-baseline gap-1">
            <span className="text-sm font-black text-gray-700">{Math.round(tenant.area)}</span>
            <span className="text-[10px] font-bold text-gray-300">m²</span>
          </div>
          <ChevronRight size={14} className="text-gray-200 group-hover:text-black transition-all" />
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-8 pb-10">
      <div className="bg-white p-10 rounded-5xl shadow-sm border border-gray-50 flex flex-col md:flex-row justify-between items-center gap-10">
        <div className="flex-1">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Portfolio Occupancy Rate</p>
          <div className="flex items-baseline gap-2">
            <h2 className="text-6xl font-black tracking-tighter text-[#1A1D1F]">{totalLeaseRate}%</h2>
            <div className="px-3 py-1 bg-pink-100 text-pink-600 rounded-full text-xs font-black">↗ 2.1%</div>
          </div>
          <div className="mt-6 flex items-center gap-4">
             <div className="flex -space-x-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 overflow-hidden shadow-sm">
                    <img src={`https://i.pravatar.cc/100?u=tenant-${i}`} alt="tenant" />
                  </div>
                ))}
                <div className="w-8 h-8 rounded-full border-2 border-white bg-black flex items-center justify-center text-[10px] font-bold text-white shadow-sm">+12</div>
             </div>
             <span className="text-xs font-bold text-gray-400">Sync with Dashboard Module</span>
          </div>
        </div>
        
        <div className="w-full md:w-80 flex flex-col gap-4">
           <div className="bg-black p-6 rounded-4xl text-white flex items-center justify-between hover:scale-[1.02] transition-all cursor-pointer">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Current Vacancy</p>
                <h4 className="text-2xl font-black leading-tight">{floorStats.vacantCount} Units</h4>
                <p className="text-[10px] font-bold text-gray-500 mt-1">On {selectedFloor}F Layer</p>
              </div>
              <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-white">
                <LayoutGrid size={18} />
              </div>
           </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex bg-white p-1.5 rounded-full shadow-sm border border-gray-100">
          <button onClick={() => setActiveSubTab('occupancy')} className={`px-8 py-2.5 rounded-full text-xs font-bold transition-all ${activeSubTab === 'occupancy' ? 'bg-black text-white shadow-md' : 'text-gray-400 hover:text-black'}`}>Units Detail</button>
          <button onClick={() => setActiveSubTab('management')} className={`px-8 py-2.5 rounded-full text-xs font-bold transition-all ${activeSubTab === 'management' ? 'bg-black text-white shadow-md' : 'text-gray-400 hover:text-black'}`}>KPI Reports</button>
        </div>

        {activeSubTab === 'occupancy' && (
          <div className="flex items-center gap-4">
            <div className="flex bg-white p-1 rounded-full shadow-sm border border-gray-100">
              {[1, 2, 3].map(f => (
                <button key={f} onClick={() => setSelectedFloor(f)} className={`w-10 h-10 rounded-full text-[11px] font-black transition-all ${selectedFloor === f ? 'bg-black text-white' : 'text-gray-400 hover:text-black'}`}>{f}F</button>
              ))}
            </div>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
              <input type="text" placeholder="Search units..." className="pl-10 pr-6 py-2.5 bg-white rounded-full text-xs font-bold border border-gray-100 shadow-sm outline-none focus:border-gray-300 w-48" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
            <button onClick={handleAddNewUnit} className="flex items-center gap-2 px-6 py-2.5 bg-pink-500 text-white rounded-full text-xs font-black shadow-lg shadow-pink-100 hover:scale-105 active:scale-95 transition-all"><Plus size={14} /> Add Unit</button>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {activeSubTab === 'management' ? (
          <KPIManager sectionTitle="Lease & Occupancy" kpis={kpis} onUpdate={onUpdate} accentColor="blue" />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in slide-in-from-bottom-4 duration-500">
            {filteredTenants.length > 0 ? (
              filteredTenants.map(t => <TenantListItem key={t.id} tenant={t} />)
            ) : (
              <div className="col-span-full py-40 bg-white/40 rounded-5xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-300">
                <AlertCircle size={48} className="mb-4 opacity-10" />
                <p className="text-xs font-bold uppercase tracking-widest">No matching units found</p>
              </div>
            )}
          </div>
        )}
      </div>

      {editingTenant && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/5 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-xl rounded-5xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500 border border-gray-50">
            <div className="p-10">
              <div className="flex justify-between items-center mb-10">
                <h3 className="text-2xl font-black tracking-tight text-[#1A1D1F]">Edit Unit Identity</h3>
                <button onClick={() => setEditingTenant(null)} className="p-2.5 hover:bg-gray-50 rounded-full transition-colors text-gray-300 hover:text-black"><X size={20} /></button>
              </div>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Unit ID</label>
                      <input type="text" className="w-full px-6 py-4 bg-gray-50 rounded-3xl text-sm font-bold outline-none border border-transparent focus:border-gray-200" value={editingTenant.id} onChange={e => setEditingTenant({...editingTenant, id: e.target.value})} />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Tenant Name</label>
                      <input type="text" className="w-full px-6 py-4 bg-gray-50 rounded-3xl text-sm font-bold outline-none border border-transparent focus:border-gray-200" value={editingTenant.name} onChange={e => setEditingTenant({...editingTenant, name: e.target.value})} />
                   </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Usage Type</label>
                      <input type="text" className="w-full px-6 py-4 bg-gray-50 rounded-3xl text-sm font-bold outline-none border border-transparent focus:border-gray-200" value={editingTenant.usage} onChange={e => setEditingTenant({...editingTenant, usage: e.target.value})} />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Area (m²)</label>
                      <input type="number" className="w-full px-6 py-4 bg-gray-50 rounded-3xl text-sm font-bold outline-none border border-transparent focus:border-gray-200" value={editingTenant.area} onChange={e => setEditingTenant({...editingTenant, area: Number(e.target.value)})} />
                   </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Status</label>
                  <select className="w-full px-6 py-4 bg-gray-50 rounded-3xl text-sm font-bold outline-none border border-transparent focus:border-gray-200 appearance-none" value={editingTenant.status} onChange={e => setEditingTenant({...editingTenant, status: e.target.value as any})}>
                    <option value="occupied">Occupied</option>
                    <option value="vacant">Vacant</option>
                  </select>
                </div>
                <div className="flex gap-4 pt-6">
                   <button onClick={() => handleDeleteTenant(editingTenant.id)} className="flex-1 py-4 text-pink-500 font-bold text-xs hover:bg-pink-50 rounded-3xl transition-colors">Delete Permanent</button>
                   <button onClick={() => handleSaveTenant(editingTenant)} className="flex-[2] bg-black text-white py-4 rounded-3xl font-black text-xs shadow-xl hover:scale-[1.02] active:scale-95 transition-all">Save Changes</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaseRecruitment;
