
import React, { useState, useEffect } from 'react';
import { db } from '@/firebase'; // Firestore 인스턴스 가져오기
import { collection, getDocs, query, orderBy, onSnapshot } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TrendingUp, Zap, Droplets, Flame, Loader2, Sun, Recycle, Thermometer } from 'lucide-react';

// Firestore에서 가져온 데이터 타입 정의
interface UtilityBill {
  id: string;
  billingMonth: string;
  environmental?: {
    solar_power_generation_kwh: number | null;
    gray_water_usage_m3: number | null;
    avg_monthly_temperature_celsius: number | null;
  };
  electricity: {
    usage: {
      light_load: number | null;
      medium_load: number | null;
      max_load: number | null;
      total_usage: number | null;
    };
    charges: {
      base_charge: number | null;
      usage_charge: number | null;
      climate_environment_charge: number | null;
      fuel_cost_adjustment: number | null;
      power_factor_charge: number | null;
      subtotal: number | null;
      vat: number | null;
      power_industry_fund: number | null;
      round_off: number | null;
    };
    total_billed_amount: number | null;
  };
  water: {
    general: {
      usage_m3: number | null;
      base_charge: number | null;
      water_supply_charge: number | null;
      sewerage_charge: number | null;
      sewage_reduction: number | null;
      total_charge: number | null;
    };
    fire_hydrant: {
      usage_m3: number | null;
      base_charge: number | null;
      water_supply_charge: number | null;
      sewerage_charge: number | null;
      total_charge: number | null;
    };
  };
  gas: {
    meter_reading_m3: number | null;
    usage_m3: number | null;
    unit_price: number | null;
    usage_charge: number | null;
  };
  grand_total: number | null;
}


// Helper to format numbers
const formatCurrency = (value: number | null | undefined) => {
    if (value === null || value === undefined) return '-';
    return `${Math.round(value).toLocaleString()}원`;
};

const formatNumber = (value: number | null | undefined, unit: string = '') => {
    if (value === null || value === undefined) return '-';
    return `${value.toLocaleString()}${unit}`;
};

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
            
            const uniqueReports = fetchedReports.filter((report, index, self) =>
                index === self.findIndex((r) => r.billingMonth === report.billingMonth)
            );

            setReports(uniqueReports);

            if (uniqueReports.length > 0 && !selectedMonth) {
                setSelectedMonth(uniqueReports[0].billingMonth);
            }
            setLoading(false);
        }, (err) => {
            console.error("Error fetching utility bills: ", err);
            setError("데이터를 불러오는 중 오류가 발생했습니다.");
            setLoading(false);
        });

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, [selectedMonth]);

    const selectedReport = reports.find(r => r.billingMonth === selectedMonth);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="ml-4 text-lg">데이터를 불러오는 중...</span>
            </div>
        );
    }

    if (error) {
        return <Alert variant="destructive"><AlertTitle>오류</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>;
    }

    if (reports.length === 0) {
        return (
            <Alert>
                <TrendingUp className="h-4 w-4" />
                <AlertTitle>데이터 없음</AlertTitle>
                <AlertDescription>
                    표시할 에너지 데이터가 없습니다. 먼저 '새 보고서 업로드' 탭에서 월간 보고서를 추가해주세요.
                </AlertDescription>
            </Alert>
        );
    }

    return (
        <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">태양광 발전량</CardTitle>
                        <Sun className="h-5 w-5 text-yellow-500"/>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {formatNumber(selectedReport?.environmental?.solar_power_generation_kwh, ' kWh')}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">중수 사용량</CardTitle>
                        <Recycle className="h-5 w-5 text-green-500"/>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                             {formatNumber(selectedReport?.environmental?.gray_water_usage_m3, ' m³')}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">월평균 기온</CardTitle>
                        <Thermometer className="h-5 w-5 text-red-500"/>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                           {formatNumber(selectedReport?.environmental?.avg_monthly_temperature_celsius, ' °C')}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>에너지 비용 상세 분석</CardTitle>
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
                        <Accordion type="single" collapsible defaultValue="item-1" className="w-full">
                            <AccordionItem value="item-1">
                                <AccordionTrigger className="hover:no-underline">
                                    <div className="flex items-center justify-between w-full pr-4">
                                        <div className="flex items-center">
                                            <div className="w-2 h-8 bg-blue-500 rounded-full mr-4"></div>
                                            <Zap className="w-5 h-5 mr-3 text-blue-500" />
                                            <span className="font-semibold text-lg">전기</span>
                                        </div>
                                        <span className="text-xl font-bold">{formatCurrency(selectedReport.electricity.total_billed_amount)}</span>
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
                                            <div className="w-2 h-8 bg-cyan-500 rounded-full mr-4"></div>
                                            <Droplets className="w-5 h-5 mr-3 text-cyan-500" />
                                            <span className="font-semibold text-lg">수도</span>
                                        </div>
                                        <span className="text-xl font-bold">{formatCurrency((selectedReport.water.general.total_charge ?? 0) + (selectedReport.water.fire_hydrant.total_charge ?? 0))}</span>
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
                                            <div className="w-2 h-8 bg-orange-500 rounded-full mr-4"></div>
                                            <Flame className="w-5 h-5 mr-3 text-orange-500" />
                                            <span className="font-semibold text-lg">가스</span>
                                        </div>
                                        <span className="text-xl font-bold">{formatCurrency(selectedReport.gas.usage_charge)}</span>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="p-4 bg-gray-50/50 rounded-b-md">
                                    <GasCostDetail details={selectedReport.gas} />
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    ) : (
                        <p>선택된 월에 대한 데이터가 없습니다.</p>
                    )}
                </CardContent>
            </Card>
            
            {selectedReport && (
                 <Card>
                    <CardHeader>
                        <CardTitle>총 에너지 비용</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center">
                        <p className="text-4xl font-bold text-gray-800">{formatCurrency(selectedReport.grand_total)}</p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default OmsEnergyDashboard;
