
import React, { useState } from 'react';
import { Plus, Edit2, Trash2, ChevronDown, FileText } from 'lucide-react';
import { KPI } from '../types';
import AddKpiModal from './AddKpiModal';
import EditKpiModal from './EditKpiModal';
import { ActivityManager } from './ActivityManager'; // 새로운 ActivityManager를 가져옵니다.

interface KPIManagerProps {
  sectionTitle: string;
  kpis: KPI[];
  onUpdate: (kpis: KPI[]) => void;
}

// KPICard: 이제 Activity 관리는 ActivityManager가 전담합니다.
const KPICard: React.FC<{ 
  kpi: KPI;
  onDeleteKpi: (id: string) => void;
  onEditKpi: (kpi: KPI) => void;
}> = ({ kpi, onDeleteKpi, onEditKpi }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const progress = kpi.target > 0 ? Math.min(100, (kpi.current / kpi.target) * 100) : 0;

  const confirmAndDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`'${kpi.title}' 지표를 정말 삭제하시겠습니까?`)) {
      onDeleteKpi(kpi.id);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEditKpi(kpi);
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100/80 transition-all duration-300">
      <div className="p-6 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
          <div className="flex justify-between items-center">
              <h3 className="text-gray-800 font-semibold text-lg">{kpi.title}</h3>
              <div className="flex items-center gap-2 text-gray-400">
                  <button onClick={handleEdit} className="p-1.5 hover:bg-gray-100 rounded-lg"><Edit2 size={16} /></button>
                  <button onClick={confirmAndDelete} className="p-1.5 hover:bg-red-50 text-red-400 rounded-lg"><Trash2 size={16} /></button>
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
      {/* 확장 시, 복잡한 로직 대신 ActivityManager 컴포넌트를 렌더링합니다. */}
      {isExpanded && (
          <ActivityManager kpi={kpi} />
      )}
    </div>
  );
}

const KPIManager: React.FC<KPIManagerProps> = ({ sectionTitle, kpis, onUpdate }) => {
  const [isAddKpiModalOpen, setIsAddKpiModalOpen] = useState(false);
  const [editingKpi, setEditingKpi] = useState<KPI | null>(null);

  const handleSaveNewKpi = (newKpiData: Omit<KPI, 'id' | 'current' | 'activities' | 'description' | 'previous'>) => {
    const newKpi: KPI = { 
        ...newKpiData, 
        id: `kpi-${Date.now()}`,
        current: 0, 
        activities: [], 
        description: '', 
        previous: 0
    };
    const newKpiList = [...(kpis || []), newKpi];
    onUpdate(newKpiList);
  };

  const handleUpdateKpi = (updatedKpi: KPI) => {
    const newKpiList = kpis.map(k => k.id === updatedKpi.id ? updatedKpi : k);
    onUpdate(newKpiList);
    setEditingKpi(null);
  };

  const handleDeleteKpi = (kpiId: string) => {
    const newKpiList = kpis.filter(k => k.id !== kpiId);
    onUpdate(newKpiList);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
          <FileText className="text-blue-500"/> 
          {sectionTitle}
        </h2>
        <button onClick={() => setIsAddKpiModalOpen(true)} className="bg-gray-900 text-white font-semibold text-sm px-4 py-2.5 rounded-lg flex items-center gap-2 hover:bg-gray-800 transition-colors">
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
            onEditKpi={setEditingKpi}
          />
        ))}
      </div>
      
      <AddKpiModal 
        isOpen={isAddKpiModalOpen}
        onClose={() => setIsAddKpiModalOpen(false)}
        onSave={handleSaveNewKpi}
      />

      {editingKpi && (
        <EditKpiModal
          isOpen={!!editingKpi}
          onClose={() => setEditingKpi(null)}
          onSave={handleUpdateKpi}
          kpi={editingKpi}
        />
      )}
    </div>
  );
};

export default KPIManager;

