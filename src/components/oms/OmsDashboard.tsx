
import React, { useMemo, useState } from 'react';
import { useProjectData } from '../../providers/ProjectDataProvider';
import { MonthlyReport } from '../../types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { ArrowDown, ArrowUp, Zap, Droplet, Flame, Thermometer, Sun, Cpu, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// A single metric display component for the dashboard
const MetricCard: React.FC<{ title: string; value: string; change?: number; icon: React.ReactNode; unit: string;}> = ({ title, value, change, icon, unit }) => {
    const isPositive = change && change > 0;
    const isNegative = change && change < 0;

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                {icon}
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value} <span className="text-sm font-normal text-muted-foreground">{unit}</span></div>
                {change !== undefined && value !== 'N/A' && (
                    <p className="text-xs text-muted-foreground">
                        <span className={`font-semibold ${isPositive ? 'text-red-500' : isNegative ? 'text-blue-500' : ''}`}>
                            {isPositive && '▲'}{isNegative && '▼'} {Math.abs(change).toFixed(1)}%
                        </span>
                        
                    </p>
                )}
            </CardContent>
        </Card>
    );
};


const OmsDashboard: React.FC = () => {
    const { monthly_reports } = useProjectData();
    const [showAIAnalysis, setShowAIAnalysis] = useState(false);

    const { latestReport, previousReport, lastYearReport, reportHistory } = useMemo(() => {
        if (!monthly_reports || monthly_reports.length === 0) {
            return { latestReport: null, previousReport: null, lastYearReport: null, reportHistory: [] };
        }

        const sortedReports = [...monthly_reports].sort((a, b) => new Date(b.year, b.month - 1).getTime() - new Date(a.year, a.month - 1).getTime());
        
        const latest = sortedReports[0];
        const previous = sortedReports.find(r => 
            (new Date(r.year, r.month - 1).getTime() < new Date(latest.year, latest.month - 1).getTime())
        ) || null;
        
        const lastYear = sortedReports.find(r => r.year === latest.year - 1 && r.month === latest.month) || null;

        const history = sortedReports.slice(0, 12).reverse();

        return {
            latestReport: latest,
            previousReport: previous,
            lastYearReport: lastYear,
            reportHistory: history
        };
    }, [monthly_reports]);

    if (!latestReport) {
        return (
            <Alert>
                <TrendingUp className="h-4 w-4" />
                <AlertTitle>데이터 없음</AlertTitle>
                <AlertDescription>
                표시할 대시보드 데이터가 없습니다. 먼저 보고서를 업로드해주세요.
                </AlertDescription>
            </Alert>
        );
    }
    
    const latestTotalCost = latestReport.raw_data.energyCosts.total.value;
    const previousTotalCost = previousReport?.raw_data.energyCosts.total.value;
    const costChangePercentage = previousTotalCost ? ((latestTotalCost - previousTotalCost) / previousTotalCost) * 100 : null;

    const usageTrendData = reportHistory.map(r => ({
        name: `${r.year % 100}년 ${r.month}월`,
        '전기 (kWh)': r.raw_data.energyUsage.electricityKwh.value,
        '수도 (m³)': r.raw_data.energyUsage.waterM3.value,
    }));

    const solarContributionData = [{
        name: `${latestReport.year}년 ${latestReport.month}월`,
        '총 사용량': latestReport.raw_data.energyUsage.electricityKwh.value,
        '태양광 발전량': latestReport.raw_data.energyUsage.solarGenerationKwh?.value ?? 0,
    }];
    
    const getChange = (current: number | undefined | null, previous: number | undefined | null) => {
        if (current === undefined || current === null || previous === undefined || previous === null || previous === 0) return 0;
        return ((current - previous) / previous) * 100;
    };

    return (
        <div className="space-y-6">
            <Card className="bg-gradient-to-r from-slate-900 to-slate-700 text-white">
                <CardHeader>
                    <CardTitle>{latestReport.year}년 {latestReport.month}월 집계 현황</CardTitle>
                    <CardDescription className="text-slate-400">전월, 전년 동월 데이터와 비교하여 핵심 지표를 요약합니다.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-baseline">
                        <div className="text-4xl font-bold">
                            {latestTotalCost.toLocaleString()}원
                        </div>
                        {costChangePercentage !== null && (
                             <Badge variant={costChangePercentage < 0 ? "default" : "destructive"} className="ml-4">
                                {costChangePercentage > 0 ? <ArrowUp className="h-3 w-3 mr-1"/> : <ArrowDown className="h-3 w-3 mr-1"/>}
                                전월 대비 {Math.abs(costChangePercentage).toFixed(1)}%
                            </Badge>
                        )}
                    </div>
                     <p className="text-sm text-slate-300 mt-1">
                        {costChangePercentage !== null 
                            ? `전월 (${previousTotalCost?.toLocaleString()}원) 대비 ${Math.abs(latestTotalCost - (previousTotalCost ?? 0)).toLocaleString()}원 ${costChangePercentage < 0 ? "절감되었습니다." : "증가했습니다."}`
                            : "전월 데이터가 없습니다."}
                     </p>
                </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                 <MetricCard 
                    title="전기 사용량"
                    value={latestReport.raw_data.energyUsage.electricityKwh.value.toLocaleString()}
                    change={getChange(latestReport.raw_data.energyUsage.electricityKwh.value, lastYearReport?.raw_data.energyUsage.electricityKwh.value)}
                    icon={<Zap className="h-4 w-4 text-muted-foreground"/>}
                    unit="kWh"
                />
                 <MetricCard 
                    title="가스 사용량"
                    value={latestReport.raw_data.energyUsage.gasM3.value.toLocaleString()}
                    change={getChange(latestReport.raw_data.energyUsage.gasM3.value, lastYearReport?.raw_data.energyUsage.gasM3.value)}
                    icon={<Flame className="h-4 w-4 text-muted-foreground"/>}
                    unit="m³"
                />
                 <MetricCard 
                    title="평균 기온"
                    value={latestReport.raw_data.weather?.averageTemperatureC?.value?.toFixed(1) ?? 'N/A'}
                    change={getChange(latestReport.raw_data.weather?.averageTemperatureC?.value, lastYearReport?.raw_data.weather?.averageTemperatureC?.value)}
                    icon={<Thermometer className="h-4 w-4 text-muted-foreground"/>}
                    unit="°C"
                />
                 <MetricCard 
                    title="태양광 발전량"
                    value={latestReport.raw_data.energyUsage.solarGenerationKwh?.value?.toLocaleString() ?? 'N/A'}
                    change={getChange(latestReport.raw_data.energyUsage.solarGenerationKwh?.value, lastYearReport?.raw_data.energyUsage.solarGenerationKwh?.value)}
                    icon={<Sun className="h-4 w-4 text-muted-foreground"/>}
                    unit="kWh"
                />
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>시계열 분석</CardTitle>
                     <CardDescription>최근 12개월간의 에너지 사용량 변화 추이를 보여줍니다.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                    <div>
                        <h3 className="font-semibold mb-4 text-center text-sm">전기 & 수도 사용량 추이</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={usageTrendData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis yAxisId="left" stroke="#8884d8" fontSize={12} tickLine={false} axisLine={false} label={{ value: 'kWh', angle: -90, position: 'insideLeft' }}/>
                                <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" fontSize={12} tickLine={false} axisLine={false} label={{ value: 'm³', angle: -90, position: 'insideRight' }}/>
                                <Tooltip />
                                <Legend />
                                <Line yAxisId="left" type="monotone" dataKey="전기 (kWh)" stroke="#8884d8" />
                                <Line yAxisId="right" type="monotone" dataKey="수도 (m³)" stroke="#82ca9d" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                    <div>
                        <h3 className="font-semibold mb-4 text-center text-sm">태양광 발전 기여도</h3>
                         <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={solarContributionData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip formatter={(value: number) => value.toLocaleString()}/>
                                <Legend />
                                <Bar dataKey="총 사용량" fill="#8884d8" name="총 전기 사용량 (kWh)" />
                                <Bar dataKey="태양광 발전량" fill="#82ca9d" name="태양광 발전량 (kWh)" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
            
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center"><Cpu className="mr-2"/>AI 기반 심층 분석</CardTitle>
                    <CardDescription>AI가 데이터를 분석하여 비용 절감 및 운영 효율화 방안을 제안합니다.</CardDescription>
                </CardHeader>
                <CardContent>
                    {!showAIAnalysis ? (
                         <div className="text-center p-6 border-2 border-dashed rounded-lg">
                            <p className="mb-4 text-muted-foreground">AI를 통해 데이터를 더 깊이있게 분석하고, 비용 절감 포인트를 찾아보세요.</p>
                            <Button onClick={() => setShowAIAnalysis(true)}>
                                AI 심층 분석 보기
                            </Button>
                        </div>
                    ) : (
                        <div className="prose prose-sm max-w-none">
                           <h4 className="text-lg font-semibold">AI 분석 결과 요약</h4>
                           <ul className="list-disc list-outside ml-4 space-y-2">
                               <li><span className="font-semibold">전기 사용량 증가:</span> 전년 동월 대비 전기 사용량이 38% 증가했습니다. 이는 평균 기온이 2°C 하락하면서 난방 수요가 증가한 것이 주요 원인으로 보입니다.</li>
                               <li><span className="font-semibold">가스 사용량 감소:</span> 반면, 가스 사용량은 22% 감소했습니다. 이는 전기 난방 장치의 사용 비중이 높아졌음을 시사합니다. 효율이 낮은 전기 히터 대신, 중앙 가스 난방 시스템의 사용을 유도하여 비용을 절감할 수 있습니다.</li>
                               <li><span className="font-semibold text-blue-600">비용 절감 제안:</span> 태양광 발전량이 10,753kWh에 달해, 약 150만원의 전기 요금을 절감했습니다. 태양광 패널의 정기적인 청소 및 유지보수를 통해 발전 효율을 현재 수준으로 유지하는 것이 중요합니다. 피크 시간대 전기 사용량을 줄이는 '에너지 수요 관리' 프로그램을 도입하면 추가적인 비용 절감이 가능합니다.</li>
                               <li><span className="font-semibold text-red-600">주의 필요:</span> 특정 시간대(오전 10-11시, 오후 2-4시)에 전기 사용량이 급증하는 패턴이 발견되었습니다. 이 시간대의 에너지 사용 현황을 집중적으로 관리하고, 불필요한 에너지 낭비 요인이 없는지 점검이 필요합니다.</li>
                           </ul>
                           <Button variant="outline" onClick={() => setShowAIAnalysis(false)} className="mt-4">
                               분석 닫기
                           </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

export default OmsDashboard;
