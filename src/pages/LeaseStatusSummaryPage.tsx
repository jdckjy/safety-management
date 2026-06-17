
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useProjectData } from '@/providers/ProjectDataProvider';
import { RentalHistory, Unit } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LineChart, BarChart, ResponsiveContainer, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { PlusCircle, Upload, ChevronsRight } from 'lucide-react';
import RentalHistoryModal from '@/components/RentalHistoryModal';
import * as XLSX from 'xlsx';

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

const LeaseStatusSummaryPage: React.FC = () => {
  const { rentalHistory, units, addRentalHistory, updateRentalHistory, setRentalHistory } = useProjectData();
  const [kpi, setKpi] = useState<KpiMetrics | null>(null);
  const [simulationInput, setSimulationInput] = useState({ newLeaseArea: 0, areaReduction: 0 });
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

  const simulationResult = useMemo(() => {
    if (!kpi || !rentalHistory || rentalHistory.length === 0) return null;
    const latestYearData = [...rentalHistory].sort((a, b) => b.year - a.year)[0];

    const newTotalLeasedArea1 = latestYearData.leased_area + simulationInput.newLeaseArea;
    const newOccupancyRate1 = (newTotalLeasedArea1 / latestYearData.rentable_area) * 100;
    let newScore1 = 20 + ((newOccupancyRate1 - kpi.targetLow) / (kpi.targetHigh - kpi.targetLow)) * 80;
    if (isNaN(newScore1) || newScore1 > 100) newScore1 = 100;
    if (newScore1 < 20) newScore1 = 20;

    const newRentableArea2 = latestYearData.rentable_area - simulationInput.areaReduction;
    if (newRentableArea2 <= 0) return { scenario1: { rate: newOccupancyRate1, score: newScore1, finalScore: newScore1 * 2.5 }, scenario2: { rate: 0, score: 0, finalScore: 0} };

    const newOccupancyRate2 = (latestYearData.leased_area / newRentableArea2) * 100;
    let newScore2 = 20 + ((newOccupancyRate2 - kpi.targetLow) / (kpi.targetHigh - kpi.targetLow)) * 80;
    if (isNaN(newScore2) || newScore2 > 100) newScore2 = 100;
    if (newScore2 < 20) newScore2 = 20;

    return {
      scenario1: { rate: newOccupancyRate1, score: newScore1, finalScore: (newScore1 / 100) * 2.5 },
      scenario2: { rate: newOccupancyRate2, score: newScore2, finalScore: (newScore2 / 100) * 2.5 },
    };
  }, [kpi, simulationInput, rentalHistory]);

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
                    <TableRow key={item.id} onClick={() => handleOpenModal(item)} className="cursor-pointer">
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
                <TabsList className="w-full grid-cols-2">
                    <TabsTrigger value="dashboard">KPI 대시보드</TabsTrigger>
                    <TabsTrigger value="simulation">시뮬레이션</TabsTrigger>
                </TabsList>
                <TabsContent value="dashboard">
                    <CardContent className="space-y-6 pt-6">
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 text-center">
                            {kpiCards.map(card => (
                                <Card key={card.title}>
                                    <CardHeader className="p-2 pb-0"><CardTitle className="text-sm font-medium">{card.title}</CardTitle></CardHeader>
                                    <CardContent className="p-2"><p className="text-2xl font-bold">{card.value}</p></CardContent>
                                </Card>
                            ))}
                        </div>
                         <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 h-80">
                            <Card>
                                <CardHeader><CardTitle className="text-base">연도별 임대율 추이</CardTitle></CardHeader>
                                <CardContent>
                                    <ResponsiveContainer width="100%" height={250}>
                                        <LineChart data={[...rentalHistory].filter(h => h.year !== 2021).reverse()}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="year" />
                                            <YAxis domain={[0, 100]} />
                                            <Tooltip />
                                            <Legend />
                                            <Line type="monotone" dataKey="occupancy_rate" name="임대율" stroke="#8884d8" />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                             <Card>
                                <CardHeader><CardTitle className="text-base">목표 대비 실적</CardTitle></CardHeader>
                                <CardContent>
                                     <ResponsiveContainer width="100%" height={250}>
                                        <BarChart data={kpi ? [
                                            { name: '최저목표', value: kpi.targetLow },
                                            { name: '현재실적', value: kpi.currentRealtimeRate },
                                            { name: '기준치', value: kpi.baseline },
                                            { name: '최고목표', value: kpi.targetHigh }
                                        ] : []}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="name" />
                                            <YAxis domain={[0, 100]}/>
                                            <Tooltip />
                                            <Bar dataKey="value" name="임대율" fill="#82ca9d" />
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
                                <CardHeader><CardTitle className="text-base">Scenario 1: 임대율 증가 시</CardTitle></CardHeader>
                                <CardContent className="space-y-4">
                                     <div>
                                        <label htmlFor="newLeaseArea" className="text-sm font-medium">신규 입주면적 (㎡)</label>
                                        <Input id="newLeaseArea" name="newLeaseArea" type="number" value={simulationInput.newLeaseArea} onChange={handleSimulationInputChange} placeholder="예: 500" />
                                     </div>
                                     <div className="flex items-center justify-around text-center p-4 bg-slate-100 rounded-lg">
                                        <div>
                                            <p className="text-sm text-gray-500">예상 임대율</p>
                                            <p className="text-xl font-bold">{simulationResult?.scenario1.rate.toFixed(3)}%</p>
                                        </div>
                                        <ChevronsRight className="text-gray-400" />
                                         <div>
                                            <p className="text-sm text-gray-500">예상 최종 점수</p>
                                            <p className="text-xl font-bold text-blue-600">{simulationResult?.scenario1.finalScore.toFixed(3)}점</p>
                                        </div>
                                     </div>
                                </CardContent>
                            </Card>
                             <Card>
                                <CardHeader><CardTitle className="text-base">Scenario 2: 임대가능면적 축소 시</CardTitle></CardHeader>
                                <CardContent className="space-y-4">
                                     <div>
                                        <label htmlFor="areaReduction" className="text-sm font-medium">면적 증감 (㎡)</label>
                                        <Input id="areaReduction" name="areaReduction" type="number" value={simulationInput.areaReduction} onChange={handleSimulationInputChange} placeholder="예: -1000" />
                                     </div>
                                     <div className="flex items-center justify-around text-center p-4 bg-slate-100 rounded-lg">
                                        <div>
                                            <p className="text-sm text-gray-500">예상 임대율</p>
                                            <p className="text-xl font-bold">{simulationResult?.scenario2.rate.toFixed(3)}%</p>
                                        </div>
                                        <ChevronsRight className="text-gray-400" />
                                         <div>
                                            <p className="text-sm text-gray-500">예상 최종 점수</p>
                                            <p className="text-xl font-bold text-blue-600">{simulationResult?.scenario2.finalScore.toFixed(3)}점</p>
                                        </div>
                                     </div>
                                </CardContent>
                            </Card>
                        </div>
                         <div className="text-xs text-gray-500 pt-4">
                           * 다년도 예측 및 시나리오 비교 차트는 향후 구현될 예정입니다.
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
