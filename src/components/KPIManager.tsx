
import React, { useState, useMemo } from 'react';
import { Plus, Edit2, Trash2, ChevronDown, FileText, ArrowRight } from 'lucide-react';
import { KPI, Activity } from '../types';
import AddKpiModal from './AddKpiModal';
import EditKpiModal from './EditKpiModal';
import { WeeklyPerformanceModal } from './shared/WeeklyPerformanceModal'; // 새로운 표준 모달을 가져옵니다.
import { useAppData } from '../providers/AppDataContext';

interface KPIManagerProps {
  sectionTitle: string;
  kpis: KPI[];
  onUpdate: (kpis: KPI[]) => void;
}

// KPICard: onManageActivities가 kpi 객체와 activity 객체를 모두 받도록 수정합니다.
const KPICard: React.FC<{ 
  kpi: KPI;
  onDeleteKpi: (id: string) => void;
  onEditKpi: (kpi: KPI) => void;
  onManageActivities: (kpi: KPI, activity: Activity) => void;
}> = ({ kpi, onDeleteKpi, onEditKpi, onManageActivities }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const progress = kpi.target > 0 ? Math.min(100, (kpi.current / kpi.target) * 100) : 0;
  const { addActivityToKpi } = useAppData();

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

  // "업무 관리하기" 클릭 시 실행될 함수
  const handleManageClick = async (e: React.MouseEvent) => {
    e.stopPropagation(); // KPICard의 확장/축소 이벤트 전파를 막습니다.
    
    if (kpi.activities && kpi.activities.length > 0) {
      // 이미 활동이 있으면 첫 번째 활동으로 모달을 엽니다.
      onManageActivities(kpi, kpi.activities[0]);
    } else {
      // 활동이 없으면, 기본 활동을 생성하고 그 활동으로 모달을 엽니다.
      try {
        const newActivity = await addActivityToKpi(kpi.id, { name: `주요 활동` });
        // AppDataContext에서 상태가 업데이트되므로, 부모 컴포넌트(Dashboard)는 리렌더링됩니다.
        // 하지만 이 컴포넌트의 `kpi` 프롭은 아직 이전 상태일 수 있습니다.
        // 따라서 생성된 newActivity를 직접 사용합니다.
        // 올바른 동작을 위해선, 부모에서 내려주는 kpi prop이 항상 최신임을 보장해야 합니다.
        // 이 예제에서는 생성된 활동을 바로 사용해 문제를 해결합니다.
         onManageActivities(kpi, newActivity);
      } catch (error) {
        console.error("Failed to add new activity:", error);
      }
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100/80 transition-all duration-300">
        <div className="p-6" onClick={() => setIsExpanded(!isExpanded)} style={{cursor: 'pointer'}}>
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
             <div className="px-6 pb-6 border-t border-gray-100 cursor-pointer group hover:bg-gray-50/50" onClick={handleManageClick}>
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
  // 이제 kpi와 activity 객체를 직접 관리하는 상태만 필요합니다.
  const [managingInfo, setManagingInfo] = useState<{kpi: KPI, activity: Activity} | null>(null);
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
            onManageActivities={(k, a) => setManagingInfo({ kpi: k, activity: a })} // 선택된 kpi와 activity로 상태를 설정
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

      {/* managingInfo 상태가 존재할 때, 새로운 표준 모달을 렌더링합니다. */}
      {managingInfo && (
        <WeeklyPerformanceModal 
          kpi={managingInfo.kpi}
          activity={managingInfo.activity}
          onClose={() => setManagingInfo(null)}
        />
      )}
    </div>
  );
};

export default KPIManager;
