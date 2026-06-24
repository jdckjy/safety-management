
import React, { useState, useMemo, useRef } from 'react';
import { useProjectData } from '@/providers/ProjectDataProvider';
import { RentalHistory, Unit, EnrichedUnit, TenantInfo, Contract } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { PlusCircle, Upload, ChevronRight, RotateCw, AlertTriangle, ArrowUpRight, ArrowDownRight, TrendingUp, Star, Award } from 'lucide-react';
import RentalHistoryModal from '@/components/RentalHistoryModal';
import InteractiveFloorPlan from '@/components/InteractiveFloorPlan';
import * as XLSX from 'xlsx';
import { initialRentalHistory } from '@/data/initial-rental-history';

interface SimulationChanges {
    leasedAreaChange: number;
    rentableAreaChange: number;
}

const LeaseStatusSummaryPage: React.FC = () => {
  const {
    rentalHistory, 
    units, 
    tenantInfo, 
    contracts, 
    addRentalHistory, 
    updateRentalHistory, 
    setRentalHistory,
    leaseKpiMetrics,
    leaseRealtimeMetrics
  } = useProjectData();
  
  const [simulationChanges, setSimulationChanges] = useState<SimulationChanges>({ leasedAreaChange: 0, rentableAreaChange: 0 });
  const [simulatedOccupiedIds, setSimulatedOccupiedIds] = useState<Set<string>>(new Set());
  const [simulatedVacantIds, setSimulatedVacantIds] = useState<Set<string>>(new Set());
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedHistory, setSelectedHistory] = useState<RentalHistory | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const enrichedUnits = useMemo((): EnrichedUnit[] => {
    if (!units || !tenantInfo || !contracts) return [];
    const tenantInfoById = new Map<string, TenantInfo>(tenantInfo.map(t => [t.id, t]));
    const contractByUnitId = new Map<string, Contract>(contracts.map(c => [c.unitId!, c]));
    return units.map(unit => {
      const contract = contractByUnitId.get(unit.id);
      const tenant = contract ? tenantInfoById.get(contract.tenantId) : undefined;
      return { ...unit, tenant, contract };
    });
  }, [units, tenantInfo, contracts]);
  
  const currentRentalHistory = useMemo(() => {
    if (rentalHistory && rentalHistory.length > 0) {
      return rentalHistory;
    }
    return initialRentalHistory;
  }, [rentalHistory]);

  const displayHistory = useMemo(() => currentRentalHistory.filter(h => h.year !== 2021).sort((a, b) => b.year - a.year), [currentRentalHistory]);

  const handleOpenModal = (history: RentalHistory | null) => { setSelectedHistory(history); setIsModalOpen(true); };
  const handleCloseModal = () => { setIsModalOpen(false); setSelectedHistory(null); };

  const handleSubmitHistory = (data: Omit<RentalHistory, 'id' | 'created_at'>) => {
    const occupancy_rate = (data.leased_area / data.rentable_area) * 100;
    if (selectedHistory) {
      updateRentalHistory({ ...selectedHistory, ...data, occupancy_rate });
    } else {
      addRentalHistory({ ...data, occupancy_rate });
    }
    handleCloseModal();
  };

  const handleUploadButtonClick = () => fileInputRef.current?.click();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json<any>(worksheet);
        const newHistory: RentalHistory[] = json.map((row, index) => ({
          id: `excel-${Date.now()}-${index}`,
          year: row.year,
          rentable_area: row.rentable_area,
          leased_area: row.leased_area,
          occupancy_rate: (row.leased_area / row.rentable_area) * 100,
          created_at: new Date().toISOString(),
        }));
        setRentalHistory([...rentalHistory, ...newHistory]);
      };
      reader.readAsArrayBuffer(file);
    }
    event.target.value = '';
  };

  const handleUnitClick = (unit: Unit) => {
    const newOccupiedIds = new Set(simulatedOccupiedIds);
    const newVacantIds = new Set(simulatedVacantIds);
    let areaChange = 0;
    if (newOccupiedIds.has(unit.id)) { newOccupiedIds.delete(unit.id); areaChange = -unit.area_sqm; }
    else if (newVacantIds.has(unit.id)) { newVacantIds.delete(unit.id); areaChange = unit.area_sqm; }
    else if (unit.status === 'vacant') { newOccupiedIds.add(unit.id); areaChange = unit.area_sqm; }
    else { newVacantIds.add(unit.id); areaChange = -unit.area_sqm; }
    setSimulatedOccupiedIds(newOccupiedIds);
    setSimulatedVacantIds(newVacantIds);
    setSimulationChanges(prev => ({ ...prev, leasedAreaChange: prev.leasedAreaChange + areaChange }));
    setLastUpdated(new Date());
  };

  const resetSimulation = () => {
      setSimulationChanges({ leasedAreaChange: 0, rentableAreaChange: 0 });
      setSimulatedOccupiedIds(new Set());
      setSimulatedVacantIds(new Set());
      setLastUpdated(new Date());
  };

  const simulationResult = useMemo(() => {
    if (!leaseRealtimeMetrics || !leaseKpiMetrics) return { rate: 0, finalScore: 0, scoreForBar: 0, rating: 0, weight: 2.5 };
    
    const simulatedLeasedArea = leaseRealtimeMetrics.totalLeasedArea + simulationChanges.leasedAreaChange;
    const simulatedRentableArea = leaseRealtimeMetrics.totalRentableArea + simulationChanges.rentableAreaChange;
    if (simulatedRentableArea === 0) return { rate: 0, finalScore: 0, scoreForBar: 0, rating: 0, weight: 2.5 };
    
    const rate = (simulatedLeasedArea / simulatedRentableArea) * 100;
    const { targetLow, targetHigh } = leaseKpiMetrics;

    let scoreForBar = 0;
    if (targetHigh > targetLow) {
      scoreForBar = ((rate - targetLow) / (targetHigh - targetLow)) * 100;
    } else if (rate >= targetHigh) {
      scoreForBar = 100;
    }
    scoreForBar = Math.max(0, Math.min(100, scoreForBar));

    let rating = 20 + (scoreForBar / 100) * 80;
    rating = Math.max(20, Math.min(100, rating));

    const weight = 2.5;
    const finalScore = (rating / 100) * weight;

    return { rate, finalScore, scoreForBar, rating, weight };
  }, [leaseKpiMetrics, leaseRealtimeMetrics, simulationChanges]);


  return (
    <div className="bg-slate-50 p-4 font-sans">
       <main className="grid flex-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-1 flex flex-col gap-4">
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-bold text-slate-800">임대율 실적 관리</CardTitle>
               <div className="flex space-x-2">
                  <Button size="sm" variant="outline" onClick={() => handleOpenModal(null)}><PlusCircle className="mr-2 h-4 w-4"/>신규 추가</Button>
                  <Button size="sm" variant="outline" onClick={handleUploadButtonClick}><Upload className="mr-2 h-4 w-4"/>엑셀 업로드</Button>
                  <input type="file" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" />
              </div>
            </CardHeader>
            <CardContent className='p-2'>
                <Table>
                  <TableHeader className="bg-slate-100">
                    <TableRow>
                      <TableHead className="w-1/3 font-semibold text-slate-600 text-sm h-8">연도</TableHead>
                      <TableHead className="font-semibold text-slate-600 text-sm h-8">연도별 임대율</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leaseRealtimeMetrics && (
                      <TableRow className="border-l-4 border-blue-500 bg-blue-50 font-bold">
                        <TableCell className="py-1 text-sm">2026 (현재)</TableCell>
                        <TableCell className="py-1 text-sm">{leaseRealtimeMetrics.realtimeOccupancyRate.toFixed(3)}%</TableCell>
                      </TableRow>
                    )}
                    {displayHistory.map((item) => (
                      <TableRow key={item.id} onClick={() => handleOpenModal(item)} className="cursor-pointer hover:bg-slate-50">
                        <TableCell className="py-1 text-sm">{item.year}</TableCell>
                        <TableCell className="py-1 text-sm">
                          <div className='flex items-center gap-3'>
                              <span>{item.occupancy_rate.toFixed(3)}%</span>
                              <div className='w-full bg-slate-200 rounded-full h-1.5'>
                                  <div className='bg-slate-400 h-1.5 rounded-full' style={{width: `${item.occupancy_rate}%`}}></div>
                              </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
              <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-bold text-slate-800">핵심 성과 지표 (KPI)</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-1 p-2">
                 <div className='p-2 bg-green-50 rounded-lg flex items-center justify-between'>
                      <div className='flex items-center gap-2'>
                          <ArrowUpRight className='w-5 h-5 text-green-600' />
                          <span className='font-semibold text-sm text-green-800'>최고목표</span>
                      </div>
                      <span className='text-base font-bold text-green-700'>{leaseKpiMetrics?.targetHigh.toFixed(3)}%</span>
                 </div>
                 <div className='p-2 bg-amber-50 rounded-lg flex items-center justify-between'>
                      <div className='flex items-center gap-2'>
                          <ArrowDownRight className='w-5 h-5 text-amber-600' />
                          <span className='font-semibold text-sm text-amber-800'>최저목표</span>
                      </div>
                      <span className='text-base font-bold text-amber-700'>{leaseKpiMetrics?.targetLow.toFixed(3)}%</span>
                 </div>
                 <div className='p-2 bg-blue-50 rounded-lg flex items-center justify-between'>
                      <div className='flex items-center gap-2'>
                          <TrendingUp className='w-5 h-5 text-blue-600' />
                          <span className='font-semibold text-sm text-blue-800'>현임대율</span>
                      </div>
                      <span className='text-base font-bold text-blue-700'>{leaseRealtimeMetrics?.realtimeOccupancyRate.toFixed(3)}%</span>
                 </div>
                 <div className='p-2 bg-violet-50 rounded-lg flex items-center justify-between'>
                      <div className='flex items-center gap-2'>
                          <Star className='w-5 h-5 text-violet-600' />
                          <span className='font-semibold text-sm text-violet-800'>평점</span>
                      </div>
                      <span className='text-base font-bold text-violet-700'>{simulationResult?.rating.toFixed(3)}</span>
                 </div>
                 <div className='p-2 bg-indigo-50 rounded-lg flex items-center justify-between'>
                      <div className='flex items-center gap-2'>
                          <Award className='w-5 h-5 text-indigo-600' />
                          <span className='font-semibold text-sm text-indigo-800'>환산점수</span>
                      </div>
                      <span className='text-base font-bold text-indigo-700'>{simulationResult?.finalScore.toFixed(3)}</span>
                 </div>
              </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 flex flex-col gap-4">
          {enrichedUnits && 
              <InteractiveFloorPlan 
                  units={enrichedUnits}
                  simulatedOccupiedIds={simulatedOccupiedIds}
                  simulatedVacantIds={simulatedVacantIds}
                  onUnitClick={handleUnitClick}
                  className="flex-grow"
              />
          }
           <Card className="shadow-lg border border-slate-200/80 bg-white">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div>
                      <CardTitle className="text-lg font-bold text-slate-800">시뮬레이션 최종 결과</CardTitle>
                      <p className="text-xs text-slate-500 pt-1">마지막 업데이트: {lastUpdated.toLocaleTimeString()}</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={resetSimulation}><RotateCw className="h-5 w-5 text-slate-500" /></Button>
              </CardHeader>
              <CardContent className="flex items-center justify-evenly text-center p-3 gap-3">
                  <div className="w-full md:w-1/4">
                      <p className="text-sm font-semibold text-slate-600 mb-1">시뮬레이션 요약</p>
                      <div className="flex justify-center items-center gap-2">
                          <div className="text-green-600 bg-green-100/80 font-bold text-xs px-2 py-1 rounded-md">+{simulatedOccupiedIds.size} 유닛 (입주)</div>
                           <div className="text-amber-600 bg-amber-100/80 font-bold text-xs px-2 py-1 rounded-md">-{simulatedVacantIds.size} 유닛 (퇴거)</div>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">면적(㎡): <span className='font-semibold'>{simulationChanges.leasedAreaChange.toFixed(2)}</span></p>
                  </div>
                  <ChevronRight className="text-slate-300 hidden md:block" size={28} />
                  <div className="w-full md:w-1/2 text-center">
                      <p className="text-sm font-semibold text-slate-600">예상 임대율</p>
                      <div className='flex items-end justify-center gap-1'>
                          <p className="text-4xl font-bold tracking-tighter text-[#1A4F95]">{simulationResult?.rate.toFixed(3)}</p>
                          <span className='text-xl font-medium text-slate-500 mb-1'>%</span>
                      </div>
                  </div>
                  <ChevronRight className="text-slate-300 hidden md:block" size={28} />
                  <div className="w-full md:w-1/3">
                      <p className="text-sm font-semibold text-slate-600 mb-1">예상 최종 득점</p>
                      <p className="text-3xl font-bold tracking-tighter text-indigo-600">{simulationResult?.finalScore.toFixed(3)}</p>
                      <div className="text-xs text-slate-500 mt-1 space-x-1">
                          <span>(평점: {simulationResult?.rating.toFixed(2)}점</span>
                          <span>/ 가중치: {simulationResult?.weight.toFixed(1)})</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2">
                          <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: `${simulationResult?.scoreForBar ?? 0}%` }}></div>
                      </div>
                  </div>
              </CardContent>
          </Card>
        </div>
        
        {!leaseKpiMetrics && (
            <div className="lg:col-span-3">
              <Card className="border-amber-400 bg-amber-50/50 mt-4">
                  <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-2">
                      <AlertTriangle className="w-5 h-5 text-amber-500"/>
                      <CardTitle className="text-amber-700 text-base font-bold">임대율 실적 데이터 부족</CardTitle>
                  </CardHeader>
                  <CardContent>
                      <p className="text-sm text-amber-600">
                          KPI를 계산하기 위한 과거 임대율 실적 데이터가 부족합니다.
                          '임대율 실적 관리' 패널에서 '신규 추가' 또는 '엑셀 업로드'를 통해 최소 1년 치의 데이터를 입력해주세요.
                      </p>
                  </CardContent>
              </Card>
            </div>
        )}
       </main>
      <RentalHistoryModal 
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmitHistory}
        initialData={selectedHistory}
      />
    </div>
  );
};

export default LeaseStatusSummaryPage;
