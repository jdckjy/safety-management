import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useProjectData } from '@/providers/ProjectDataProvider';
import { RentalHistory, Unit, EnrichedUnit, TenantInfo, Contract } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { PlusCircle, Upload, ChevronsRight, RotateCw, AlertTriangle } from 'lucide-react';
import RentalHistoryModal from '@/components/RentalHistoryModal';
import InteractiveFloorPlan from '@/components/InteractiveFloorPlan';
import * as XLSX from 'xlsx';

interface KpiMetrics {
  baseline: number;
  stdDev: number;
  targetHigh: number;
  targetLow: number;
  currentRealtimeRate: number;
}

interface RealtimeMetrics {
  totalRentableArea: number;
  totalLeasedArea: number;
  realtimeOccupancyRate: number;
}

interface SimulationChanges {
    leasedAreaChange: number;
    rentableAreaChange: number;
}

const LeaseStatusSummaryPage: React.FC = () => {
  const { rentalHistory, units, tenantInfo, contracts, addRentalHistory, updateRentalHistory, setRentalHistory } = useProjectData();
  const [kpi, setKpi] = useState<KpiMetrics | null>(null);
  
  const [simulationChanges, setSimulationChanges] = useState<SimulationChanges>({ leasedAreaChange: 0, rentableAreaChange: 0 });
  const [simulatedOccupiedIds, setSimulatedOccupiedIds] = useState<Set<string>>(new Set());
  const [simulatedVacantIds, setSimulatedVacantIds] = useState<Set<string>>(new Set());

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
      return {
        ...unit,
        tenant,
        contract,
      };
    });
  }, [units, tenantInfo, contracts]);

  const realtimeMetrics = useMemo((): RealtimeMetrics | null => {
    if (!units || units.length === 0) return null;
    
    const totalRentableArea = units.reduce((acc, u) => acc + u.area_sqm, 0);
    const totalLeasedArea = units
      .filter(u => u.status === 'occupied' || u.status === 'notice')
      .reduce((acc, u) => acc + u.area_sqm, 0);
    
    if (totalRentableArea === 0) return { totalRentableArea, totalLeasedArea, realtimeOccupancyRate: 0 };

    const realtimeOccupancyRate = (totalLeasedArea / totalRentableArea) * 100;

    return { totalRentableArea, totalLeasedArea, realtimeOccupancyRate };
  }, [units]);

  const calculateKpiMetrics = (historicalData: RentalHistory[], realtimeRate: number): KpiMetrics | null => {
    const pastData = historicalData.filter(h => h.leased_area > 0).sort((a, b) => b.year - a.year);
    if (pastData.length === 0) return null;

    const baselineData = pastData; 
    const prevYearRate = baselineData.length > 0 ? baselineData[0].occupancy_rate : realtimeRate;
    const lastThreeYears = baselineData.slice(0, 3);
    const avgThreeYears = lastThreeYears.reduce((acc, cur) => acc + cur.occupancy_rate, 0) / lastThreeYears.length;
    
    const baseline = Math.max(prevYearRate, avgThreeYears);
    const rates = baselineData.map(h => h.occupancy_rate);
    const mean = rates.reduce((a, b) => a + b, 0) / rates.length;
    const variance = rates.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / rates.length;
    const stdDev = Math.sqrt(variance);
    
    let targetHigh = baseline + (2 * stdDev);
    if (targetHigh > 100) targetHigh = 100;
    
    let targetLow = baseline - (2 * stdDev);
    if (targetLow < 0) targetLow = 0;
    
    return { baseline, stdDev, targetHigh, targetLow, currentRealtimeRate: realtimeRate };
  };

  useEffect(() => {
    if (rentalHistory && realtimeMetrics) {
        setKpi(calculateKpiMetrics(rentalHistory, realtimeMetrics.realtimeOccupancyRate));
    }
  }, [rentalHistory, realtimeMetrics]);

  const displayHistory = useMemo(() => {
    return rentalHistory.filter(h => h.year !== 2021).sort((a, b) => b.year - a.year);
  }, [rentalHistory]);

  const handleOpenModal = (history: RentalHistory | null) => {
    setSelectedHistory(history);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedHistory(null);
  };

  const handleSubmitHistory = (data: Omit<RentalHistory, 'id' | 'created_at' | 'occupancy_rate'>) => {
    const occupancy_rate = (data.leased_area / data.rentable_area) * 100;
    if (selectedHistory) {
      updateRentalHistory({ ...selectedHistory, ...data, occupancy_rate });
    } else {
      addRentalHistory({ ...data, occupancy_rate, created_at: new Date().toISOString() });
    }
    handleCloseModal();
  };

  const handleUploadButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json: any[] = XLSX.utils.sheet_to_json(worksheet);

        const updatedHistory = [...rentalHistory];
        const existingYears = new Map(updatedHistory.map(h => [h.year, h]));

        json.forEach(row => {
          const { year, rentable_area, leased_area } = row;
          
          if (typeof year !== 'number' || typeof rentable_area !== 'number' || typeof leased_area !== 'number') {
            console.warn('Skipping invalid row:', row);
            return;
          }

          const occupancy_rate = rentable_area > 0 ? (leased_area / rentable_area) * 100 : 0;
          
          if (existingYears.has(year)) {
            const existingRecord = existingYears.get(year)!;
            const recordIndex = updatedHistory.findIndex(h => h.id === existingRecord.id);
            if(recordIndex !== -1) {
              updatedHistory[recordIndex] = {...existingRecord, year, rentable_area, leased_area, occupancy_rate };
            }
          } else {
            const newRecord: RentalHistory = { id: `rh-${year}-${Date.now()}`, year, rentable_area, leased_area, occupancy_rate, created_at: new Date().toISOString() };
            updatedHistory.push(newRecord);
            existingYears.set(year, newRecord);
          }
        });
        
        setRentalHistory(updatedHistory.sort((a,b) => b.year - a.year));
        alert('엑셀 파일이 성공적으로 업로드되었습니다.');

      } catch (error) {
        console.error("Error processing Excel file:", error);
        alert('엑셀 파일 처리 중 오류가 발생했습니다.');
      } finally {
        if(event.target) {
            event.target.value = '';
        }
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleUnitClick = (unit: Unit) => {
      setSimulationChanges(prev => {
          const newChanges = {...prev};
          const newOccupiedIds = new Set(simulatedOccupiedIds);
          const newVacantIds = new Set(simulatedVacantIds);

          if (unit.status === 'vacant') {
              if (newOccupiedIds.has(unit.id)) { // From simulated-occupied back to vacant
                  newChanges.leasedAreaChange -= unit.area_sqm;
                  newOccupiedIds.delete(unit.id);
              } else {
                  newChanges.leasedAreaChange += unit.area_sqm;
                  newOccupiedIds.add(unit.id);
              }
          } else if (unit.status === 'occupied' || unit.status === 'notice') {
              if (newVacantIds.has(unit.id)) { // From simulated-vacant back to occupied
                  newChanges.leasedAreaChange += unit.area_sqm;
                  newVacantIds.delete(unit.id);
              } else {
                  newChanges.leasedAreaChange -= unit.area_sqm;
                  newVacantIds.add(unit.id);
              }
          }

          setSimulatedOccupiedIds(newOccupiedIds);
          setSimulatedVacantIds(newVacantIds);
          return newChanges;
      });
  };

  const resetSimulation = () => {
      setSimulationChanges({ leasedAreaChange: 0, rentableAreaChange: 0 });
      setSimulatedOccupiedIds(new Set());
      setSimulatedVacantIds(new Set());
  };

  const simulationResult = useMemo(() => {
    if (!kpi || !realtimeMetrics) return null;

    const totalSimulatedLeasedArea = realtimeMetrics.totalLeasedArea + simulationChanges.leasedAreaChange;
    const totalSimulatedRentableArea = realtimeMetrics.totalRentableArea + simulationChanges.rentableAreaChange;

    let simulatedRate = 0;
    if (totalSimulatedRentableArea > 0) {
        simulatedRate = (totalSimulatedLeasedArea / totalSimulatedRentableArea) * 100;
    }

    let simulatedScore = 20 + ((simulatedRate - kpi.targetLow) / (kpi.targetHigh - kpi.targetLow)) * 80;
    if (isNaN(simulatedScore) || simulatedScore > 100) simulatedScore = 100;
    if (simulatedScore < 20) simulatedScore = 20;

    const weightedScore = (simulatedScore / 100) * 2.5;

    return {
        rate: simulatedRate,
        score: simulatedScore,
        finalScore: weightedScore,
    };
}, [kpi, realtimeMetrics, simulationChanges]);


  return (
    <div className="p-1">
       <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 lg:grid-cols-3 xl:grid-cols-3">
          <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>임대율 실적 관리</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" onClick={() => handleOpenModal(null)}><PlusCircle className="mr-2 h-4 w-4"/>신규 추가</Button>
                    <Button size="sm" variant="outline" onClick={handleUploadButtonClick}><Upload className="mr-2 h-4 w-4"/>엑셀 업로드</Button>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" />
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>연도</TableHead>
                        <TableHead>임대율(%)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {realtimeMetrics && (
                        <TableRow className="bg-blue-50 font-semibold">
                          <TableCell>2026 (현재)</TableCell>
                          <TableCell>{realtimeMetrics.realtimeOccupancyRate.toFixed(3)}</TableCell>
                        </TableRow>
                      )}
                      {displayHistory.map((item) => (
                        <TableRow key={item.id} onClick={() => handleOpenModal(item)} className="cursor-pointer hover:bg-slate-50">
                          <TableCell>{item.year}</TableCell>
                          <TableCell>{item.occupancy_rate.toFixed(3)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
             <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-base font-semibold">KPI 요약</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="font-semibold">2026 기준치:</div> <div className="text-right">{kpi?.baseline.toFixed(2)}%</div>
                        <div className="font-semibold">2026 최고목표:</div> <div className="text-right text-green-600">{kpi?.targetHigh.toFixed(2)}%</div>
                        <div className="font-semibold">2026 최저목표:</div> <div className="text-right text-red-600">{kpi?.targetLow.toFixed(2)}%</div>
                    </div>
                </CardContent>
            </Card>
          </div>

          <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
            <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-2">
                <div className="lg:col-span-2">
                     {enrichedUnits && 
                        <InteractiveFloorPlan 
                            units={enrichedUnits}
                            simulatedOccupiedIds={simulatedOccupiedIds}
                            simulatedVacantIds={simulatedVacantIds}
                            onUnitClick={handleUnitClick}
                        />
                    }
                </div>
            </div>
             <Card className="bg-slate-50/70 border-dashed border-slate-300">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-lg font-bold text-slate-800">시뮬레이션 최종 결과</CardTitle>
                    <Button variant="outline" size="sm" onClick={resetSimulation}><RotateCw className="mr-2 h-4 w-4"/>초기화</Button>
                </CardHeader>
                <CardContent className="flex flex-col md:flex-row items-center justify-around text-center p-6 space-y-4 md:space-y-0">
                    <div className="md:w-1/3">
                        <p className="text-sm text-slate-500">시뮬레이션 요약</p>
                        <div className="flex justify-center items-baseline space-x-2 mt-1">
                             <p className="text-xl font-bold text-blue-600">+{simulationChanges.leasedAreaChange > 0 ? simulationChanges.leasedAreaChange.toFixed(2) : '0.00'}</p>
                             <p className="text-xl font-bold text-red-600">{simulationChanges.leasedAreaChange < 0 ? simulationChanges.leasedAreaChange.toFixed(2) : '-0.00'}</p>
                        </div>
                        <p className="text-xs text-slate-400">입주/퇴거 면적(㎡)</p>
                    </div>
                    <ChevronsRight className="text-slate-400 hidden md:block" size={32} />
                    <div className="md:w-1/3">
                        <p className="text-sm text-slate-500">예상 임대율</p>
                        <p className="text-4xl font-bold tracking-tighter text-slate-800">{simulationResult?.rate.toFixed(3)}%</p>
                    </div>
                    <ChevronsRight className="text-slate-400 hidden md:block" size={32} />
                    <div className="md:w-1/3">
                        <p className="text-sm text-slate-500">예상 최종 득점</p>
                        <p className="text-4xl font-bold tracking-tighter text-indigo-600">{simulationResult?.finalScore.toFixed(3)}</p>
                    </div>
                </CardContent>
            </Card>
            {!kpi && (
                 <Card className="border-amber-400 bg-amber-50/50">
                    <CardHeader className="flex flex-row items-center space-x-2 pb-2">
                         <AlertTriangle className="w-5 h-5 text-amber-500" />
                        <CardTitle className="text-amber-700 font-semibold text-base">KPI 데이터 부족</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-amber-600">
                           과거 임대율 데이터가 부족하여 KPI 목표 및 점수를 계산할 수 없습니다. 엑셀 업로드 또는 수동 입력을 통해 최소 1년 치의 데이터를 추가해주세요.
                        </p>
                    </CardContent>
                </Card>
            )}
          </div>
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
