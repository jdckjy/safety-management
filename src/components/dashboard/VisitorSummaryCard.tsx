
import React, { useState, useMemo, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '@/firebase';
import { Card, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, Tooltip } from 'recharts';

interface VisitorData {
    id: string;
    tenantId: string;
    year: number;
    month: number;
    visitorCount: number;
    [key: string]: any;
}

const VisitorSummaryCard: React.FC = () => {
    const [visitorData, setVisitorData] = useState<VisitorData[]>([]);

    useEffect(() => {
        const q = query(collection(db, "visitorData"), orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const data: VisitorData[] = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as VisitorData));
            setVisitorData(data);
        });
        return () => unsubscribe();
    }, []);

    const visitorStats = useMemo(() => {
        const currentYear = new Date().getFullYear();
        const previousYear = currentYear - 1;

        const currentYearTotal = visitorData
            .filter(d => d.year === currentYear)
            .reduce((sum, d) => sum + d.visitorCount, 0);

        const previousYearTotal = visitorData
            .filter(d => d.year === previousYear)
            .reduce((sum, d) => sum + d.visitorCount, 0);
        
        const yoyGrowth = previousYearTotal > 0 
            ? ((currentYearTotal - previousYearTotal) / previousYearTotal) * 100 
            : (currentYearTotal > 0 ? 100 : 0); // Handle division by zero

        const annualTargetTotal = 41769; // Static annual target

        const annualTargetAchievement = annualTargetTotal > 0 
            ? (currentYearTotal / annualTargetTotal) * 100 
            : 0;

        return {
            annualCumulativeVisitors: currentYearTotal,
            yoyGrowth,
            annualTargetAchievement,
            annualTargetCurrent: currentYearTotal,
            annualTargetTotal,
        }
    }, [visitorData]);

    const achievementChartData = [
        { name: 'achieved', value: visitorStats.annualTargetAchievement },
        { name: 'remaining', value: 100 - visitorStats.annualTargetAchievement },
    ];
    const GAUGE_COLORS = ['#2563eb', '#e5e7eb'];

    const monthlyVisitorTrend = useMemo(() => {
        const trend = Array.from({ length: 12 }, (_, i) => ({ name: `${i + 1}월`, visitors: 0 }));
        const currentYear = new Date().getFullYear();

        const currentYearData = visitorData.filter(d => d.year === currentYear);

        if (currentYearData.length === 0) {
            // Return placeholder data if no data for the current year
            return [
                { name: '1월', visitors: 4200 }, { name: '2월', visitors: 3800 }, { name: '3월', visitors: 5500 },
                { name: '4월', visitors: 5100 }, { name: '5월', visitors: 6200 }, { name: '6월', visitors: 5800 },
                { name: '7월', visitors: 0 }, { name: '8월', visitors: 0 }, { name: '9월', visitors: 0 },
                { name: '10월', visitors: 0 }, { name: '11월', visitors: 0 }, { name: '12월', visitors: 0 },
            ];
        }

        currentYearData.forEach(d => {
            if (d.month >= 1 && d.month <= 12) {
                trend[d.month - 1].visitors += d.visitorCount;
            }
        });

        return trend;
    }, [visitorData]);

    const yoyGrowthColor = visitorStats.yoyGrowth >= 0 ? 'text-green-600' : 'text-red-600';
    const YoyGrowthIcon = visitorStats.yoyGrowth >= 0 ? TrendingUp : TrendingDown;

    return (
        <Card className="col-span-1 p-6 bg-white rounded-2xl shadow-sm h-full flex flex-col justify-between">
            <div>
                <CardTitle className="text-lg font-semibold text-gray-900 mb-4">이용객 현황 요약</CardTitle>
                
                <div className="mb-6">
                    <p className="text-sm text-gray-500">연 누적 이용객</p>
                    <p className="text-4xl font-extrabold text-gray-800">{visitorStats.annualCumulativeVisitors.toLocaleString()}명</p>
                    <p className={`text-sm font-semibold flex items-center ${yoyGrowthColor} mt-1`}>
                        <YoyGrowthIcon className="h-4 w-4 mr-1"/>
                        {visitorStats.yoyGrowth.toFixed(1)}% (전년 동기 대비)
                    </p>
                </div>
            </div>
            
            <div className="space-y-6">
                <div>
                    <p className="text-sm font-medium text-gray-500 mb-2">연 목표 달성률</p>
                    <div className="relative w-full h-[100px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={achievementChartData}
                                    cx="50%"
                                    cy="100%"
                                    dataKey="value"
                                    startAngle={180}
                                    endAngle={0}
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={2}
                                    cornerRadius={8}
                                >
                                    {achievementChartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={GAUGE_COLORS[index % GAUGE_COLORS.length]} />
                                    ))}
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                            <span className="text-2xl font-bold text-blue-600">{visitorStats.annualTargetAchievement.toFixed(1)}%</span>
                        </div>
                    </div>
                    <p className="text-xs text-center text-gray-500 -mt-2">
                        {visitorStats.annualTargetCurrent.toLocaleString()} / {visitorStats.annualTargetTotal.toLocaleString()} 명
                    </p>
                </div>

                <div>
                    <p className="text-sm font-medium text-gray-500 mb-2">금년 월별 이용객 추이</p>
                    <div className="h-[80px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={monthlyVisitorTrend} margin={{ top: 5, right: 0, left: 0, bottom: 5 }}>
                                <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="#9ca3af" axisLine={false} tickLine={false} />
                                <Tooltip
                                    cursor={{ fill: 'rgba(229, 231, 235, 0.5)' }}
                                    contentStyle={{ fontSize: '12px', padding: '4px 8px', borderRadius: '6px', border: '1px solid #e5e7eb' }}
                                    labelStyle={{ fontWeight: 'bold' }}
                                />
                                <Bar dataKey="visitors" name="이용객 수" fill="#818cf8" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </Card>
    );
};

export default VisitorSummaryCard;
