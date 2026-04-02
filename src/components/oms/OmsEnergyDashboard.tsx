
import React, { useState, useMemo } from 'react';
import { useProjectData } from '@/providers/ProjectDataProvider';
import { MonthlyReport } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TrendingUp, Zap, Droplets, Flame } from 'lucide-react';

// Helper to format numbers
const formatCurrency = (value: number) => `${value.toLocaleString()}원`;

// Detailed cost breakdown for electricity
const ElectricityCostDetail: React.FC<{ details: MonthlyReport['raw_data']['energyCosts']['electricity'] }> = ({ details }) => (
    <Table>
        <TableHeader>
            <TableRow>
                <TableHead>항목</TableHead>
                <TableHead className="text-right">금액</TableHead>
            </TableRow>
        </TableHeader>
        <TableBody>
            <TableRow><TableCell>기본요금</TableCell><TableCell className="text-right">{formatCurrency(details.basicCharge.value)}</TableCell></TableRow>
            <TableRow><TableCell>전력량요금</TableCell><TableCell className="text-right">{formatCurrency(details.usageCharge.value)}</TableCell></TableRow>
            <TableRow><TableCell>기후환경요금</TableCell><TableCell className="text-right">{formatCurrency(details.demandCharge.value)}</TableCell></TableRow>
            <TableRow><TableCell>연료비조정액</TableCell><TableCell className="text-right">{formatCurrency(details.fund.value)}</TableCell></TableRow>
            <TableRow><TableCell>부가가치세</TableCell><TableCell className="text-right">{formatCurrency(details.vat.value)}</TableCell></TableRow>
            <TableRow><TableCell>전력산업기반기금</TableCell><TableCell className="text-right">{formatCurrency(details.fund.value)}</TableCell></TableRow>
        </TableBody>
    </Table>
);

// Detailed cost breakdown for water
const WaterCostDetail: React.FC<{ details: MonthlyReport['raw_data']['energyCosts']['water'] }> = ({ details }) => (
    <Table>
        <TableHeader>
            <TableRow>
                <TableHead>항목</TableHead>
                <TableHead className="text-right">금액</TableHead>
            </TableRow>
        </TableHeader>
        <TableBody>
            <TableRow><TableCell>상수도요금</TableCell><TableCell className="text-right">{formatCurrency(details.usageCharge.value)}</TableCell></TableRow>
        </TableBody>
    </Table>
);

// Detailed cost breakdown for gas
const GasCostDetail: React.FC<{ details: MonthlyReport['raw_data']['energyCosts']['gas'] }> = ({ details }) => (
     <Table>
        <TableHeader>
            <TableRow>
                <TableHead>항목</TableHead>
                <TableHead className="text-right">금액</TableHead>
            </TableRow>
        </TableHeader>
        <TableBody>
             <TableRow><TableCell>가스 사용요금</TableCell><TableCell className="text-right">{formatCurrency(details.usageCharge.value)}</TableCell></TableRow>
        </TableBody>
    </Table>
);


const OmsEnergyDashboard: React.FC = () => {
    const { monthly_reports } = useProjectData();
    const [selectedMonth, setSelectedMonth] = useState<string | null>(null);

    const sortedReports = useMemo(() => {
        if (!monthly_reports) return [];
        return [...monthly_reports].sort((a, b) => {
            if (a.year !== b.year) return b.year - a.year;
            return b.month - a.month;
        });
    }, [monthly_reports]);

    if (!sortedReports || sortedReports.length === 0) {
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
    
    // Set default selected month to the latest report
    if (!selectedMonth && sortedReports.length > 0) {
        const latest = sortedReports[0];
        setSelectedMonth(`${latest.year}-${latest.month}`);
    }

    const selectedReport = sortedReports.find(r => `${r.year}-${r.month}` === selectedMonth);

    if (!selectedReport) {
        // This should not happen if selectedMonth is set correctly
        return <Alert><AlertTitle>오류</AlertTitle><AlertDescription>선택된 보고서를 찾을 수 없습니다.</AlertDescription></Alert>
    }

    const { energyCosts, energyUsage, weather } = selectedReport.raw_data;

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>에너지 비용 상세 분석</CardTitle>
                    <Select onValueChange={setSelectedMonth} value={selectedMonth ?? ""}>
                        <SelectTrigger className="w-[220px]">
                            <SelectValue placeholder="분석 월 선택..." />
                        </SelectTrigger>
                        <SelectContent>
                            {sortedReports.map(report => (
                                <SelectItem key={report.id} value={`${report.year}-${report.month}`}>
                                    {`${report.year}년 ${report.month}월`}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </CardHeader>
                <CardContent>
                    <Accordion type="single" collapsible defaultValue="item-1" className="w-full">
                        <AccordionItem value="item-1">
                            <AccordionTrigger className="hover:no-underline">
                                <div className="flex items-center justify-between w-full pr-4">
                                    <div className="flex items-center">
                                        <div className="w-2 h-8 bg-blue-500 rounded-full mr-4"></div>
                                        <Zap className="w-5 h-5 mr-3 text-blue-500" />
                                        <span className="font-semibold text-lg">전기</span>
                                    </div>
                                    <span className="text-xl font-bold">{formatCurrency(energyCosts.electricity.finalAmount.value)}</span>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="p-4 bg-gray-50/50 rounded-b-md">
                                <ElectricityCostDetail details={energyCosts.electricity} />
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
                                    <span className="text-xl font-bold">{formatCurrency(energyCosts.water.generalTotal.value)}</span>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="p-4 bg-gray-50/50 rounded-b-md">
                                <WaterCostDetail details={energyCosts.water} />
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
                                    <span className="text-xl font-bold">{formatCurrency(energyCosts.gas.usageCharge.value)}</span>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="p-4 bg-gray-50/50 rounded-b-md">
                                <GasCostDetail details={energyCosts.gas} />
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </CardContent>
            </Card>
            
            <Card>
                <CardHeader>
                    <CardTitle>총 에너지 비용</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                    <p className="text-4xl font-bold text-gray-800">{formatCurrency(energyCosts.total.value)}</p>
                    {weather?.averageTemperatureC && (
                        <p className="text-sm text-gray-500 mt-1">
                            기온: {weather.averageTemperatureC.value}°C
                        </p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default OmsEnergyDashboard;
