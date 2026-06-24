
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend, BarChart, Bar, PieChart, Pie } from 'recharts';
import { Users, Building, TrendingUp, TrendingDown, ArrowUp, ArrowDown, ChevronsUpDown } from 'lucide-react';

// Mock Data based on PRD
const mockTenants = [
    { id: 'T001', name: '한국의학연구소' },
    { id: 'T002', name: '서울아산병원' },
    { id: 'T003', name: '세브란스병원' },
];

const mockVisitorData = [
    { id: 'V001', tenantId: 'T001', tenantName: '한국의학연구소', year: 2024, month: 5, visitorCount: 12450, remarks: '' },
    { id: 'V002', tenantId: 'T002', tenantName: '서울아산병원', year: 2024, month: 5, visitorCount: 9800, remarks: '' },
    { id: 'V003', tenantId: 'T003', tenantName: '세브란스병원', year: 2024, month: 5, visitorCount: 8500, remarks: '' },
    { id: 'V004', tenantId: 'T001', tenantName: '한국의학연구소', year: 2024, month: 4, visitorCount: 11500, remarks: '' },
    { id: 'V005', tenantId: 'T002', tenantName: '서울아산병원', year: 2024, month: 4, visitorCount: 9200, remarks: '' },
];

const VisitorStatusDashboard: React.FC = () => {
    // Section 1: KPI Summary Data
    const { totalVisitors, visitorGrowthRate, topTenantName, topTenantVisitors, averageVisitors, tenantCount } = useMemo(() => {
        const currentMonthVisitors = mockVisitorData.filter(d => d.year === 2024 && d.month === 5);
        const prevMonthVisitors = mockVisitorData.filter(d => d.year === 2024 && d.month === 4);

        const totalCurrent = currentMonthVisitors.reduce((sum, item) => sum + item.visitorCount, 0);
        const totalPrev = prevMonthVisitors.reduce((sum, item) => sum + item.visitorCount, 0);

        const growth = totalPrev > 0 ? ((totalCurrent - totalPrev) / totalPrev) * 100 : 0;
        const topTenant = [...currentMonthVisitors].sort((a, b) => b.visitorCount - a.visitorCount)[0];

        return {
            totalVisitors: totalCurrent,
            visitorGrowthRate: growth,
            topTenantName: topTenant?.tenantName || 'N/A',
            topTenantVisitors: topTenant?.visitorCount || 0,
            averageVisitors: currentMonthVisitors.length > 0 ? totalCurrent / currentMonthVisitors.length : 0,
            tenantCount: new Set(currentMonthVisitors.map(d => d.tenantId)).size,
        };
    }, []);

    // Section 2: Monthly Visitor Trend
    const monthlyVisitorTrend = useMemo(() => {
        const trend = Array.from({ length: 12 }, (_, i) => ({ month: `${i + 1}월`, '이용객 수': 0 }));
        mockVisitorData.forEach(d => {
            if (d.year === 2024) {
                trend[d.month - 1]['이용객 수'] += d.visitorCount;
            }
        });
        return trend;
    }, []);
    
    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">이용객 현황 관리 대시보드</h1>
            
            {/* Section 1: KPI Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                {/* KPI Card 1: Total Visitors */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">총 이용객</CardTitle>
                        <Users className="h-4 w-4 text-gray-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalVisitors.toLocaleString()}명</div>
                        <p className={`text-xs ${visitorGrowthRate >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {visitorGrowthRate >= 0 ? '+' : ''}{visitorGrowthRate.toFixed(1)}% 전월 대비
                        </p>
                    </CardContent>
                </Card>
                 {/* ... Other KPI Cards ... */}
            </div>

            {/* Section 2 & 3: Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                 {/* Section 2 Left: Form */}
                <Card className="lg:col-span-1">
                     <CardHeader>
                        <CardTitle>이용객 등록/수정</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Select>
                            <SelectTrigger><SelectValue placeholder="입주기관 선택" /></SelectTrigger>
                            <SelectContent>
                                {mockTenants.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <div className="grid grid-cols-2 gap-4">
                            <Input type="number" placeholder="기준연도 (e.g. 2024)" />
                            <Input type="number" placeholder="기준월 (1-12)" />
                        </div>
                        <Input type="number" placeholder="월 이용객 수" />
                        <Textarea placeholder="비고 (옵션)" />
                        <div className="flex justify-end gap-2">
                            <Button variant="outline">초기화</Button>
                            <Button>저장</Button>
                        </div>
                    </CardContent>
                </Card>
                
                {/* Section 2 Right: Trend Chart */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>월별 이용객 추이</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={monthlyVisitorTrend}>
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="이용객 수" stroke="#8884d8" />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Section 4: Data Management Table */}
            <Card>
                <CardHeader>
                    <CardTitle>이용객 현황</CardTitle>
                </CardHeader>
                <CardContent>
                   {/* ... Search and Action Toolbar ... */}
                   <div className="overflow-x-auto">
                        <Table>
                             <TableHeader>
                                <TableRow>
                                    <TableHead>기관명</TableHead>
                                    <TableHead>기준연월</TableHead>
                                    <TableHead>이용객수</TableHead>
                                    <TableHead>등록일</TableHead>
                                    <TableHead>수정/삭제</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {mockVisitorData.map(d => (
                                    <TableRow key={d.id}>
                                        <TableCell>{d.tenantName}</TableCell>
                                        <TableCell>{d.year}-{String(d.month).padStart(2, '0')}</TableCell>
                                        <TableCell>{d.visitorCount.toLocaleString()}</TableCell>
                                        <TableCell>{new Date().toLocaleDateString()}</TableCell>
                                        <TableCell>
                                            <Button variant="link" size="sm">수정</Button>
                                            <Button variant="link" size="sm" className="text-red-500">삭제</Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

        </div>
    );
};

export default VisitorStatusDashboard;
