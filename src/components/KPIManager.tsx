
import React, { useState } from 'react';
import { Plus, Edit2, Trash2, ChevronDown, FileText, ArrowRight } from 'lucide-react';
import { KPI, Activity } from '../types';
import AddKpiModal from './AddKpiModal';
import EditKpiModal from './EditKpiModal';
import TaskManager from './TaskManager';
import { useAppData } from '../providers/AppDataContext';

interface KPIManagerProps {
  sectionTitle: string;
  kpis: KPI[];
  onUpdate: (kpis: KPI[]) => void; // 부모의 상태를 직접 업데이트하도록 타입 변경
}

// ... KPICard 컴포넌트는 변경 사항 없음 ...
const KPICard: React.FC<{ 
  kpi: KPI;
  onDeleteKpi: (id: string) => void;
  onEditKpi: (kpi: KPI) => void;
  onManageActivities: (kpiId: string) => void;
}> = ({ kpi, onDeleteKpi, onEditKpi, onManageActivities }) => {
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
      {isExpanded && (
        <div className="px-6 pb-6 border-t border-gray-100 cursor-pointer group hover:bg-gray-50/50" onClick={() => onManageActivities(kpi.id)}>
            <div className="flex justify-between items-center mt-4">
                <h4 className="text-xs font-bold text-gray-400 tracking-wider">ACTIVITY LEDGER</h4>
                <span className="text-xs font-semibold text-gray-500">Total {kpi.activities?.length || 0} Records</span>
            </div>
            <div className="mt-4 space-y-3">
                {(kpi.activities && kpi.activities.length > 0) ? (
                    kpi.activities.slice(0, 3).map(activity => (
                        <div key={activity.id} className="flex items-center justify-between bg-gray-50/80 p-3 rounded-xl">
                            <div className="flex items-center gap-3">
                                <FileText size={16} className="text-gray-500" />
                                <span className="text-sm font-medium text-gray-800">{activity.name}</span>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className='text-sm text-center text-gray-400 py-4'>업무 내역이 없습니다.</p>
                )}
                <div className="flex items-center justify-center gap-2 pt-2 text-sm font-semibold text-blue-600 group-hover:text-blue-700">
                    업무 관리하기 <ArrowRight size={14} />
                </div>
            </div>
        </div>
      )}
    </div>
  );
}

const KPIManager: React.FC<KPIManagerProps> = ({ sectionTitle, kpis, onUpdate }) => {
  const [managingActivityInfo, setManagingActivityInfo] = useState<{kpiId: string, activityId: string} | null>(null);
  const { addActivityToKpi } = useAppData();
  const [isAddKpiModalOpen, setIsAddKpiModalOpen] = useState(false);
  const [editingKpi, setEditingKpi] = useState<KPI | null>(null);

  const handleSaveNewKpi = (newKpiData: Omit<KPI, 'id' | 'current' | 'activities' | 'description' | 'previous'>) => {
    // *** TRACING: 데이터 흐름 추적을 위한 console.log 추가 ***
    console.log('[Trace 2/3 - KPIManager] Received new KPI data:', newKpiData);

    const newKpi: KPI = { 
        ...newKpiData, 
        id: `kpi-${Date.now()}`,
        current: 0, 
        activities: [], 
        description: '', // 기본값 설정
        previous: 0 // 기본값 설정
    };
    
    const newKpiList = [...(kpis || []), newKpi];
    console.log('[Trace 2/3 - KPIManager] Passing new KPI list to parent:', newKpiList);
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

  const handleManageActivities = async (kpiId: string) => {
    const targetKpi = kpis.find(k => k.id === kpiId);
    if (!targetKpi) return;

    if (targetKpi.activities && targetKpi.activities.length > 0) {
      setManagingActivityInfo({ kpiId: kpiId, activityId: targetKpi.activities[0].id });
    } else {
      try {
        const newActivity = await addActivityToKpi(kpiId, { name: `${targetKpi.title} - 주요 활동` });
        // 중요: addActivityToKpi는 App.tsx의 상태를 직접 변경하므로, 이 컴포넌트의 kpis 프롭이 오래되었을 수 있습니다.
        // TaskManager를 열기 전에 최신 activityId를 사용하도록 보장합니다.
        setManagingActivityInfo({ kpiId: kpiId, activityId: newActivity.id });
      } catch (error) {
        console.error("Failed to add new activity:", error);
      }
    }
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
            onManageActivities={handleManageActivities}
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

      {managingActivityInfo && (
        <TaskManager 
          kpiId={managingActivityInfo.kpiId}
          activityId={managingActivityInfo.activityId}
          onClose={() => setManagingActivityInfo(null)}
        />
      )}
    </div>
  );
};

export default KPIManager;
