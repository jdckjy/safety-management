
import React, { useState, useEffect } from 'react';
import { db } from '@/firebase'; // Firestore 인스턴스 가져오기
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TrendingUp, Zap, Droplets, Flame, Loader2 } from 'lucide-react';

// Firestore에서 가져온 데이터 타입 정의
interface UtilityBill {
  id: string;
  billingMonth: string; // 예: "2023-05"
  electricity: {
    total_billed_amount: number | null;
    charges: {
      base_charge: number | null;
      usage_charge: number | null;
      climate_environment_charge: number | null;
      fuel_cost_adjustment: number | null;
      power_factor_charge: number | null;
      vat: number | null;
      power_industry_fund: number | null;
    };
  };
  water: {
    general: { total_charge: number | null; };
    fire_hydrant: { total_charge: number | null; };
  };
  gas: { usage_charge: number | null; };
  grand_total: number | null;
}

// Helper to format numbers
const formatCurrency = (value: number | null | undefined) => {
    if (value === null || value === undefined) return '-';
    return `${Math.round(value).toLocaleString()}원`;
};

const ElectricityCostDetail: React.FC<{ details: UtilityBill['electricity'] }> = ({ details }) => (
    <Table>
        <TableHeader>
            <TableRow>
                <TableHead>항목</TableHead>
                <TableHead className="text-right">금액</TableHead>
            </TableRow>
        </TableHeader>
        <TableBody>
            <TableRow><TableCell>기본요금</TableCell><TableCell className="text-right">{formatCurrency(details.charges.base_charge)}</TableCell></TableRow>
            <TableRow><TableCell>전력량요금</TableCell><TableCell className="text-right">{formatCurrency(details.charges.usage_charge)}</TableCell></TableRow>
            <TableRow><TableCell>기후환경요금</TableCell><TableCell className="text-right">{formatCurrency(details.charges.climate_environment_charge)}</TableCell></TableRow>
            <TableRow><TableCell>연료비조정액</TableCell><TableCell className="text-right">{formatCurrency(details.charges.fuel_cost_adjustment)}</TableCell></TableRow>
            <TableRow><TableCell>역률요금</TableCell><TableCell className="text-right">{formatCurrency(details.charges.power_factor_charge)}</TableCell></TableRow>
            <TableRow><TableCell>부가가치세</TableCell><TableCell className="text-right">{formatCurrency(details.charges.vat)}</TableCell></TableRow>
            <TableRow><TableCell>전력산업기반기금</TableCell><TableCell className="text-right">{formatCurrency(details.charges.power_industry_fund)}</TableCell></TableRow>
        </TableBody>
    </Table>
);

const OmsEnergyDashboard: React.FC = () => {
    const [reports, setReports] = useState<UtilityBill[]>([]);
    const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const q = query(collection(db, "utility-bills"), orderBy("billingMonth", "desc"));
                const querySnapshot = await getDocs(q);
                const fetchedReports = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UtilityBill));

                // 중복 월 제거 로직 추가
                const uniqueReports = fetchedReports.filter((report, index, self) =>
                    index === self.findIndex((r) => r.billingMonth === report.billingMonth)
                );

                setReports(uniqueReports);

                if (uniqueReports.length > 0 && !selectedMonth) {
                    setSelectedMonth(uniqueReports[0].billingMonth);
                }
            } catch (err) {
                console.error("Error fetching utility bills: ", err);
                setError("데이터를 불러오는 중 오류가 발생했습니다.");
            } finally {
                setLoading(false);
            }
        };

        fetchReports();
    }, []);

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
                                        <span className="text-xl font-bold">{formatCurrency(selectedReport.water.general.total_charge)}</span>
                                    </div>
                                </AccordionTrigger>
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
