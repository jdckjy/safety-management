
import React, { useState, useEffect, useMemo } from 'react';
import { db } from '@/firebase'; // Firestore 인스턴스 가져오기
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Loader2, TrendingUp, Zap, Droplets, Flame, Sun, Recycle, Thermometer, ArrowUp, ArrowDown } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// --- TYPE DEFINITIONS ---
interface UtilityBill {
  id: string;
  billingMonth: string; // "YYYY-MM"
  environmental?: {
    solar_power_generation_kwh: number | null;
    gray_water_usage_m3: number | null;
    avg_monthly_temperature_celsius: number | null;
  };
  electricity: {
    usage: { light_load: number | null; medium_load: number | null; max_load: number | null; total_usage: number | null; };
    charges: { base_charge: number | null; usage_charge: number | null; climate_environment_charge: number | null; fuel_cost_adjustment: number | null; power_factor_charge: number | null; subtotal: number | null; vat: number | null; power_industry_fund: number | null; round_off: number | null; };
    total_billed_amount: number | null;
  };
  water: {
    general: { usage_m3: number | null; base_charge: number | null; water_supply_charge: number | null; sewerage_charge: number | null; sewage_reduction: number | null; total_charge: number | null; };
    fire_hydrant: { usage_m3: number | null; base_charge: number | null; water_supply_charge: number | null; sewerage_charge: number | null; total_charge: number | null; };
  };
  gas: {
    meter_reading_m3: number | null; usage_m3: number | null; unit_price: number | null; usage_charge: number | null; 
  };
  grand_total: number | null;
}

// --- HELPER FUNCTIONS ---
const formatCurrency = (value: number | null | undefined) => {
    if (value === null || value === undefined) return '-';
    return `${Math.round(value).toLocaleString()}원`;
};

const formatNumber = (value: number | null | undefined, unit: string = '') => {
    if (value === null || value === undefined) return '-';
    return `${value.toLocaleString()}${unit}`;
};

const getChange = (current: number | null | undefined, previous: number | null | undefined) => {
    if (current === null || current === undefined || previous === null || previous === undefined || previous === 0) return null;
    return ((current - previous) / previous) * 100;
};


// --- DETAIL SUB COMPONENTS ---

const ElectricityCostDetail: React.FC<{ details: UtilityBill['electricity'] }> = ({ details }) => (
    <div className="space-y-4">
        <div>
            <h4 className="font-semibold text-md mb-2">사용량 (kWh)</h4>
            <Table>
                <TableBody>
                    <TableRow><TableCell>경부하</TableCell><TableCell className="text-right">{formatNumber(details.usage.light_load)}</TableCell></TableRow>
                    <TableRow><TableCell>중간부하</TableCell><TableCell className="text-right">{formatNumber(details.usage.medium_load)}</TableCell></TableRow>
                    <TableRow><TableCell>최대부하</TableCell><TableCell className="text-right">{formatNumber(details.usage.max_load)}</TableCell></TableRow>
                    <TableRow className="font-bold"><TableCell>총사용량</TableCell><TableCell className="text-right">{formatNumber(details.usage.total_usage)}</TableCell></TableRow>
                </TableBody>
            </Table>
        </div>
        <div>
            <h4 className="font-semibold text-md mb-2">청구 내역 (원)</h4>
            <Table>
                <TableBody>
                    <TableRow><TableCell>기본요금</TableCell><TableCell className="text-right">{formatCurrency(details.charges.base_charge)}</TableCell></TableRow>
                    <TableRow><TableCell>전력량요금</TableCell><TableCell className="text-right">{formatCurrency(details.charges.usage_charge)}</TableCell></TableRow>
                    <TableRow><TableCell>기후환경요금</TableCell><TableCell className="text-right">{formatCurrency(details.charges.climate_environment_charge)}</TableCell></TableRow>
                    <TableRow><TableCell>연료비조정액</TableCell><TableCell className="text-right">{formatCurrency(details.charges.fuel_cost_adjustment)}</TableCell></TableRow>
                    <TableRow><TableCell>역률요금</TableCell><TableCell className="text-right">{formatCurrency(details.charges.power_factor_charge)}</TableCell></TableRow>
                    <TableRow><TableCell className="pl-6">전기요금계</TableCell><TableCell className="text-right">{formatCurrency(details.charges.subtotal)}</TableCell></TableRow>
                    <TableRow><TableCell>부가가치세</TableCell><TableCell className="text-right">{formatCurrency(details.charges.vat)}</TableCell></TableRow>
                    <TableRow><TableCell>전력산업기반기금</TableCell><TableCell className="text-right">{formatCurrency(details.charges.power_industry_fund)}</TableCell></TableRow>
                    <TableRow><TableCell>원단위절사</TableCell><TableCell className="text-right">{formatCurrency(details.charges.round_off)}</TableCell></TableRow>
                    <TableRow className="font-bold"><TableCell>청구금액</TableCell><TableCell className="text-right">{formatCurrency(details.total_billed_amount)}</TableCell></TableRow>
                </TableBody>
            </Table>
        </div>
    </div>
);

const WaterCostDetail: React.FC<{ details: UtilityBill['water'] }> = ({ details }) => (
    <div className="space-y-4">
        <div>
            <h4 className="font-semibold text-md mb-2">일반용</h4>
            <Table>
                <TableBody>
                    <TableRow><TableCell>사용량 (m³)</TableCell><TableCell className="text-right">{formatNumber(details.general.usage_m3)}</TableCell></TableRow>
                    <TableRow><TableCell>기본요금</TableCell><TableCell className="text-right">{formatCurrency(details.general.base_charge)}</TableCell></TableRow>
                    <TableRow><TableCell>상수도요금</TableCell><TableCell className="text-right">{formatCurrency(details.general.water_supply_charge)}</TableCell></TableRow>
                    <TableRow><TableCell>하수도요금</TableCell><TableCell className="text-right">{formatCurrency(details.general.sewerage_charge)}</TableCell></TableRow>
                    <TableRow><TableCell>중수도감면</TableCell><TableCell className="text-right">{formatCurrency(details.general.sewage_reduction)}</TableCell></TableRow>
                    <TableRow className="font-bold"><TableCell>합계</TableCell><TableCell className="text-right">{formatCurrency(details.general.total_charge)}</TableCell></TableRow>
                </TableBody>
            </Table>
        </div>
        <div>
            <h4 className="font-semibold text-md mb-2">소화전</h4>
            <Table>
                <TableBody>
                    <TableRow><TableCell>사용량 (m³)</TableCell><TableCell className="text-right">{formatNumber(details.fire_hydrant.usage_m3)}</TableCell></TableRow>
                    <TableRow><TableCell>기본요금</TableCell><TableCell className="text-right">{formatCurrency(details.fire_hydrant.base_charge)}</TableCell></TableRow>
                    <TableRow><TableCell>상수도요금</TableCell><TableCell className="text-right">{formatCurrency(details.fire_hydrant.water_supply_charge)}</TableCell></TableRow>
                    <TableRow><TableCell>하수도요금</TableCell><TableCell className="text-right">{formatCurrency(details.fire_hydrant.sewerage_charge)}</TableCell></TableRow>
                    <TableRow className="font-bold"><TableCell>합계</TableCell><TableCell className="text-right">{formatCurrency(details.fire_hydrant.total_charge)}</TableCell></TableRow>
                </TableBody>
            </Table>
        </div>
    </div>
);

const GasCostDetail: React.FC<{ details: UtilityBill['gas'] }> = ({ details }) => (
    <Table>
        <TableBody>
            <TableRow><TableCell>검침 (m³)</TableCell><TableCell className="text-right">{formatNumber(details.meter_reading_m3)}</TableCell></TableRow>
            <TableRow><TableCell>사용량 (m³)</TableCell><TableCell className="text-right">{formatNumber(details.usage_m3)}</TableCell></TableRow>
            <TableRow><TableCell>당월단가 (원/m³)</TableCell><TableCell className="text-right">{formatCurrency(details.unit_price)}</TableCell></TableRow>
            <TableRow className="font-bold"><TableCell>사용량요금</TableCell><TableCell className="text-right">{formatCurrency(details.usage_charge)}</TableCell></TableRow>
        </TableBody>
    </Table>
);


// --- CARD & CHART SUB COMPONENTS ---

const InfoCard: React.FC<{ 
    icon: React.ReactNode; 
    title: string; 
    value: string; 
    change: number | null;
}> = ({ icon, title, value, change }) => {
    const isPositive = change && change > 0;
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                {icon}
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                <div className="h-5">
                {change !== null && (
                    <p className={`text-xs flex items-center ${isPositive ? 'text-red-500' : 'text-blue-500'}`}>
                         {isPositive ? <ArrowUp size={12} className="mr-1" /> : <ArrowDown size={12} className="mr-1" />}
                        <span className="font-semibold">{Math.abs(change).toFixed(1)}%</span>
                        <span className='text-gray-500 ml-1 font-normal'>vs last month</span>
                    </p>
                )}
                </div>
            </CardContent>
        </Card>
    );
};

const SolarContributionChart: React.FC<{ data: any[] }> = ({ data }) => {
    if (!data || data.length === 0) return null;
    return (
        <Card>
             <CardHeader>
                <CardTitle className="font-bold">태양광 발전 기여도</CardTitle>
                <CardDescription>총 전기 사용량 중 태양광 발전을 통해 절감된 양을 보여줍니다.</CardDescription>
            </CardHeader>
            <CardContent>
               <ResponsiveContainer width="100%" height={150}>
                  <BarChart data={data} layout="vertical" margin={{ left: 10, right: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                      <XAxis type="number" hide />
                      <YAxis type="category" dataKey="name" hide />
                      <Tooltip formatter={(value: number) => `${value.toLocaleString()} kWh`} />
                      <Legend wrapperStyle={{ paddingTop: '20px' }} />
                      <Bar dataKey="grid_usage" stackId="a" fill="#E5E7EB" name="외부 전력 (Grid)" />
                      <Bar dataKey="solar_generation" stackId="a" fill="#10B981" name="태양광 발전 (Solar)" />
                  </BarChart>
              </ResponsiveContainer>
            </CardContent>
        </Card>
    );
};

// --- MAIN COMPONENT ---
const OmsEnergyDashboard: React.FC = () => {
    const [reports, setReports] = useState<UtilityBill[]>([]);
    const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setLoading(true);
        const q = query(collection(db, "utility-bills"), orderBy("billingMonth", "desc"));

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const fetchedReports = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UtilityBill));
            setReports(fetchedReports);
            if (fetchedReports.length > 0 && !selectedMonth) {
                setSelectedMonth(fetchedReports[0].billingMonth);
            }
            setLoading(false);
        }, (err) => {
            console.error("Error fetching reports: ", err);
            setError("데이터를 불러오는 중 오류가 발생했습니다.");
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const { selectedReport, previousReport } = useMemo(() => {
        if (!selectedMonth || reports.length === 0) return { selectedReport: null, previousReport: null };
        
        const currentReport = reports.find(r => r.billingMonth === selectedMonth) || null;
        
        const [year, month] = selectedMonth.split('-').map(Number);
        const prevMonthDate = new Date(year, month - 2);
        const prevMonthString = `${prevMonthDate.getFullYear()}-${String(prevMonthDate.getMonth() + 1).padStart(2, '0')}`;
        
        const prevReport = reports.find(r => r.billingMonth === prevMonthString) || null;
        
        return { selectedReport: currentReport, previousReport: prevReport };
    }, [selectedMonth, reports]);

    const solarContributionData = useMemo(() => {
      if(!selectedReport) return [];
      const totalUsage = selectedReport.electricity.usage.total_usage ?? 0;
      const solarGeneration = selectedReport.environmental?.solar_power_generation_kwh ?? 0;
      const gridUsage = Math.max(0, totalUsage - solarGeneration);
      
      return [{
        name: '전기 사용',
        'grid_usage': gridUsage,
        'solar_generation': solarGeneration,
      }];
    }, [selectedReport]);


    if (loading) {
        return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /><span className="ml-4 text-lg">데이터를 불러오는 중...</span></div>;
    }
    if (error) {
        return <Alert variant="destructive"><AlertTitle>오류</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>;
    }
    if (reports.length === 0) {
        return (
            <Alert>
                <TrendingUp className="h-4 w-4" />
                <AlertTitle>데이터 없음</AlertTitle>
                <AlertDescription>표시할 에너지 데이터가 없습니다. 먼저 '새 보고서 업로드' 탭에서 월간 보고서를 추가해주세요.</AlertDescription>
            </Alert>
        );
    }
    
    // --- CALCULATE VALUES ---
    const elecUsage = selectedReport?.electricity.usage.total_usage;
    const elecCost = selectedReport?.electricity.total_billed_amount;
    const waterUsage = (selectedReport?.water.general.usage_m3 ?? 0) + (selectedReport?.water.fire_hydrant.usage_m3 ?? 0);
    const waterCost = (selectedReport?.water.general.total_charge ?? 0) + (selectedReport?.water.fire_hydrant.total_charge ?? 0);
    const gasUsage = selectedReport?.gas.usage_m3;
    const gasCost = selectedReport?.gas.usage_charge;
    const solarGen = selectedReport?.environmental?.solar_power_generation_kwh;
    const grayWaterUsage = selectedReport?.environmental?.gray_water_usage_m3;
    const temp = selectedReport?.environmental?.avg_monthly_temperature_celsius;

    const prevElecUsage = previousReport?.electricity.usage.total_usage;
    const prevWaterUsage = (previousReport?.water.general.usage_m3 ?? 0) + (previousReport?.water.fire_hydrant.usage_m3 ?? 0);
    const prevGasUsage = previousReport?.gas.usage_m3;
    const prevSolarGen = previousReport?.environmental?.solar_power_generation_kwh;
    const prevGrayWaterUsage = previousReport?.environmental?.gray_water_usage_m3;
    const prevTemp = previousReport?.environmental?.avg_monthly_temperature_celsius;

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-2xl">
                        <span className="text-gray-500 font-medium">총 에너지 비용: </span>
                        <span className="font-bold text-gray-800">
                            {selectedReport ? formatCurrency(selectedReport.grand_total) : '...'}
                        </span>
                    </CardTitle>
                    <Select onValueChange={setSelectedMonth} value={selectedMonth ?? ""}>
                        <SelectTrigger className="w-[220px]">
                            <SelectValue placeholder="분석 월 선택..." />
                        </SelectTrigger>
                        <SelectContent>
                            {reports.map(report => (
                                <SelectItem key={report.id} value={report.billingMonth}>
                                    {`${report.billingMonth.substring(0, 4)}년 ${parseInt(report.billingMonth.substring(5, 7), 10)}월`}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </CardHeader>
                <CardContent>
                    {selectedReport ? (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <InfoCard 
                                    icon={<Sun className="h-5 w-5 text-yellow-500" />}
                                    title="태양광 발전량"
                                    value={formatNumber(solarGen, ' kWh')}
                                    change={getChange(solarGen, prevSolarGen)}
                                />
                                <InfoCard 
                                    icon={<Recycle className="h-5 w-5 text-green-500" />}
                                    title="중수 사용량"
                                    value={formatNumber(grayWaterUsage, ' m³')}
                                    change={getChange(grayWaterUsage, prevGrayWaterUsage)}
                                />
                                <InfoCard 
                                    icon={<Thermometer className="h-5 w-5 text-red-500" />}
                                    title="월평균 기온"
                                    value={formatNumber(temp, ' °C')}
                                    change={getChange(temp, prevTemp)}
                                />
                            </div>

                            <Accordion type="single" collapsible className="w-full">
                                <AccordionItem value="item-1">
                                    <AccordionTrigger className="hover:no-underline">
                                        <div className="flex items-center justify-between w-full pr-4">
                                            <div className="flex items-center">
                                                <Zap className="w-5 h-5 mr-3 text-blue-500" />
                                                <span className="font-semibold text-lg">전기</span>
                                            </div>
                                            <div className="flex items-center space-x-4">
                                                <span className="text-md font-medium text-gray-500">{formatNumber(elecUsage, ' kWh')}</span>
                                                <div className="flex flex-col items-end w-[160px]">
                                                     <span className="text-lg font-bold">{formatCurrency(elecCost)}</span>
                                                     <div className="h-5">
                                                     {getChange(elecUsage, prevElecUsage) !== null && (
                                                        <p className={`text-xs flex items-center ${getChange(elecUsage, prevElecUsage)! > 0 ? 'text-red-500' : 'text-blue-500'}`}>
                                                            {getChange(elecUsage, prevElecUsage)! > 0 ? <ArrowUp size={12} className="mr-1" /> : <ArrowDown size={12} className="mr-1" />}
                                                            <span className="font-semibold">{Math.abs(getChange(elecUsage, prevElecUsage)!).toFixed(1)}%</span>
                                                        </p>
                                                     )}
                                                     </div>
                                                </div>
                                            </div>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="p-4 bg-gray-50/50 rounded-b-md">
                                        <ElectricityCostDetail details={selectedReport.electricity} />
                                    </AccordionContent>
                                </AccordionItem>
                                
                                <AccordionItem value="item-2">
                                     <AccordionTrigger className="hover:no-underline">
                                        <div className="flex items-center justify-between w-full pr-4">
                                            <div className="flex items-center">
                                                <Droplets className="w-5 h-5 mr-3 text-cyan-500" />
                                                <span className="font-semibold text-lg">수도</span>
                                            </div>
                                            <div className="flex items-center space-x-4">
                                                <span className="text-md font-medium text-gray-500">{formatNumber(waterUsage, ' m³')}</span>
                                                <div className="flex flex-col items-end w-[160px]">
                                                     <span className="text-lg font-bold">{formatCurrency(waterCost)}</span>
                                                     <div className="h-5">
                                                     {getChange(waterUsage, prevWaterUsage) !== null && (
                                                        <p className={`text-xs flex items-center ${getChange(waterUsage, prevWaterUsage)! > 0 ? 'text-red-500' : 'text-blue-500'}`}>
                                                            {getChange(waterUsage, prevWaterUsage)! > 0 ? <ArrowUp size={12} className="mr-1" /> : <ArrowDown size={12} className="mr-1" />}
                                                            <span className="font-semibold">{Math.abs(getChange(waterUsage, prevWaterUsage)!).toFixed(1)}%</span>
                                                        </p>
                                                     )}
                                                     </div>
                                                </div>
                                            </div>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="p-4 bg-gray-50/50 rounded-b-md">
                                        <WaterCostDetail details={selectedReport.water} />
                                    </AccordionContent>
                                </AccordionItem>

                                <AccordionItem value="item-3">
                                     <AccordionTrigger className="hover:no-underline">
                                        <div className="flex items-center justify-between w-full pr-4">
                                            <div className="flex items-center">
                                                <Flame className="w-5 h-5 mr-3 text-orange-500" />
                                                <span className="font-semibold text-lg">가스</span>
                                            </div>
                                            <div className="flex items-center space-x-4">
                                                <span className="text-md font-medium text-gray-500">{formatNumber(gasUsage, ' m³')}</span>
                                                <div className="flex flex-col items-end w-[160px]">
                                                     <span className="text-lg font-bold">{formatCurrency(gasCost)}</span>
                                                     <div className="h-5">
                                                     {getChange(gasUsage, prevGasUsage) !== null && (
                                                        <p className={`text-xs flex items-center ${getChange(gasUsage, prevGasUsage)! > 0 ? 'text-red-500' : 'text-blue-500'}`}>
                                                            {getChange(gasUsage, prevGasUsage)! > 0 ? <ArrowUp size={12} className="mr-1" /> : <ArrowDown size={12} className="mr-1" />}
                                                            <span className="font-semibold">{Math.abs(getChange(gasUsage, prevGasUsage)!).toFixed(1)}%</span>
                                                        </p>
                                                     )}
                                                     </div>
                                                </div>
                                            </div>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="p-4 bg-gray-50/50 rounded-b-md">
                                        <GasCostDetail details={selectedReport.gas} />
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        </div>
                    ) : (
                        <p>선택된 월에 대한 데이터가 없습니다.</p>
                    )}
                </CardContent>
            </Card>

            {selectedReport && <SolarContributionChart data={solarContributionData} />}

        </div>
    );
};

export default OmsEnergyDashboard;
