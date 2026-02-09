
import React, { useState } from 'react';
import { Plus, Edit2, Trash2, ChevronDown, FileText, Share2, CirclePlus } from 'lucide-react';
import { KPI, BusinessActivity } from '../types';
import WeeklyPerformanceModal from './WeeklyPerformanceModal';
import { useUnifiedData } from '../contexts/UnifiedDataContext';
import { createBusinessActivity } from '../data/factories';

interface KPIManagerProps {
  sectionTitle: string;
  kpis: KPI[];
  onUpdate: React.Dispatch<React.SetStateAction<KPI[]>>;
}

const KPICard: React.FC<{ 
  kpi: KPI;
  onDeleteKpi: (id: string) => void;
  onActivitySelect: (kpiId: string, activity: BusinessActivity) => void;
  onActivityAdd: (kpiId: string, content: string) => void;
}> = ({ kpi, onDeleteKpi, onActivitySelect, onActivityAdd }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [newActivityContent, setNewActivityContent] = useState('');
  const progress = kpi.target > 0 ? Math.min(100, (kpi.current / kpi.target) * 100) : 0;

  const handleAddActivity = () => {
    if (newActivityContent.trim()) {
      onActivityAdd(kpi.id, newActivityContent);
      setNewActivityContent('');
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100/80 transition-all duration-300">
      {/* KPI Main Info */}
      <div className="p-6 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex justify-between items-center">
          <h3 className="text-gray-800 font-semibold text-lg">{kpi.name}</h3>
          <div className="flex items-center gap-2 text-gray-400">
            {/* TODO: Implement Edit KPI functionality */}
            <button className="p-1.5 hover:bg-gray-100 rounded-lg"><Edit2 size={16} /></button>
            <button onClick={(e) => { e.stopPropagation(); onDeleteKpi(kpi.id); }} className="p-1.5 hover:bg-red-50 text-red-400 rounded-lg"><Trash2 size={16} /></button>
            <ChevronDown size={20} className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
          </div>
        </div>
        <div className="mt-2 text-xs text-gray-500 font-medium">
          <span>TARGET: {kpi.target}{kpi.unit}</span>
          <span className="mx-2">•</span>
          <span>VALUE: {kpi.current}{kpi.unit}</span>
        </div>
        <div className="mt-4 w-full bg-gray-100 rounded-full h-2.5">
          <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
        </div>
      </div>

      {/* Expanded Activity Ledger */}
      {isExpanded && (
        <div className="px-6 pb-6 border-t border-gray-100">
          <div className="flex justify-between items-center mt-4">
            <h4 className="text-xs font-bold text-gray-400 tracking-wider">ACTIVITY LEDGER</h4>
            <span className="text-xs font-semibold text-gray-500">Total {kpi.activities?.length || 0} Records</span>
          </div>
          <div className="mt-4 space-y-3">
            {kpi.activities?.map(activity => (
              <div 
                key={activity.id} 
                className="flex items-center justify-between bg-gray-50/80 hover:bg-gray-100 p-4 rounded-xl cursor-pointer transition-colors" 
                onClick={() => onActivitySelect(kpi.id, activity)}>
                <div className="flex items-center gap-3">
                    <FileText size={16} className="text-gray-500" />
                    <span className="text-sm font-medium text-gray-800">{activity.content}</span>
                </div>
                <Share2 size={16} className="text-gray-400" />
              </div>
            ))}
            <div className="flex items-center gap-3 pt-2">
              <input 
                type="text"
                value={newActivityContent}
                onChange={(e) => setNewActivityContent(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddActivity()}
                placeholder="Entry new activity performance..."
                className="w-full bg-transparent text-sm focus:outline-none"
              />
              <button onClick={handleAddActivity}>
                <CirclePlus size={36} className="text-blue-600 hover:text-blue-700 transition-colors" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const KPIManager: React.FC<KPIManagerProps> = ({ sectionTitle, kpis, onUpdate }) => {
  const { updateKpiActivity } = useUnifiedData();
  const [selectedActivity, setSelectedActivity] = useState<{ kpiId: string, activity: BusinessActivity } | null>(null);

  const handleAddKpi = () => {
    // Placeholder for Add Indicator button
    console.log("Add new indicator clicked");
  };

  const handleDeleteKpi = (kpiId: string) => {
    onUpdate(prev => prev.filter(k => k.id !== kpiId));
  };

  const handleAddActivity = (kpiId: string, content: string) => {
    const newActivity = createBusinessActivity({ content });
    onUpdate(prev => prev.map(k => k.id === kpiId ? { ...k, activities: [...(k.activities || []), newActivity] } : k));
  };

  const handleActivityUpdate = (updatedActivity: BusinessActivity) => {
    if (!selectedActivity) return;
    updateKpiActivity(selectedActivity.kpiId, updatedActivity);
  };

  const handleActivityDelete = (activityId: string) => {
    if (!selectedActivity) return;
    onUpdate(prev => prev.map(k => 
      k.id === selectedActivity.kpiId 
        ? { ...k, activities: (k.activities || []).filter(a => a.id !== activityId) } 
        : k
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
          <FileText className="text-blue-500"/> 
          {sectionTitle}
        </h2>
        <button onClick={handleAddKpi} className="bg-gray-900 text-white font-semibold text-sm px-4 py-2.5 rounded-lg flex items-center gap-2 hover:bg-gray-800 transition-colors">
            <Plus size={16}/>
            ADD INDICATOR
        </button>
      </div>

      <div className="space-y-4">
        {(kpis || []).map(kpi => (
          <KPICard 
            key={kpi.id} 
            kpi={kpi}
            onDeleteKpi={handleDeleteKpi}
            onActivitySelect={(kpiId, activity) => setSelectedActivity({ kpiId, activity })}
            onActivityAdd={handleAddActivity}
          />
        ))}
      </div>

      {selectedActivity && (
        <WeeklyPerformanceModal 
          isOpen={!!selectedActivity}
          onClose={() => setSelectedActivity(null)} 
          activity={selectedActivity.activity}
          onSave={handleActivityUpdate}
          onDelete={handleActivityDelete}
        />
      )}
    </div>
  );
};

export default KPIManager;
