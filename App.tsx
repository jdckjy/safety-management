
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

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'compliance' | 'performance'>('dashboard');
  
  // 데이터 상태
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [logs, setLogs] = useState<InspectionLog[]>([]);
  const [inspectionItems, setInspectionItems] = useState<InspectionItem[]>([]);
  
  // 저장 활성화 플래그 (중요: 초기 로딩 완료 후에만 true)
  const [isHydrated, setIsHydrated] = useState(false);

  // 모달 상태
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [isComplianceModalOpen, setIsComplianceModalOpen] = useState(false);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  
  const [selectedLog, setSelectedLog] = useState<Partial<InspectionLog> | undefined>(undefined);
  const [selectedItem, setSelectedItem] = useState<InspectionItem | undefined>(undefined);

  const [aiInsights, setAiInsights] = useState<string>('');
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);

  // 1. 초기 데이터 로드
  useEffect(() => {
    db.init();
    const savedFacilities = db.getFacilities();
    const savedLogs = db.getLogs();
    const savedItems = db.getInspectionItems();
    
    setFacilities(savedFacilities);
    setLogs(savedLogs);
    setInspectionItems(savedItems);
    
    // 상태 업데이트가 완료된 후 하이드레이션 완료 표시
    setTimeout(() => setIsHydrated(true), 100);
  }, []);

  // 2. 저장 로직 (하이드레이션 완료 후에만 데이터 변경 시 저장)
  useEffect(() => {
    if (isHydrated) db.saveFacilities(facilities);
  }, [facilities, isHydrated]);

  useEffect(() => {
    if (isHydrated) db.saveLogs(logs);
  }, [logs, isHydrated]);

  useEffect(() => {
    if (isHydrated) db.saveInspectionItems(inspectionItems);
  }, [inspectionItems, isHydrated]);

  // KPI 계산부
  const dDayUrgentCount = useMemo(() => {
    return facilities.filter(f => {
      try {
        const next = new Date(f.nextInspectionDate);
        if (isNaN(next.getTime())) return false;
        const diff = next.getTime() - new Date().getTime();
        return (diff / (1000 * 60 * 60 * 24)) <= 7;
      } catch (e) { return false; }
    }).length;
  }, [facilities]);

  const preventiveRatio = useMemo(() => {
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
      return { month: `${parseInt(m)}월`, preventive: pCount, reactive: rCount };
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
      setAiInsights("AI 분석 중 오류가 발생했습니다.");
    } finally {
      setIsLoadingInsights(false);
    }
  }, [logs, facilities]);

  useEffect(() => {
    if (activeTab === 'dashboard' && logs.length > 0 && !aiInsights) {
      handleFetchInsights();
    }
  }, [handleFetchInsights, activeTab, logs.length, aiInsights]);

  // 핸들러
  const handleAddLog = (data: Partial<InspectionLog>) => {
    if (data.id) {
      setLogs(prev => prev.map(l => l.id === data.id ? { ...l, ...data } as InspectionLog : l));
    } else {
      const newLog: InspectionLog = {
        id: `LOG-${Date.now()}`,
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
      setLogs(prev => [newLog, ...prev]);
    }
  };

  const handleDeleteLog = (id: string) => {
    setLogs(prev => prev.filter(l => l.id !== id));
    setIsLogModalOpen(false);
    setSelectedLog(undefined);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fcfcfd]">
      <nav className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40 w-full shadow-2xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-10">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-600 p-2 rounded-xl shadow-lg">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-black tracking-tighter text-white uppercase">SAFELINK</h1>
                <p className="text-[9px] text-indigo-400 font-bold uppercase tracking-[0.2em] mt-0.5">Tactical Control</p>
              </div>
            </div>
            <div className="flex items-center bg-slate-800/50 p-1 rounded-xl border border-slate-700">
              <button onClick={() => setActiveTab('dashboard')} className={`flex items-center gap-2 px-5 py-1.5 rounded-lg text-[10px] font-black transition-all uppercase ${activeTab === 'dashboard' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}><LayoutDashboard className="w-3.5 h-3.5" /> 관제</button>
              <button onClick={() => setActiveTab('compliance')} className={`flex items-center gap-2 px-5 py-1.5 rounded-lg text-[10px] font-black transition-all uppercase ${activeTab === 'compliance' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}><Building2 className="w-3.5 h-3.5" /> 시설 관리</button>
              <button onClick={() => setActiveTab('performance')} className={`flex items-center gap-2 px-5 py-1.5 rounded-lg text-[10px] font-black transition-all uppercase ${activeTab === 'performance' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}><Target className="w-3.5 h-3.5" /> 성과지표</button>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => db.resetAll()} className="p-2.5 text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded-xl transition-all border border-slate-700"><DatabaseZap className="w-5 h-5" /></button>
            <button className="p-2.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all relative border border-slate-700"><Bell className="w-5 h-5" /><span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-slate-900"></span></button>
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-7xl mx-auto px-6 py-8 w-full space-y-8 pb-20">
        {!isHydrated ? (
          <div className="h-[60vh] flex flex-col items-center justify-center gap-4 text-slate-400">
            <Loader2 className="w-12 h-12 animate-spin text-indigo-600" />
            <p className="font-black uppercase tracking-widest text-xs">Synchronizing Intelligence...</p>
          </div>
        ) : activeTab === 'dashboard' ? (
          <>
            <TopKpiBar safetyScore={safetyScore} dDayCount={dDayUrgentCount} preventiveRatio={preventiveRatio} />
            <div className="relative group">
              <HotSpotMap 
                logs={logs} 
                onMapClick={(x, y) => { setSelectedLog({ x, y, status: LogStatus.ACTIVE }); setIsLogModalOpen(true); }} 
                onPointClick={(l) => { setSelectedLog(l); setIsLogModalOpen(true); }} 
              />
              <button onClick={() => { setSelectedLog({ x: 50, y: 50, status: LogStatus.ACTIVE }); setIsLogModalOpen(true); }} className="absolute top-8 right-8 bg-white hover:bg-slate-50 text-slate-900 px-6 py-3.5 rounded-2xl text-[11px] font-black flex items-center gap-2 shadow-[0_20px_40px_rgba(0,0,0,0.1)] z-30 transition-transform active:scale-95 border border-slate-200 uppercase tracking-widest"><Plus className="w-4 h-4" /> 위험 등록</button>
            </div>
            <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-xl relative overflow-hidden group hover:border-indigo-100 transition-colors">
              <div className="relative z-10 space-y-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-slate-900 rounded-xl shadow-lg"><Sparkles className="w-6 h-6 text-indigo-400" /></div>
                    <div><h3 className="text-2xl font-black text-slate-900 tracking-tight">AI 전술 분석 보고</h3><p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-0.5">Risk Prediction Engine v4.2</p></div>
                  </div>
                  <button onClick={handleFetchInsights} disabled={isLoadingInsights} className="text-[11px] bg-slate-900 hover:bg-black text-white font-black px-6 py-3 rounded-2xl transition-all disabled:opacity-50 uppercase tracking-widest">{isLoadingInsights ? <Loader2 className="w-4 h-4 animate-spin" /> : '안전 진단 실행'}</button>
                </div>
                <div className="text-sm leading-relaxed text-slate-600 bg-slate-50 p-8 rounded-[2rem] border border-slate-100 shadow-inner min-h-[140px]">{isLoadingInsights ? (<div className="space-y-4 animate-pulse"><div className="h-3 bg-slate-200 rounded-full w-full"></div><div className="h-3 bg-slate-200 rounded-full w-11/12"></div><div className="h-3 bg-slate-200 rounded-full w-4/5"></div></div>) : (<div className="whitespace-pre-line font-medium text-base leading-[1.8] tracking-tight">{aiInsights || "데이터 분석 대기 중..."}</div>)}</div>
              </div>
            </div>
            <AnalyticsCharts monthlyRatioData={monthlyStats} />
          </>
        ) : activeTab === 'compliance' ? (
          <div className="space-y-12 animate-in fade-in duration-500">
            <div className="flex items-end justify-between">
              <div><h2 className="text-3xl font-black text-slate-900 tracking-tight">의료서비스센터 관리</h2><p className="text-sm text-slate-400 font-bold uppercase tracking-widest mt-1">Asset Compliance & Protocol Master</p></div>
              <div className="flex gap-4">
                <button onClick={() => { setSelectedItem(undefined); setIsItemModalOpen(true); }} className="flex items-center gap-2 bg-white border border-slate-200 text-slate-900 px-6 py-3.5 rounded-2xl text-xs font-black hover:bg-slate-50 shadow-sm transition-all"><ClipboardList className="w-4 h-4 text-indigo-500" /> 점검항목 추가</button>
                <button onClick={() => setIsComplianceModalOpen(true)} className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3.5 rounded-2xl text-xs font-black hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all"><ShieldPlus className="w-4 h-4" /> 자산 신규 등록</button>
              </div>
            </div>
            <section className="space-y-6">
              <h3 className="text-xl font-black text-slate-800 flex items-center gap-3"><div className="w-1.5 h-6 bg-indigo-600 rounded-full"></div> 법정 검사 대상 리스트</h3>
              <StatutoryAlertList facilities={facilities} fullWidth={true} onAction={(f) => { setSelectedLog({ facilityId: f.id, x: 50, y: 50, status: LogStatus.ACTIVE }); setIsLogModalOpen(true); }} />
            </section>
            <section className="space-y-4">
               <h3 className="text-xl font-black text-slate-800 flex items-center gap-3"><div className="w-1.5 h-6 bg-amber-500 rounded-full"></div> 시설물 유지관리 점검 계획</h3>
              <InspectionItemTable items={inspectionItems} onEdit={(i) => { setSelectedItem(i); setIsItemModalOpen(true); }} onDelete={(id) => { if(confirm("삭제하시겠습니까?")) setInspectionItems(prev => prev.filter(item => item.id !== id)); }} />
            </section>
          </div>
        ) : (
          <PerformanceManagement />
        )}
      </main>

      {isLogModalOpen && <LogModal isOpen={isLogModalOpen} onClose={() => setIsLogModalOpen(false)} onSubmit={handleAddLog} onDelete={handleDeleteLog} initialData={selectedLog} facilities={facilities} />}
      {isComplianceModalOpen && <ComplianceFormModal isOpen={isComplianceModalOpen} onClose={() => setIsComplianceModalOpen(false)} onSubmit={(f) => setFacilities(prev => [{...f, id: `F${Date.now()}`}, ...prev])} />}
      {isItemModalOpen && <InspectionItemModal isOpen={isItemModalOpen} onClose={() => { setIsItemModalOpen(false); setSelectedItem(undefined); }} onSubmit={(i) => { if (i.id) setInspectionItems(p => p.map(it => it.id === i.id ? {...it, ...i} as InspectionItem : it)); else setInspectionItems(p => [{...i, id: `II${Date.now()}`} as InspectionItem, ...p]); setIsItemModalOpen(false); }} initialData={selectedItem} />}
    </div>
  );
};

export default App;
