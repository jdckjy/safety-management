import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useProjectData } from '@/providers/ProjectDataProvider';
import { RentalHistory, Unit } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LineChart, BarChart, ResponsiveContainer, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Area, Cell } from 'recharts';
import { PlusCircle, Upload, ChevronsRight, RotateCw } from 'lucide-react';
import RentalHistoryModal from '@/components/RentalHistoryModal';
import InteractiveFloorPlan from '@/components/InteractiveFloorPlan';
import * as XLSX from 'xlsx';

const CustomLineChartTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-2.5 bg-white border rounded-lg shadow-lg border-slate-200/80">
        <p className="text-xs font-bold text-slate-600">{label}년</p>
        <p className="text-sm font-semibold tracking-tighter" style={{ color: 'hsl(244 84% 60%)' }}>
          {`${payload[0].value.toFixed(3)}%`}
        </p>
      </div>
    );
  }
  return null;
};

const CustomBarChartTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-2.5 bg-white border rounded-lg shadow-lg border-slate-200/80">
        <p className="text-xs font-bold text-slate-600">{label}</p>
        <p className="text-sm font-semibold tracking-tighter" style={{ color: payload[0].payload.fill }}>
          {`${payload[0].value.toFixed(3)}%`}
        </p>
      </div>
    );
  }
  return null;
};

interface KpiMetrics {
  baseline: number;
  stdDev: number;
  targetHigh: number;
  targetLow: number;
  score: number;
  weightedScore: number;
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
  const { rentalHistory, units, addRentalHistory, updateRentalHistory, setRentalHistory } = useProjectData();
  const [kpi, setKpi] = useState<KpiMetrics | null>(null);
  const [simulationInput, setSimulationInput] = useState({ newLeaseArea: 0, areaReduction: 0 });
  
  const [simulationChanges, setSimulationChanges] = useState<SimulationChanges>({ leasedAreaChange: 0, rentableAreaChange: 0 });
  const [simulatedOccupiedIds, setSimulatedOccupiedIds] = useState<Set<string>>(new Set());
  const [simulatedVacantIds, setSimulatedVacantIds] = useState<Set<string>>(new Set());

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedHistory, setSelectedHistory] = useState<RentalHistory | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    
    const currentRealtimeRate = realtimeRate;
    let score = 20 + ((currentRealtimeRate - targetLow) / (targetHigh - targetLow)) * 80;
    if (isNaN(score) || score > 100) score = 100;
    else if (score < 20) score = 20;

    const weightedScore = (score / 100) * 2.5;
    
    return { baseline, stdDev, targetHigh, targetLow, score, weightedScore, currentRealtimeRate };
  };

  useEffect(() => {
    if (rentalHistory && realtimeMetrics) {
        setKpi(calculateKpiMetrics(rentalHistory, realtimeMetrics.realtimeOccupancyRate));
    }
  }, [rentalHistory, realtimeMetrics]);

  const displayHistory = useMemo(() => {
    return rentalHistory.filter(h => h.year !== 2021).sort((a, b) => b.year - a.year);
  }, [rentalHistory]);

  const barChartData = useMemo(() => {
    if (!kpi) return [];
    
    const colors = {
      targetLow: 'hsl(220 13% 80%)',    
      current: 'hsl(244 84% 60%)',     
      baseline: 'hsl(220 14% 65%)',    
      targetHigh: 'hsl(142 71% 45%)',   
    };

    return [
        { name: '최저목표', value: kpi.targetLow, fill: colors.targetLow },
        { name: '현재실적', value: kpi.currentRealtimeRate, fill: colors.current },
        { name: '기준치', value: kpi.baseline, fill: colors.baseline },
        { name: '최고목표', value: kpi.targetHigh, fill: colors.targetHigh }
    ];
  }, [kpi]);

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

  const handleSimulationInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSimulationInput(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
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
      setSimulationInput({ newLeaseArea: 0, areaReduction: 0 });
      setSimulationChanges({ leasedAreaChange: 0, rentableAreaChange: 0 });
      setSimulatedOccupiedIds(new Set());
      setSimulatedVacantIds(new Set());
  };

  const simulationResult = useMemo(() => {
    if (!kpi || !realtimeMetrics) return null;

    const totalSimulatedLeasedArea = realtimeMetrics.totalLeasedArea + simulationInput.newLeaseArea + simulationChanges.leasedAreaChange;
    const totalSimulatedRentableArea = realtimeMetrics.totalRentableArea + simulationInput.areaReduction + simulationChanges.rentableAreaChange;

    let simulatedRate = 0;
    if (totalSimulatedRentableArea > 0) {
        simulatedRate = (totalSimulatedLeasedArea / totalSimulatedRentableArea) * 100;
    }

    let simulatedScore = 20 + ((simulatedRate - kpi.targetLow) / (kpi.targetHigh - kpi.targetLow)) * 80;
    if (isNaN(simulatedScore) || simulatedScore > 100) simulatedScore = 100;
    if (simulatedScore < 20) simulatedScore = 20;

    return {
        rate: simulatedRate,
        score: simulatedScore,
        finalScore: (simulatedScore / 100) * 2.5,
    };
}, [kpi, realtimeMetrics, simulationInput, simulationChanges]);


  const kpiCards = [
    { title: "현재 임대율", value: kpi?.currentRealtimeRate.toFixed(3) + '%' },
    { title: "2026년 기준치", value: kpi?.baseline.toFixed(3) + '%' },
    { title: "2026년 최고목표", value: kpi?.targetHigh.toFixed(3) + '%' },
    { title: "2026년 최저목표", value: kpi?.targetLow.toFixed(3) + '%' },
    { title: "현재 평점", value: kpi?.score.toFixed(3) + '점' },
    { title: "최종 득점", value: kpi?.weightedScore.toFixed(3) + '점' },
  ];
  
  return (
    <div className="space-y-6 p-1">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
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
                    <TableHead>임대가능면적(㎡)</TableHead>
                    <TableHead>임대계약면적(㎡)</TableHead>
                    <TableHead>임대율(%)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                   {realtimeMetrics && (
                    <TableRow className="bg-blue-50 font-semibold">
                      <TableCell>2026 (현재)</TableCell>
                      <TableCell>{realtimeMetrics.totalRentableArea.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                      <TableCell>{realtimeMetrics.totalLeasedArea.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                      <TableCell>{realtimeMetrics.realtimeOccupancyRate.toFixed(3)}</TableCell>
                    </TableRow>
                  )}
                  {displayHistory.map((item) => (
                    <TableRow key={item.id} onClick={() => handleOpenModal(item)} className="cursor-pointer hover:bg-slate-50">
                      <TableCell>{item.year}</TableCell>
                      <TableCell>{item.rentable_area.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                      <TableCell>{item.leased_area.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                      <TableCell>{item.occupancy_rate.toFixed(3)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
            <Tabs defaultValue="dashboard">
                <TabsList className="w-full grid-cols-3">
                    <TabsTrigger value="dashboard">KPI 대시보드</TabsTrigger>
                    <TabsTrigger value="simulation">숫자 시뮬레이션</TabsTrigger>
                    <TabsTrigger value="floorplan-sim">도면 시뮬레이션</TabsTrigger> 
                </TabsList>
                <TabsContent value="dashboard">
                    <CardContent className="space-y-6 pt-6">
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 text-center">
                            {kpiCards.map(card => (
                                <Card key={card.title}>
                                    <CardHeader className="p-2 pb-0"><CardTitle className="text-sm font-medium text-slate-500">{card.title}</CardTitle></CardHeader>
                                    <CardContent className="p-2"><p className="text-2xl font-bold text-slate-800">{card.value}</p></CardContent>
                                </Card>
                            ))}
                        </div>
                         <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 h-80">
                            <Card>
                                <CardHeader><CardTitle className="text-base font-semibold text-slate-700">연도별 임대율 추이</CardTitle></CardHeader>
                                <CardContent>
                                    <ResponsiveContainer width="100%" height={250}>
                                        <LineChart 
                                            data={[...rentalHistory].filter(h => h.year !== 2021).sort((a, b) => a.year - b.year)}
                                            margin={{ top: 10, right: 25, left: -15, bottom: 0 }}
                                        >
                                            <defs>
                                                <linearGradient id="occupancyGradient" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="hsl(244 84% 60%)" stopOpacity={0.2}/>
                                                    <stop offset="95%" stopColor="hsl(244 84% 60%)" stopOpacity={0}/>
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(220 13% 94%)" />
                                            <XAxis 
                                                dataKey="year" 
                                                tickLine={false}
                                                axisLine={false}
                                                tick={{ fontSize: 12, fill: 'hsl(220 10% 55%)' }}
                                                tickMargin={8}
                                            />
                                            <YAxis 
                                                domain={[60, 'dataMax + 2']}
                                                tickLine={false}
                                                axisLine={false}
                                                tick={{ fontSize: 12, fill: 'hsl(220 10% 55%)' }}
                                                tickFormatter={(value) => `${value}%`}
                                            />
                                            <Tooltip 
                                                cursor={{ stroke: 'hsl(220 13% 91%)', strokeWidth: 1, strokeDasharray: "3 3" }}
                                                content={<CustomLineChartTooltip />} 
                                            />
                                            <Area 
                                                type="monotone" 
                                                dataKey="occupancy_rate" 
                                                stroke="none"
                                                fill="url(#occupancyGradient)" 
                                            />
                                            <Line 
                                                type="monotone" 
                                                dataKey="occupancy_rate" 
                                                name="임대율" 
                                                stroke="hsl(244 84% 60%)"
                                                strokeWidth={2.5}
                                                dot={false}
                                                activeDot={{ r: 5, strokeWidth: 2, }}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                             <Card>
                                <CardHeader><CardTitle className="text-base font-semibold text-slate-700">목표 대비 실적</CardTitle></CardHeader>
                                <CardContent>
                                     <ResponsiveContainer width="100%" height={250}>
                                        <BarChart 
                                            data={barChartData}
                                            margin={{ top: 10, right: 25, left: -15, bottom: 0 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(220 13% 94%)" />
                                            <XAxis 
                                                dataKey="name"
                                                tickLine={false}
                                                axisLine={false}
                                                tick={{ fontSize: 12, fill: 'hsl(220 10% 55%)' }}
                                                tickMargin={8}
                                            />
                                            <YAxis
                                                tickLine={false}
                                                axisLine={false}
                                                tick={{ fontSize: 12, fill: 'hsl(220 10% 55%)' }}
                                                tickFormatter={(value) => `${value}%`}
                                            />
                                            <Tooltip 
                                                cursor={{ fill: 'hsl(220 13% 96%)' }}
                                                content={<CustomBarChartTooltip />} 
                                            />
                                            <Bar dataKey="value" barSize={30} radius={[4, 4, 0, 0]}>
                                                {barChartData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                        </div>
                    </CardContent>
                </TabsContent>
                <TabsContent value="simulation">
                    <CardContent className="space-y-6 pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card>
                                <CardHeader><CardTitle className="text-base">Scenario 1: 임대 면적 변경</CardTitle></CardHeader>
                                <CardContent className="space-y-4">
                                     <div>
                                        <label htmlFor="newLeaseArea" className="text-sm font-medium">신규/퇴거 면적 (㎡)</label>
                                        <Input id="newLeaseArea" name="newLeaseArea" type="number" value={simulationInput.newLeaseArea} onChange={handleSimulationInputChange} placeholder="예: 500 또는 -300" />
                                     </div>
                                </CardContent>
                            </Card>
                             <Card>
                                <CardHeader><CardTitle className="text-base">Scenario 2: 임대가능면적 변경</CardTitle></CardHeader>
                                <CardContent className="space-y-4">
                                     <div>
                                        <label htmlFor="areaReduction" className="text-sm font-medium">면적 증감 (㎡)</label>
                                        <Input id="areaReduction" name="areaReduction" type="number" value={simulationInput.areaReduction} onChange={handleSimulationInputChange} placeholder="예: -1000" />
                                     </div>
                                </CardContent>
                            </Card>
                        </div>
                        <Card className="bg-slate-50/70 border-dashed">
                             <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-lg font-bold text-slate-800">시뮬레이션 최종 결과</CardTitle>
                                <Button variant="outline" size="sm" onClick={resetSimulation}><RotateCw className="mr-2 h-4 w-4"/>초기화</Button>
                            </CardHeader>
                            <CardContent className="flex items-center justify-around text-center p-6">
                                <div>
                                    <p className="text-sm text-gray-500">예상 임대율</p>
                                    <p className="text-3xl font-bold tracking-tighter">{simulationResult?.rate.toFixed(3)}%</p>
                                </div>
                                <ChevronsRight className="text-gray-400 mx-4" size={32} />
                                    <div>
                                    <p className="text-sm text-gray-500">예상 최종 득점</p>
                                    <p className="text-3xl font-bold tracking-tighter text-blue-600">{simulationResult?.finalScore.toFixed(3)}점</p>
                                </div>
                            </CardContent>
                        </Card>
                         <div className="text-xs text-gray-500 pt-4">
                           * 다년도 예측 및 시나리오 비교 차트는 향후 구현될 예정입니다.
                        </div>
                    </CardContent>
                </TabsContent>
                <TabsContent value="floorplan-sim">
                     <CardContent className="pt-6">
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                            <div>
                                {units && 
                                    <InteractiveFloorPlan 
                                        units={units}
                                        simulatedOccupiedIds={simulatedOccupiedIds}
                                        simulatedVacantIds={simulatedVacantIds}
                                        onUnitClick={handleUnitClick}
                                    />
                                }
                            </div>
                            <div className="space-y-6">
                                <Card>
                                    <CardHeader><CardTitle className="text-base">도면 시뮬레이션 요약</CardTitle></CardHeader>
                                    <CardContent>
                                        <div className="flex justify-around text-center">
                                            <div>
                                                <p className="text-sm text-slate-500">시뮬레이션 입주 면적</p>
                                                <p className="text-xl font-bold text-blue-600">+{simulationChanges.leasedAreaChange > 0 ? simulationChanges.leasedAreaChange.toFixed(2) : '0.00'} ㎡</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-slate-500">시뮬레이션 퇴거 면적</p>
                                                <p className="text-xl font-bold text-red-600">{simulationChanges.leasedAreaChange < 0 ? simulationChanges.leasedAreaChange.toFixed(2) : '-0.00'} ㎡</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card className="bg-slate-50/70 border-dashed">
                                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                                        <CardTitle className="text-lg font-bold text-slate-800">시뮬레이션 최종 결과</CardTitle>
                                        <Button variant="outline" size="sm" onClick={resetSimulation}><RotateCw className="mr-2 h-4 w-4"/>초기화</Button>
                                    </CardHeader>
                                    <CardContent className="flex items-center justify-around text-center p-6">
                                        <div>
                                            <p className="text-sm text-gray-500">예상 임대율</p>
                                            <p className="text-3xl font-bold tracking-tighter">{simulationResult?.rate.toFixed(3)}%</p>
                                        </div>
                                        <ChevronsRight className="text-gray-400 mx-4" size={32} />
                                        <div>
                                            <p className="text-sm text-gray-500">예상 최종 득점</p>
                                            <p className="text-3xl font-bold tracking-tighter text-blue-600">{simulationResult?.finalScore.toFixed(3)}점</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </CardContent>
                </TabsContent>
            </Tabs>
        </Card>
      </div>
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
