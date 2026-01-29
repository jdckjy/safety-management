
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { db } from './services/storageService.ts';
import { Facility, InspectionLog, InspectionType, SeverityLevel, LogStatus, InspectionItem } from './types.ts';
import { getSafetyInsights } from './services/geminiService.ts';
import TopKpiBar from './components/TopKpiBar.tsx';
import HotSpotMap from './components/HotSpotMap.tsx';
import StatutoryAlertList from './components/StatutoryAlertList.tsx';
import AnalyticsCharts from './components/AnalyticsCharts.tsx';
import LogModal from './components/LogModal.tsx';
import ComplianceFormModal from './components/ComplianceFormModal.tsx';
import PerformanceManagement from './components/PerformanceManagement.tsx';
import InspectionItemTable from './components/InspectionItemTable.tsx';
import InspectionItemModal from './components/InspectionItemModal.tsx';
import { 
  Bell, 
  Sparkles, 
  Loader2, 
  Plus, 
  ShieldPlus, 
  LayoutDashboard, 
  Target, 
  Activity, 
  Building2, 
  ClipboardList,
  DatabaseZap
} from 'lucide-react';

type AppTab = 'dashboard' | 'compliance' | 'performance';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>('dashboard');
  
  // DB 초기화 및 상태 로드
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [logs, setLogs] = useState<InspectionLog[]>([]);
  const [inspectionItems, setInspectionItems] = useState<InspectionItem[]>([]);

  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [isComplianceModalOpen, setIsComplianceModalOpen] = useState(false);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  
  const [selectedLog, setSelectedLog] = useState<Partial<InspectionLog> | undefined>(undefined);
  const [selectedItem, setSelectedItem] = useState<InspectionItem | undefined>(undefined);

  const [aiInsights, setAiInsights] = useState<string>('');
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);

  // 1. 컴포넌트 마운트 시 DB 로드
  useEffect(() => {
    db.init();
    setFacilities(db.getFacilities());
    setLogs(db.getLogs());
    setInspectionItems(db.getInspectionItems());
  }, []);

  // 2. 상태 변경 시 DB에 즉시 영구 저장 (Database Synchronizer)
  useEffect(() => {
    if (facilities.length > 0) db.saveFacilities(facilities);
  }, [facilities]);

  useEffect(() => {
    if (logs.length > 0) db.saveLogs(logs);
  }, [logs]);

  useEffect(() => {
    if (inspectionItems.length > 0) db.saveInspectionItems(inspectionItems);
  }, [inspectionItems]);

  const dDayUrgentCount = useMemo(() => {
    return facilities.filter(f => {
      try {
        const next = new Date(f.nextInspectionDate);
        if (isNaN(next.getTime())) return false;
        const diff = next.getTime() - new Date().getTime();
        const days = diff / (1000 * 60 * 60 * 24);
        return days <= 7;
      } catch (e) { return false; }
    }).length;
  }, [facilities]);

  const preventiveRatio = useMemo(() => {
    if (logs.length === 0) return 0;
    const activeLogs = logs.filter(l => l.status !== LogStatus.FALSE_ALARM);
    if (activeLogs.length === 0) return 0;
    const planned = activeLogs.filter(l => l.type === InspectionType.PLANNED).length;
    return Math.round((planned / activeLogs.length) * 100);
  }, [logs]);
  
  const safetyScore = useMemo(() => {
    if (facilities.length === 0) return 100;
    const overdueCount = facilities.filter(f => new Date(f.nextInspectionDate) < new Date()).length;
    const highSeverityCount = logs.filter(l => l.severity === SeverityLevel.HIGH && l.status === LogStatus.ACTIVE).length;
    return Math.max(0, 100 - (overdueCount * 8) - (dDayUrgentCount * 3) - (highSeverityCount * 5));
  }, [facilities, logs, dDayUrgentCount]);

  const monthlyStats = useMemo(() => {
    const months = ['01', '02', '03', '04', '05']; 
    return months.map(m => {
      const monthLogs = logs.filter(l => l.timestamp && l.timestamp.includes(`-2024-${m}-`) && l.status !== LogStatus.FALSE_ALARM);
      const pCount = monthLogs.filter(l => l.type === InspectionType.PLANNED).length;
      const rCount = monthLogs.filter(l => l.type === InspectionType.REACTIVE).length;
      return {
        month: `${parseInt(m)}월`,
        preventive: pCount,
        reactive: rCount
      };
    });
  }, [logs]);

  const handleFetchInsights = useCallback(async () => {
    if (logs.length === 0) return;
    setIsLoadingInsights(true);
    try {
      const activeLogs = logs.filter(l => l.status !== LogStatus.FALSE_ALARM);
      const result = await getSafetyInsights(activeLogs, facilities);
      setAiInsights(result || '');
    } catch (err) {
      setAiInsights("AI 분석 결과를 가져오는 중에 문제가 발생했습니다.");
    } finally {
      setIsLoadingInsights(false);
    }
  }, [logs, facilities]);

  useEffect(() => {
    if (activeTab === 'dashboard' && logs.length > 0) {
      handleFetchInsights();
    }
  }, [handleFetchInsights, activeTab, logs.length]);

  // --- CRUD 핵심 로직 (상태 업데이트 안정화) ---

  const handleAddFacility = useCallback((newFacility: Facility) => {
    setFacilities(prev => {
      const updated = [newFacility, ...prev];
      db.saveFacilities(updated);
      return updated;
    });
  }, []);

  const handleAddLog = useCallback((data: Partial<InspectionLog>) => {
    if (data.id) {
      // 수정
      setLogs(prev => {
        const updated = prev.map(l => l.id === data.id ? { ...l, ...data } as InspectionLog : l);
        db.saveLogs(updated);
        return updated;
      });
    } else {
      // 신규 등록
      const newLog: InspectionLog = {
        id: `LOG-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        facilityId: data.facilityId || (facilities[0]?.id || 'F1'),
        complexFacilityId: data.complexFacilityId || '',
        type: data.type || InspectionType.PLANNED,
        severity: data.severity || SeverityLevel.LOW,
        status: data.status || LogStatus.ACTIVE,
        x: data.x || 50,
        y: data.y || 50,
        description: data.description || '',
        timestamp: new Date().toISOString(),
        leadTimeHours: 4,
        responder: '현장 대응팀',
        distanceToResponder: '150m'
      };
      setLogs(prev => {
        const updated = [newLog, ...prev];
        db.saveLogs(updated);
        return updated;
      });
    }
  }, [facilities]);

  const handleDeleteLog = useCallback((id: string) => {
    setLogs(prev => {
      const updated = prev.filter(l => l.id !== id);
      db.saveLogs(updated);
      return updated;
    });
    setIsLogModalOpen(false);
  }, []);

  const handleAddOrEditItem = useCallback((data: Partial<InspectionItem>) => {
    if (data.id) {
      setInspectionItems(prev => {
        const updated = prev.map(item => item.id === data.id ? { ...item, ...data } as InspectionItem : item);
        db.saveInspectionItems(updated);
        return updated;
      });
    } else {
      const newItem: InspectionItem = {
        id: `ITEM-${Date.now()}`,
        classification: data.classification || '정기점검',
        target: data.target || '',
        cycle: data.cycle || '',
        remarks: data.remarks || ''
      };
      setInspectionItems(prev => {
        const updated = [...prev, newItem];
        db.saveInspectionItems(updated);
        return updated;
      });
    }
    setIsItemModalOpen(false);
    setSelectedItem(undefined);
  }, []);

  const handleDeleteItem = useCallback((id: string) => {
    if (confirm("해당 점검 계획을 영구적으로 삭제하시겠습니까?")) {
      setInspectionItems(prev => {
        const updated = prev.filter(item => item.id !== id);
        db.saveInspectionItems(updated);
        return updated;
      });
    }
  }, []);

  // --- 이벤트 핸들러 ---
  const handleEditItemRequest = (item: InspectionItem) => {
    setSelectedItem(item);
    setIsItemModalOpen(true);
  };

  const handleMapClick = useCallback((x: number, y: number) => {
    setSelectedLog({ x, y, status: LogStatus.ACTIVE });
    setIsLogModalOpen(true);
  }, []);

  const handlePointClick = useCallback((log: InspectionLog) => {
    setSelectedLog(log);
    setIsLogModalOpen(true);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#fcfcfd]">
      <nav className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-10">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-600 p-2 rounded-xl shadow-[0_0_20px_rgba(79,70,229,0.4)]">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-black tracking-tighter text-white leading-none">SAFELINK AI</h1>
                <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-[0.2em] leading-none mt-1">Intelligent Tactical Control</p>
              </div>
            </div>

            <div className="hidden md:flex items-center bg-slate-800/50 p-1.5 rounded-2xl border border-slate-700">
              <button 
                onClick={() => setActiveTab('dashboard')}
                className={`flex items-center gap-2 px-6 py-2 rounded-xl text-[11px] font-black transition-all tracking-widest uppercase ${activeTab === 'dashboard' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
              >
                <LayoutDashboard className="w-4 h-4" /> 실시간 관제
              </button>
              <button 
                onClick={() => setActiveTab('compliance')}
                className={`flex items-center gap-2 px-6 py-2 rounded-xl text-[11px] font-black transition-all tracking-widest uppercase ${activeTab === 'compliance' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
              >
                <Building2 className="w-4 h-4" /> 의료서비스센터 관리
              </button>
              <button 
                onClick={() => setActiveTab('performance')}
                className={`flex items-center gap-2 px-6 py-2 rounded-xl text-[11px] font-black transition-all tracking-widest uppercase ${activeTab === 'performance' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
              >
                <Target className="w-4 h-4" /> 성과관리(KPI)
              </button>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => db.resetAll()}
              className="p-2.5 text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded-xl transition-all border border-slate-700 group"
              title="데이터베이스 리셋"
            >
              <DatabaseZap className="w-5 h-5 group-hover:animate-pulse" />
            </button>
            <button className="p-2.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all relative border border-slate-700">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-slate-900"></span>
            </button>
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <TopKpiBar safetyScore={safetyScore} dDayCount={dDayUrgentCount} preventiveRatio={preventiveRatio} />
            
            <div className="relative">
              <HotSpotMap logs={logs} onMapClick={handleMapClick} onPointClick={handlePointClick} />
              <button 
                onClick={() => { setSelectedLog({ x: 50, y: 50, status: LogStatus.ACTIVE }); setIsLogModalOpen(true); }}
                className="absolute top-6 right-6 bg-white hover:bg-slate-50 text-slate-900 px-5 py-3 rounded-2xl text-[11px] font-black flex items-center gap-2 shadow-2xl z-30 transition-transform active:scale-95 border border-slate-200 uppercase tracking-widest"
              >
                <Plus className="w-4 h-4" /> 위험 마커 등록
              </button>
            </div>
            
            <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-[0_20px_40px_-12px_rgba(0,0,0,0.05)] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-50/40 rounded-full -mr-20 -mt-20 blur-3xl"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-10">
                  <div className="flex items-center gap-5">
                    <div className="p-4 bg-slate-900 rounded-[1.5rem] shadow-2xl"><Sparkles className="w-7 h-7 text-indigo-400" /></div>
                    <div>
                      <h3 className="text-2xl font-black text-slate-900 tracking-tight">AI 전술 분석 보고</h3>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em] mt-1">지능형 위험 예측 엔진 v4.2</p>
                    </div>
                  </div>
                  <button 
                    onClick={handleFetchInsights}
                    disabled={isLoadingInsights}
                    className="text-[11px] bg-slate-900 hover:bg-black text-white font-black px-6 py-3 rounded-2xl transition-all disabled:opacity-50 shadow-2xl uppercase tracking-widest"
                  >
                    {isLoadingInsights ? <Loader2 className="w-4 h-4 animate-spin" /> : '현장 안전 진단 실행'}
                  </button>
                </div>
                <div className="text-sm leading-relaxed text-slate-600 bg-slate-50 p-8 rounded-[2rem] border border-slate-100 min-h-[140px] shadow-inner">
                  {isLoadingInsights ? (
                    <div className="space-y-4 animate-pulse">
                      <div className="h-3.5 bg-slate-200 rounded-full w-full"></div>
                      <div className="h-3.5 bg-slate-200 rounded-full w-11/12"></div>
                      <div className="h-3.5 bg-slate-200 rounded-full w-10/12"></div>
                    </div>
                  ) : (
                    <div className="whitespace-pre-line font-medium text-base leading-[1.8] tracking-tight">{aiInsights || "시스템 데이터 분석 중입니다. 잠시만 기다려주세요."}</div>
                  )}
                </div>
              </div>
            </div>

            <AnalyticsCharts monthlyRatioData={monthlyStats} />
          </div>
        )}

        {activeTab === 'compliance' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-12">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">의료서비스센터 관리</h2>
                <p className="text-sm text-slate-400 font-bold uppercase tracking-widest mt-1">센터 내 시설물별 법정 검사 이행 및 정밀 유지보수 현황</p>
              </div>
              <div className="flex gap-4">
                <button 
                  onClick={() => { setSelectedItem(undefined); setIsItemModalOpen(true); }}
                  className="flex items-center gap-2 bg-white border border-slate-200 text-slate-900 px-6 py-3.5 rounded-2xl text-sm font-black hover:bg-slate-50 transition-all shadow-xl shadow-slate-100"
                >
                  <ClipboardList className="w-5 h-5 text-indigo-500" /> 점검항목 등록
                </button>
                <button 
                  onClick={() => setIsComplianceModalOpen(true)}
                  className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3.5 rounded-2xl text-sm font-black hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100"
                >
                  <ShieldPlus className="w-5 h-5" /> 자산 신규 등록
                </button>
              </div>
            </div>
            
            <section>
              <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-3">
                <div className="w-2 h-8 bg-indigo-600 rounded-full"></div>
                법정 검사 대상 리스트
              </h3>
              <StatutoryAlertList 
                facilities={facilities} 
                fullWidth={true}
                onAction={(facility) => { 
                  setSelectedLog({ facilityId: facility.id, x: 50, y: 50, status: LogStatus.ACTIVE }); 
                  setIsLogModalOpen(true); 
                }} 
              />
            </section>

            <section>
               <h3 className="text-xl font-black text-slate-800 mb-2 flex items-center gap-3">
                <div className="w-2 h-8 bg-amber-500 rounded-full"></div>
                시설물 및 각종 설비 유지관리 점검 계획
              </h3>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-6 ml-5">Safety and Maintenance Protocols based on Facility Standards</p>
              <InspectionItemTable 
                items={inspectionItems} 
                onEdit={handleEditItemRequest}
                onDelete={handleDeleteItem}
              />
            </section>
          </div>
        )}

        {activeTab === 'performance' && (
          <PerformanceManagement />
        )}
      </main>

      {isLogModalOpen && (
        <LogModal 
          isOpen={isLogModalOpen} 
          onClose={() => setIsLogModalOpen(false)} 
          onSubmit={handleAddLog} 
          onDelete={handleDeleteLog}
          initialData={selectedLog}
          facilities={facilities}
        />
      )}

      {isComplianceModalOpen && (
        <ComplianceFormModal
          isOpen={isComplianceModalOpen}
          onClose={() => setIsComplianceModalOpen(false)}
          onSubmit={handleAddFacility}
        />
      )}

      {isItemModalOpen && (
        <InspectionItemModal
          isOpen={isItemModalOpen}
          onClose={() => { setIsItemModalOpen(false); setSelectedItem(undefined); }}
          onSubmit={handleAddOrEditItem}
          initialData={selectedItem}
        />
      )}
    </div>
  );
};

export default App;
