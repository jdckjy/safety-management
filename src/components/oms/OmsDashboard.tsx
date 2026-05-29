
import React, { useState, useEffect, useMemo } from 'react';
import { db } from '@/firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { ArrowDown, ArrowUp, Zap, Droplet, Flame, Thermometer, Sun, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// --- TYPE DEFINITIONS ---
interface UtilityBill {
  id: string;
  billingMonth: string;
  environmental?: {
    solar_power_generation_kwh: number | null;
    gray_water_usage_m3: number | null;
    avg_monthly_temperature_celsius: number | null;
  };
  electricity: {
    usage: { total_usage: number | null; };
    total_billed_amount: number | null;
  };
  water: { 
    general: { usage_m3?: number | null; total_charge: number | null; };
    fire_hydrant?: { usage_m3?: number | null; };
  };
  gas: { usage_m3?: number | null; usage_charge: number | null; };
  grand_total: number | null;
}

type ChartView = 'trend' | 'electricity' | 'gas' | 'water';

// --- CUSTOM COMPONENTS ---

// Define a specific interface for the custom tooltip props to avoid build errors.
interface CustomTooltipProps {
    active?: boolean;
    payload?: Array<{
        name: string;
        value: string | number;
        unit?: string;
        color?: string;
    }>;
    label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-background p-2 shadow-sm">
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col space-y-1">
            <span className="text-[0.70rem] uppercase text-muted-foreground">
              Month
            </span>
            <span className="font-bold text-muted-foreground">
              {label}
            </span>
          </div>
          {payload.map((p, i) => (
             <div key={i} className="flex flex-col space-y-1">
               <span className="text-[0.70rem] uppercase text-muted-foreground" style={{color: p.color ?? undefined }}>
                 {p.name}
               </span>
               <span className="font-bold" style={{color: p.color ?? undefined }}>
                 {(p.value as number).toLocaleString()}{p.unit}
               </span>
             </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};


const MetricCard: React.FC<{ 
  title: string; 
  value: string; 
  change?: number | null; 
  icon: React.ReactNode; 
  unit: string;
  iconBgColor: string;
}> = ({ title, value, change, icon, unit, iconBgColor }) => {
    const isPositive = change && change > 0;
    const isNegative = change && change < 0;

    return (
        <Card className="rounded-2xl shadow-md border-0">
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div className='flex flex-col space-y-1'>
                  <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
                   <div className="tabular-nums text-2xl font-bold">{value} <span className="text-base font-normal text-muted-foreground">{unit}</span></div>
                </div>
                <div className={`flex items-center justify-center p-2 rounded-lg ${iconBgColor}`}>
                  {icon}
                </div>
            </CardHeader>
            <CardContent>
                {change !== undefined && change !== null && value !== 'N/A' && (
                    <p className={`text-xs ${isPositive ? 'text-red-500' : isNegative ? 'text-blue-500' : 'text-muted-foreground'}`}>
                        <span className={`font-semibold`}>
                            {isPositive ? '▲' : '▼'} {Math.abs(change).toFixed(1)}%
                        </span>
                        <span className='text-muted-foreground ml-1'>vs last year</span>
                    </p>
                )}
            </CardContent>
        </Card>
    );
};


// --- MAIN DASHBOARD COMPONENT ---
const OmsDashboard: React.FC = () => {
    const [reports, setReports] = useState<UtilityBill[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [chartView, setChartView] = useState<ChartView>('trend');

    useEffect(() => {
        const q = query(collection(db, "utility-bills"), orderBy("billingMonth", "desc"));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const fetchedReports = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UtilityBill));
            setReports(fetchedReports);
            setLoading(false);
        }, (err) => {
            console.error("Error fetching utility bills: ", err);
            setError("Dashboard data could not be loaded.");
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const { latestReport, previousReport, lastYearReport, reportHistory } = useMemo(() => {
        if (!reports || reports.length === 0) return { latestReport: null, previousReport: null, lastYearReport: null, reportHistory: [] };

        const sortedReports = [...reports].sort((a, b) => b.billingMonth.localeCompare(a.billingMonth));
        const latest = sortedReports[0];
        const [latestYear, latestMonth] = latest.billingMonth.split('-').map(Number);
        
        const previousBillingMonth = new Date(latestYear, latestMonth - 2).toISOString().slice(0, 7);
        const previous = sortedReports.find(r => r.billingMonth === previousBillingMonth) || null;

        const lastYearBillingMonth = `${latestYear - 1}-${String(latestMonth).padStart(2, '0')}`;
        const lastYear = sortedReports.find(r => r.billingMonth === lastYearBillingMonth) || null;
        
        const history = sortedReports.slice(0, 12).sort((a,b) => a.billingMonth.localeCompare(b.billingMonth));

        return { latestReport: latest, previousReport: previous, lastYearReport: lastYear, reportHistory: history };
    }, [reports]);

    const timeSeriesData = useMemo(() => {
      if(reportHistory.length === 0) return [];
      
      const firstReport = reportHistory[0];
      const getWaterUsage = (r: UtilityBill) => (r.water?.general?.usage_m3 ?? 0) + (r.water?.fire_hydrant?.usage_m3 ?? 0);

      const firstValues = {
        electricity: firstReport.electricity.usage.total_usage || 1,
        gas: firstReport.gas.usage_m3 || 1,
        water: getWaterUsage(firstReport) || 1,
      };

      return reportHistory.map(r => {
        const waterUsage = getWaterUsage(r);
        return {
          name: `${r.billingMonth.split('-')[0].slice(2)}년 ${Number(r.billingMonth.split('-')[1])}월`,
          electricity: r.electricity.usage.total_usage ?? 0,
          gas: r.gas.usage_m3 ?? 0,
          water: waterUsage,
          electricity_trend: ((r.electricity.usage.total_usage ?? 0) / firstValues.electricity) * 100,
          gas_trend: ((r.gas.usage_m3 ?? 0) / firstValues.gas) * 100,
          water_trend: (waterUsage / firstValues.water) * 100,
        }
      });
    }, [reportHistory]);

    const solarContributionData = useMemo(() => {
      if(!latestReport) return [];
      const totalUsage = latestReport.electricity.usage.total_usage ?? 0;
      const solarGeneration = latestReport.environmental?.solar_power_generation_kwh ?? 0;
      const gridUsage = Math.max(0, totalUsage - solarGeneration);
      
      return [{
        name: '전기 사용',
        '그리드 사용량': gridUsage,
        '태양광 발전량': solarGeneration,
      }];
    }, [latestReport]);

    if (loading) {
      return <div className="flex justify-center items-center h-64"><p>Loading Dashboard...</p></div>
    }

    if (error) {
        return <Alert variant="destructive"><AlertTitle>Error</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>;
    }

    if (!latestReport) {
        return (
             <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 rounded-lg p-12">
                <TrendingUp className="h-10 w-10 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-700">No Data Available</h3>
                <p className="text-sm text-gray-500">Please upload a report to display the dashboard.</p>
            </div>
        );
    }
    
    const latestTotalCost = latestReport.grand_total ?? 0;
    const previousTotalCost = previousReport?.grand_total ?? 0;
    const costChange = latestTotalCost - previousTotalCost;
    const costChangePercentage = previousTotalCost ? (costChange / previousTotalCost) * 100 : 0;
    
    const [latestYear, latestMonth] = latestReport.billingMonth.split('-').map(Number);
    
    const getChange = (current: number | undefined | null, previous: number | undefined | null) => {
        if (current === undefined || current === null || previous === undefined || previous === null || previous === 0) return null;
        return ((current - previous) / previous) * 100;
    };

    const ChartContent = () => {
      switch(chartView) {
        case 'electricity':
          return <Area type="monotone" dataKey="electricity" stroke="#3B82F6" fill="url(#colorElectricity)" strokeWidth={2} unit=" kWh" name="전기" />;
        case 'gas':
          return <Area type="monotone" dataKey="gas" stroke="#F59E0B" fill="url(#colorGas)" strokeWidth={2} unit=" m³" name="가스" />;
        case 'water':
           return <Area type="monotone" dataKey="water" stroke="#0D9488" fill="url(#colorWater)" strokeWidth={2} unit=" m³" name="수도" />;
        default: // 'trend'
          return (
            <>
              <Line type="monotone" dataKey="electricity_trend" stroke="#3B82F6" strokeWidth={2} unit="%" name="전기 변화율" />
              <Line type="monotone" dataKey="gas_trend" stroke="#F59E0B" strokeWidth={2} unit="%" name="가스 변화율" />
              <Line type="monotone" dataKey="water_trend" stroke="#0D9488" strokeWidth={2} unit="%" name="수도 변화율" />
            </>
          );
      }
    };
    
    const yAxisLabel = chartView === 'trend' ? '%' : chartView === 'electricity' ? 'kWh' : 'm³';

    return (
      <div className="bg-[#F8F9FA] p-6 space-y-6 -m-6">

        {/* --- HEADER & HERO KPI --- */}
        <Card className="rounded-2xl shadow-md border-0">
          <CardHeader>
              <CardTitle className="font-bold tracking-tight">
                {latestYear}년 {latestMonth}월 집계 현황
              </CardTitle>
              <CardDescription>전월, 전년 동월 데이터와 비교하여 핵심 지표를 요약합니다.</CardDescription>
          </CardHeader>
          <CardContent>
              <div className="text-4xl font-extrabold tabular-nums text-gray-800 mb-2">
                  {latestTotalCost.toLocaleString()}원
              </div>
              {previousReport && (
                <Badge variant={costChange > 0 ? "destructive" : "default"} className={`rounded-full py-1 px-3 bg-opacity-10 ${costChange > 0 ? 'bg-red-500 text-red-600' : 'bg-blue-500 text-blue-600'}`}>
                    {costChange > 0 ? <ArrowUp className="h-3 w-3 mr-1"/> : <ArrowDown className="h-3 w-3 mr-1"/>}
                    {Math.abs(costChangePercentage).toFixed(1)}% ({Math.abs(costChange).toLocaleString()}원) {costChange > 0 ? "증가" : "절감"}
                </Badge>
              )}
          </CardContent>
        </Card>

        {/* --- KEY METRICS CARDS --- */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
             <MetricCard 
                title="전기 사용량"
                value={latestReport.electricity.usage.total_usage?.toLocaleString() ?? 'N/A'}
                change={getChange(latestReport.electricity.usage.total_usage, lastYearReport?.electricity.usage.total_usage)}
                icon={<Zap className="h-5 w-5 text-blue-600"/>}
                iconBgColor='bg-blue-100'
                unit="kWh"
            />
             <MetricCard 
                title="가스 사용량"
                value={latestReport.gas.usage_m3?.toLocaleString() ?? 'N/A'}
                change={getChange(latestReport.gas.usage_m3, lastYearReport?.gas.usage_m3)}
                icon={<Flame className="h-5 w-5 text-amber-600"/>}
                iconBgColor='bg-amber-100'
                unit="m³"
            />
             <MetricCard 
                title="월평균 기온"
                value={latestReport.environmental?.avg_monthly_temperature_celsius?.toFixed(1) ?? 'N/A'}
                change={getChange(latestReport.environmental?.avg_monthly_temperature_celsius, lastYearReport?.environmental?.avg_monthly_temperature_celsius)}
                icon={<Thermometer className="h-5 w-5 text-red-600"/>}
                iconBgColor='bg-red-100'
                unit="°C"
            />
             <MetricCard 
                title="태양광 발전량"
                value={latestReport.environmental?.solar_power_generation_kwh?.toLocaleString() ?? 'N/A'}
                change={getChange(latestReport.environmental?.solar_power_generation_kwh, lastYearReport?.environmental?.solar_power_generation_kwh)}
                icon={<Sun className="h-5 w-5 text-emerald-600"/>}
                iconBgColor='bg-emerald-100'
                unit="kWh"
            />
        </div>
        
        {/* --- TIME-SERIES CHART --- */}
        <Card className="rounded-2xl shadow-md border-0">
            <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="font-bold">시계열 분석</CardTitle>
                    <CardDescription>최근 12개월간 에너지 사용량 변화 추이를 분석합니다.</CardDescription>
                  </div>
                  <div className='flex items-center bg-gray-100 p-1 rounded-lg'>
                    {(['trend', 'electricity', 'gas', 'water'] as ChartView[]).map(view => (
                      <Button 
                        key={view} 
                        size="sm"
                        onClick={() => setChartView(view)} 
                        className={`capitalize text-xs rounded-md ${chartView === view ? 'bg-white text-gray-800 shadow-sm' : 'bg-transparent text-gray-500 hover:bg-white/50'}`}
                      >
                       {view === 'trend' ? '변화율 (%)' : view}
                      </Button>
                    ))}
                  </div>
                </div>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                    <AreaChart data={timeSeriesData}>
                        <defs>
                          <linearGradient id="colorElectricity" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4}/>
                            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                          </linearGradient>
                           <linearGradient id="colorGas" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.4}/>
                            <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/>
                          </linearGradient>
                           <linearGradient id="colorWater" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#0D9488" stopOpacity={0.4}/>
                            <stop offset="95%" stopColor="#0D9488" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.5}/>
                        <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis fontSize={12} tickLine={false} axisLine={false} unit={yAxisLabel} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        {ChartContent()}
                    </AreaChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
        
        {/* --- SOLAR CONTRIBUTION CHART --- */}
        <Card className="rounded-2xl shadow-md border-0">
             <CardHeader>
                <CardTitle className="font-bold">태양광 발전 기여도</CardTitle>
                <CardDescription>총 전기 사용량 중 태양광 발전을 통해 절감된 양을 보여줍니다.</CardDescription>
            </CardHeader>
            <CardContent>
               <ResponsiveContainer width="100%" height={150}>
                  <BarChart data={solarContributionData} layout="vertical" margin={{ left: 10, right: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                      <XAxis type="number" hide />
                      <YAxis type="category" dataKey="name" hide />
                      <Tooltip formatter={(value: number) => `${value.toLocaleString()} kWh`} />
                      <Legend />
                      <Bar dataKey="그리드 사용량" stackId="a" fill="#E5E7EB" name="외부 전력 (Grid)" />
                      <Bar dataKey="태양광 발전량" stackId="a" fill="#10B981" name="태양광 발전 (Solar)" />
                  </BarChart>
              </ResponsiveContainer>
            </CardContent>
        </Card>
      </div>
    );
}

export default OmsDashboard;
