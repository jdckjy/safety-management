
import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Target, BarChart3, Check, X, ClipboardList, Calendar, ChevronDown, Settings2, MoreHorizontal } from 'lucide-react';
import { KPI, StateUpdater, BusinessActivity } from '../types';
import ActivityDetailModal from './ActivityDetailModal';

interface KPIManagerProps {
  sectionTitle: string;
  kpis: KPI[];
  onUpdate: StateUpdater<KPI[]>;
  accentColor: string;
}

const KPIManager: React.FC<KPIManagerProps> = ({ sectionTitle, kpis, onUpdate, accentColor }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [selectedKpiId, setSelectedKpiId] = useState<string | null>(null);
  const [newActivityText, setNewActivityText] = useState('');
  const [selectedActivity, setSelectedActivity] = useState<{kpiId: string, activity: BusinessActivity} | null>(null);

  const themeStyles: Record<string, { bg: string, text: string, light: string, ring: string }> = {
    orange: { bg: 'bg-pink-500', text: 'text-pink-500', light: 'bg-pink-50', ring: 'ring-pink-100' },
    blue: { bg: 'bg-blue-400', text: 'text-blue-400', light: 'bg-blue-50', ring: 'ring-blue-100' },
    emerald: { bg: 'bg-black', text: 'text-black', light: 'bg-gray-50', ring: 'ring-gray-200' },
    purple: { bg: 'bg-gray-400', text: 'text-gray-400', light: 'bg-gray-100', ring: 'ring-gray-200' },
  };

  const theme = themeStyles[accentColor] || themeStyles.blue;

  const [formData, setFormData] = useState<Omit<KPI, 'id'>>({ name: '', target: 0, current: 0, unit: '', activities: [] });

  const handleAddKpi = () => {
    if (!formData.name) return;
    onUpdate((prev) => [...prev, { ...formData, id: `kpi-${Date.now()}`, activities: [] }]);
    resetForm();
    setIsAdding(false);
  };

  const handleUpdateKpi = (id: string) => {
    onUpdate((prev) => prev.map(k => k.id === id ? { ...k, ...formData } : k));
    setEditingId(null);
    resetForm();
  };

  const handleAddActivity = (kpiId: string) => {
    if (!newActivityText.trim()) return;
    const newActivity: BusinessActivity = {
      id: `act-${Date.now()}`,
      content: newActivityText,
      status: 'ongoing',
      date: new Date().toISOString().split('T')[0],
      monthlyRecords: Array.from({ length: 12 }, (_, i) => ({ month: i + 1, plans: [] }))
    };
    onUpdate(prev => prev.map(k => k.id === kpiId ? { ...k, activities: [...(k.activities || []), newActivity] } : k));
    setNewActivityText('');
  };

  const handleSaveActivityDetail = (updatedActivity: BusinessActivity) => {
    if (!selectedActivity) return;
    onUpdate(prev => prev.map(k => k.id === selectedActivity.kpiId ? { ...k, activities: (k.activities || []).map(a => a.id === updatedActivity.id ? updatedActivity : a) } : k));
    setSelectedActivity(null);
  };

  const resetForm = () => setFormData({ name: '', target: 0, current: 0, unit: '', activities: [] });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-[#1A1D1F] flex items-center gap-2">
          <BarChart3 size={18} className={theme.text} />
          {sectionTitle} Indices
        </h3>
        {!isAdding && !editingId && (
          <button onClick={() => { setIsAdding(true); resetForm(); }} className="flex items-center gap-2 px-6 py-2 bg-black text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg hover:scale-105 active:scale-95 transition-all">
            <Plus size={14} /> Add Indicator
          </button>
        )}
      </div>

      <div className="space-y-6">
        {(isAdding || editingId) && (
          <div className="bg-white p-10 rounded-5xl border border-gray-100 shadow-sm animate-in fade-in slide-in-from-top-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="space-y-1"><label className="text-[10px] font-bold text-gray-400 uppercase px-2">Name</label><input type="text" className="w-full px-6 py-4 bg-gray-50 rounded-3xl text-sm font-bold outline-none" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} /></div>
              <div className="space-y-1"><label className="text-[10px] font-bold text-gray-400 uppercase px-2">Target</label><input type="number" className="w-full px-6 py-4 bg-gray-50 rounded-3xl text-sm font-bold outline-none" value={formData.target} onChange={e => setFormData({ ...formData, target: Number(e.target.value) })} /></div>
              <div className="space-y-1"><label className="text-[10px] font-bold text-gray-400 uppercase px-2">Current</label><input type="number" className="w-full px-6 py-4 bg-gray-50 rounded-3xl text-sm font-bold outline-none" value={formData.current} onChange={e => setFormData({ ...formData, current: Number(e.target.value) })} /></div>
              <div className="space-y-1"><label className="text-[10px] font-bold text-gray-400 uppercase px-2">Unit</label><input type="text" className="w-full px-6 py-4 bg-gray-50 rounded-3xl text-sm font-bold outline-none" value={formData.unit} onChange={e => setFormData({ ...formData, unit: e.target.value })} /></div>
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => { setIsAdding(false); setEditingId(null); }} className="px-8 py-3 rounded-full text-[10px] font-black uppercase text-gray-400 hover:bg-gray-50">Cancel</button>
              <button onClick={() => editingId ? handleUpdateKpi(editingId) : handleAddKpi()} className="px-10 py-3 bg-black text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">Save Indicator</button>
            </div>
          </div>
        )}

        {kpis.map(kpi => {
          const progress = kpi.target > 0 ? Math.min(100, (kpi.current / kpi.target) * 100) : 0;
          const isSelected = selectedKpiId === kpi.id;
          return (
            <div key={kpi.id} className="group">
              <div 
                onClick={() => setSelectedKpiId(isSelected ? null : kpi.id)}
                className={`bg-white p-8 rounded-5xl border shadow-sm transition-all cursor-pointer relative ${isSelected ? 'border-gray-200 ring-4 ring-gray-50' : 'border-gray-50 hover:border-gray-100 hover:shadow-md'}`}
              >
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h4 className="font-bold text-[#1A1D1F] text-lg tracking-tight">{kpi.name}</h4>
                    <div className="flex items-center gap-3 mt-1 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                      <span>Target: {kpi.target}{kpi.unit}</span>
                      <span className="w-1 h-1 bg-gray-200 rounded-full"></span>
                      <span>Value: {kpi.current}{kpi.unit}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                    <button onClick={(e) => { e.stopPropagation(); setEditingId(kpi.id); setFormData(kpi); }} className="p-2.5 hover:bg-gray-50 rounded-2xl text-gray-300 hover:text-black transition-all"><Edit2 size={16} /></button>
                    <button onClick={() => onUpdate(prev => prev.filter(k => k.id !== kpi.id))} className="p-2.5 hover:bg-pink-50 rounded-2xl text-gray-300 hover:text-pink-500 transition-all"><Trash2 size={16} /></button>
                    <ChevronDown size={20} className={`text-gray-200 ml-2 transition-transform ${isSelected ? 'rotate-180 text-black' : ''}`} />
                  </div>
                </div>
                <div className="w-full h-1.5 bg-gray-50 rounded-full overflow-hidden">
                  <div className={`h-full ${theme.bg} transition-all duration-1000`} style={{ width: `${progress}%` }} />
                </div>
              </div>

              {isSelected && (
                <div className="mt-4 mx-8 p-10 bg-white border border-gray-100 rounded-5xl shadow-lg animate-in slide-in-from-top-4">
                  <div className="flex items-center justify-between mb-8">
                    <h5 className="font-bold text-sm uppercase tracking-widest text-gray-400">Activity Ledger</h5>
                    <div className="px-3 py-1 bg-gray-50 rounded-full text-[10px] font-black text-gray-400">Total {kpi.activities?.length || 0} Records</div>
                  </div>
                  <div className="space-y-4">
                    {(kpi.activities || []).map((activity) => (
                      <div key={activity.id} onClick={() => setSelectedActivity({ kpiId: kpi.id, activity })} className="flex items-center justify-between p-5 rounded-4xl bg-gray-50/50 border border-transparent hover:border-gray-100 hover:bg-white transition-all cursor-pointer group/item">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-2xl ${theme.light} ${theme.text} flex items-center justify-center`}><ClipboardList size={20} /></div>
                          <p className="text-sm font-bold text-gray-700">{activity.content}</p>
                        </div>
                        <Settings2 size={16} className="text-gray-300 group-hover/item:text-black transition-colors" />
                      </div>
                    ))}
                    <div className="mt-8 flex gap-3">
                      <input type="text" placeholder="Entry new activity performance..." className="flex-1 px-8 py-4 bg-gray-50 rounded-full text-sm font-bold outline-none border border-transparent focus:border-gray-100 focus:bg-white transition-all" value={newActivityText} onChange={e => setNewActivityText(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddActivity(kpi.id)} />
                      <button onClick={() => handleAddActivity(kpi.id)} className={`w-12 h-12 ${theme.bg} text-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 active:scale-95 transition-all`}><Plus size={20} /></button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {selectedActivity && (
        <ActivityDetailModal 
          activity={selectedActivity.activity} accentColor={accentColor} onClose={() => setSelectedActivity(null)} 
          onSave={handleSaveActivityDetail} onDelete={() => { onUpdate(prev => prev.map(k => k.id === selectedActivity.kpiId ? { ...k, activities: (k.activities || []).filter(a => a.id !== selectedActivity.activity.id) } : k)); setSelectedActivity(null); }}
        />
      )}
    </div>
  );
};

export default KPIManager;
