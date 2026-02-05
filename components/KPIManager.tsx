
import React, { useState } from 'react';
import { Plus, Edit2, Trash2, ChevronDown, Settings2 } from 'lucide-react';
import { KPI, BusinessActivity } from '../types';
import ActivityDetailModal from './ActivityDetailModal';
import { useData } from '../contexts/DataContext'; // Import useData hook

interface KPIManagerProps {
  sectionTitle: string;
  kpis: KPI[];
  onUpdate: React.Dispatch<React.SetStateAction<KPI[]>>;
  accentColor: string;
}

const KPIManager: React.FC<KPIManagerProps> = ({ sectionTitle, kpis, onUpdate, accentColor }) => {
  const { selectedMonth, updateKpiActivity } = useData(); // Get data from context

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

  // This now just closes the modal, as saving is handled by onActivityUpdate
  const handleSaveActivityDetail = (updatedActivity: BusinessActivity) => {
    // onUpdate will be triggered by onActivityUpdate in the modal
    setSelectedActivity(null);
  };
  
  // The real-time update handler passed to the modal
  const handleActivityUpdate = (updatedActivity: BusinessActivity) => {
    if (!selectedActivity) return;
    updateKpiActivity(selectedActivity.kpiId, updatedActivity);
  };

  const resetForm = () => setFormData({ name: '', target: 0, current: 0, unit: '', activities: [] });

  return (
    <div className="space-y-6">
      {/* ... KPI Manager form ... */}
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
                   <div className="space-y-4">
                    {(kpi.activities || []).map((activity) => (
                      <div key={activity.id} onClick={() => setSelectedActivity({ kpiId: kpi.id, activity })} className="flex items-center justify-between p-5 rounded-4xl bg-gray-50/50 border border-transparent hover:border-gray-100 hover:bg-white transition-all cursor-pointer group/item">
                        <div className="flex items-center gap-4">
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

      {selectedActivity && (
        <ActivityDetailModal 
          activity={selectedActivity.activity} 
          accentColor={accentColor} 
          selectedMonth={selectedMonth} // Pass selectedMonth from context
          onClose={() => setSelectedActivity(null)} 
          onSave={handleSaveActivityDetail} 
          onActivityUpdate={handleActivityUpdate} // Pass the real-time update handler
          onDelete={() => { 
            onUpdate(prev => prev.map(k => k.id === selectedActivity.kpiId ? { ...k, activities: (k.activities || []).filter(a => a.id !== selectedActivity.activity.id) } : k)); 
            setSelectedActivity(null); 
          }}
        />
      )}
    </div>
  );
};

export default KPIManager;
