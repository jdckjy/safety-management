
import React, { useMemo } from 'react';
import { RefreshCw, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useProjectData } from '@/providers/ProjectDataProvider';
import { Badge } from '../ui/badge';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const ManagementSimulationCard: React.FC = () => {
    const { latestEvaluationResult, rentalHistory, leaseRealtimeMetrics } = useProjectData();

    // --- Data Calculation ---
    const currentScore = latestEvaluationResult?.score ?? 0;
    const targetScore = 2.5;
    const percentage = targetScore > 0 ? (currentScore / targetScore) * 100 : 0;

    const getBadgeInfo = (p: number) => {
        if (p >= 80) return { text: 'Excellent', className: 'bg-green-100 text-green-800' };
        if (p >= 60) return { text: 'Good', className: 'bg-blue-100 text-blue-800' };
        if (p >= 40) return { text: 'Watch', className: 'bg-yellow-100 text-yellow-800' };
        return { text: 'Risk', className: 'bg-red-100 text-red-800' };
    };
    const badgeInfo = getBadgeInfo(percentage);

    const { chartData, yoyChange } = useMemo(() => {
        const CURRENT_YEAR = new Date().getFullYear();
        const NUM_YEARS = 5;
        
        const historicalRates = new Map(rentalHistory.map(h => [h.year, h.occupancy_rate]));
        
        if (leaseRealtimeMetrics) {
            historicalRates.set(CURRENT_YEAR, leaseRealtimeMetrics.realtimeOccupancyRate);
        }
        
        const data = [];
        for (let i = 0; i < NUM_YEARS; i++) {
            const year = CURRENT_YEAR - (NUM_YEARS - 1) + i;
            if (historicalRates.has(year)) {
                data.push({
                    year: String(year),
                    '임대율': parseFloat(historicalRates.get(year)!.toFixed(2)),
                });
            }
        }
        
        const finalChartData = data.sort((a, b) => parseInt(a.year) - parseInt(b.year));
        
        const currentRate = historicalRates.get(CURRENT_YEAR);
        const prevRate = historicalRates.get(CURRENT_YEAR - 1);
        
        let change: number | null = null;
        if (currentRate !== undefined && prevRate !== undefined) {
            change = currentRate - prevRate;
        }

        return { chartData: finalChartData, yoyChange: change };
    }, [rentalHistory, leaseRealtimeMetrics]);

    // --- Custom Chart Components ---
    const CustomizedDot: React.FC<any> = ({ cx, cy, index }) => {
        const isLastDot = index === chartData.length - 1;
        if (isLastDot && yoyChange !== null) {
            const isPositive = yoyChange >= 0;
            return (
                <g>
                    <circle cx={cx} cy={cy} r={4} fill="#8884d8" stroke="white" strokeWidth={2}/>
                    <foreignObject x={cx - 40} y={cy - 42} width={80} height={35}>
                        <div
                            className={`flex items-center justify-center font-bold text-xs p-1 rounded-md shadow-sm ${isPositive ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'}`}>
                            {isPositive ? <ArrowUpRight className="h-3 w-3 mr-0.5" /> : <ArrowDownRight className="h-3 w-3 mr-0.5" />}
                            {Math.abs(yoyChange).toFixed(2)}%
                        </div>
                    </foreignObject>
                </g>
            );
        }
        return <circle cx={cx} cy={cy} r={3} fill="#8884d8" />;
    };

    // --- Render ---
    return (
        <div className="bg-white p-6 rounded-2xl shadow-md h-full flex flex-col justify-between">
            <div>
                {/* Header */}
                <div className="flex flex-row items-center justify-between">
                    <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-gray-900">경영평가 시뮬레이션</h3>
                        <Badge className={badgeInfo.className}>{badgeInfo.text}</Badge>
                    </div>
                    <RefreshCw className="h-5 w-5 text-gray-400 cursor-pointer hover:text-gray-600" />
                </div>

                {/* Main Score & Progress (Restored) */}
                <div className="text-center pt-4">
                    <Badge className="mb-2 bg-purple-100 text-purple-800 font-medium py-1 px-3 rounded-full">현시점 득점</Badge>
                    <div className="text-5xl font-bold text-purple-600">
                        {currentScore.toFixed(3)}<span className="text-3xl font-medium text-gray-500 ml-1">점</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">총 배점 {targetScore.toFixed(1)}점 기준</p>

                    <div className="w-full mt-4 px-4">
                        <div className="flex justify-between items-end mb-1">
                            <p className="text-sm font-medium text-gray-700">득점 확보 현황</p>
                            <span className="text-sm font-bold text-purple-600">{percentage.toFixed(2)}%</span>
                        </div>
                        <div className="relative w-full bg-gray-200 rounded-full h-3">
                            <div 
                                className="bg-purple-600 h-3 rounded-full" 
                                style={{ width: `${percentage}%` }}
                            ></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Graph Section */}
            <div className="mt-4 pt-4 border-t">
                 <h4 className="text-sm font-semibold text-gray-600 text-center mb-2">최근 5개년 임대율 추이</h4>
                <div style={{ height: '100px' }}>
                    {chartData.length > 1 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart
                                data={chartData}
                                margin={{ top: 30, right: 20, left: -20, bottom: 0 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis 
                                    dataKey="year" 
                                    tickLine={false} 
                                    axisLine={false}
                                    tickFormatter={(year) => `'${String(year).slice(2)}`}
                                    tick={{ fontSize: 11 }}
                                    interval={0}
                                />
                                <YAxis hide domain={['dataMin - 10', 'dataMax + 10']} />
                                <Tooltip
                                    contentStyle={{
                                        borderRadius: '10px',
                                        borderColor: '#ccc',
                                        fontSize: '12px',
                                        padding: '5px 10px'
                                    }}
                                    labelFormatter={(label) => `${label}년`}
                                    formatter={(value: number) => [`${value}%`, '임대율']}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="임대율"
                                    stroke="#8884d8"
                                    strokeWidth={2}
                                    dot={<CustomizedDot />}
                                    activeDot={{ r: 6, stroke: "#8884d8", strokeWidth: 2, fill: "white" }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="text-center text-sm text-gray-500 flex items-center justify-center h-full">임대율 이력 데이터가 부족합니다.</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ManagementSimulationCard;
