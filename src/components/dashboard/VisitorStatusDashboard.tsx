
import React, { useState, useMemo, useEffect } from 'react';
import { doc, collection, addDoc, updateDoc, deleteDoc, serverTimestamp, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '@/firebase';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { Users, ClipboardList, TrendingUp, Target } from 'lucide-react';
import { useProjectData } from '@/providers/ProjectDataProvider';
import VisitorListSlideOver from './VisitorListSlideOver';

interface VisitorData {
    id: string;
    tenantId: string;
    year: number;
    month: number;
    visitorCount: number;
    remarks: string;
    createdAt: any;
}

interface EnrichedVisitorData extends VisitorData {
    tenantName: string;
}

const VisitorStatusDashboard: React.FC = () => {
    const { tenantInfo } = useProjectData();
    const [visitorData, setVisitorData] = useState<VisitorData[]>([]);
    const [selectedTenant, setSelectedTenant] = useState<string>('');
    const [year, setYear] = useState<string>(String(new Date().getFullYear()));
    const [month, setMonth] = useState<string>(String(new Date().getMonth() + 1));
    const [visitorCount, setVisitorCount] = useState<string>('');
    const [remarks, setRemarks] = useState<string>('');
    const [editingVisitorId, setEditingVisitorId] = useState<string | null>(null);
    const [isSlideOverOpen, setIsSlideOverOpen] = useState(false);

    useEffect(() => {
        const q = query(collection(db, "visitorData"), orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const data: VisitorData[] = [];
            querySnapshot.forEach((doc) => {
                data.push({ id: doc.id, ...doc.data() } as VisitorData);
            });
            setVisitorData(data);
        });

        return () => unsubscribe();
    }, []);

    const handleSave = async () => {
        if (!selectedTenant || !year || !month || !visitorCount) {
            alert('모든 필수 항목을 입력해주세요.');
            return;
        }

        const dataToSave = {
            tenantId: selectedTenant,
            year: parseInt(year),
            month: parseInt(month),
            visitorCount: parseInt(visitorCount),
            remarks: remarks,
        };

        try {
            if (editingVisitorId) {
                const docRef = doc(db, 'visitorData', editingVisitorId);
                await updateDoc(docRef, dataToSave);
                alert('데이터가 성공적으로 수정되었습니다.');
            } else {
                await addDoc(collection(db, 'visitorData'), { ...dataToSave, createdAt: serverTimestamp() });
                alert('데이터가 성공적으로 저장되었습니다.');
            }
            resetForm();
        } catch (error) {
            console.error("Error saving document: ", error);
            alert('데이터 저장 중 오류가 발생했습니다.');
        }
    };

    const handleEdit = (visitor: VisitorData) => {
        setEditingVisitorId(visitor.id);
        setSelectedTenant(visitor.tenantId);
        setYear(String(visitor.year));
        setMonth(String(visitor.month));
        setVisitorCount(String(visitor.visitorCount));
        setRemarks(visitor.remarks);
    };

    const handleEditAndCloseDrawer = (visitor: VisitorData) => {
        handleEdit(visitor);
        setIsSlideOverOpen(false);
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('정말로 이 데이터를 삭제하시겠습니까?')) return;
        try {
            await deleteDoc(doc(db, "visitorData", id));
            alert('데이터가 성공적으로 삭제되었습니다.');
        } catch (error) {
            console.error("Error deleting document: ", error);
            alert('데이터 삭제 중 오류가 발생했습니다.');
        }
    };

    const resetForm = () => {
        setEditingVisitorId(null);
        setSelectedTenant('');
        setYear(String(new Date().getFullYear()));
        setMonth(String(new Date().getMonth() + 1));
        setVisitorCount('');
        setRemarks('');
    }
    
    const enrichedVisitorData: EnrichedVisitorData[] = useMemo(() => {
        return visitorData.map(v => ({
            ...v,
            tenantName: tenantInfo.find(t => t.id === v.tenantId)?.companyName || '알 수 없음'
        }));
    }, [visitorData, tenantInfo]);

    const {
        prevMonthDisplay,
        totalVisitorsPrevMonth,
        visitorGrowthRate,
        activeTenantsPrevMonth,
        cumulativeVisitorsThisYear,
        yearlyTarget,
        goalAchievement
    } = useMemo(() => {
        const now = new Date();
        const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const prevYear = prevMonthDate.getFullYear();
        const prevMonth = prevMonthDate.getMonth() + 1;

        const twoMonthsAgoDate = new Date(now.getFullYear(), now.getMonth() - 2, 1);
        const twoMonthsAgoYear = twoMonthsAgoDate.getFullYear();
        const twoMonthsAgoMonth = twoMonthsAgoDate.getMonth() + 1;

        const prevMonthData = enrichedVisitorData.filter(d => d.year === prevYear && d.month === prevMonth);
        const twoMonthsAgoData = enrichedVisitorData.filter(d => d.year === twoMonthsAgoYear && d.month === twoMonthsAgoMonth);
        
        const totalVisitorsPrevMonth = prevMonthData.reduce((sum, item) => sum + item.visitorCount, 0);
        const totalVisitorsTwoMonthsAgo = twoMonthsAgoData.reduce((sum, item) => sum + item.visitorCount, 0);
        
        const growth = totalVisitorsTwoMonthsAgo > 0 ? ((totalVisitorsPrevMonth - totalVisitorsTwoMonthsAgo) / totalVisitorsTwoMonthsAgo) * 100 : (totalVisitorsPrevMonth > 0 ? 100 : 0);
        
        const activeTenantsPrevMonth = new Set(prevMonthData.map(d => d.tenantId)).size;

        const yearlyTarget = 41769;
        const currentYear = new Date().getFullYear();
        const cumulativeVisitorsThisYear = enrichedVisitorData
            .filter(d => d.year === currentYear)
            .reduce((sum, item) => sum + item.visitorCount, 0);

        const goalAchievement = yearlyTarget > 0 ? (cumulativeVisitorsThisYear / yearlyTarget) * 100 : 0;

        return { 
            prevMonthDisplay: `${prevYear}년 ${prevMonth}월`,
            totalVisitorsPrevMonth, 
            visitorGrowthRate: growth, 
            activeTenantsPrevMonth,
            cumulativeVisitorsThisYear,
            yearlyTarget,
            goalAchievement,
        };
    }, [enrichedVisitorData]);

    const monthlyVisitorTrend = useMemo(() => {
        const trend = Array.from({ length: 12 }, (_, i) => ({ month: `${i + 1}월`, '이용객 수': 0 }));
        enrichedVisitorData
            .filter(d => d.year === new Date().getFullYear())
            .forEach(d => {
                if (d.month >= 1 && d.month <= 12) {
                    trend[d.month - 1]['이용객 수'] += d.visitorCount;
                }
            });
        return trend;
    }, [enrichedVisitorData]);

    return (
        <div className="bg-gray-50 flex flex-col p-6 font-sans">
            <header className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold text-gray-800">이용객 현황 관리 대시보드</h1>
                <Button onClick={() => setIsSlideOverOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
                    <ClipboardList className="mr-2 h-4 w-4" />
                    이용객 현황 전체보기
                </Button>
            </header>

            <main className="flex flex-col gap-6">
                {/* KPI Cards */}
                <div className="grid grid-cols-3 gap-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">총 이용객 ({prevMonthDisplay})</CardTitle>
                            <Users className="h-4 w-4 text-gray-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{totalVisitorsPrevMonth.toLocaleString()}명</div>
                            <p className={`text-xs ${visitorGrowthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                <TrendingUp className="inline-block h-3 w-3 mr-1" />
                                {visitorGrowthRate.toFixed(1)}% 직전월 대비
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">기관별 데이터 현황 ({prevMonthDisplay})</CardTitle>
                            <Users className="h-4 w-4 text-gray-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{activeTenantsPrevMonth} / {tenantInfo.length} <span className="text-base font-normal">기관</span></div>
                            <p className="text-xs text-gray-500">데이터 제출 기관 수</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">연간 목표 달성률</CardTitle>
                            <Target className="h-4 w-4 text-gray-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{goalAchievement.toFixed(1)}%</div>
                            <p className="text-xs text-gray-500">
                                {cumulativeVisitorsThisYear.toLocaleString()} / {yearlyTarget.toLocaleString()} 명
                            </p>
                            <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                                <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${goalAchievement}%` }}></div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-12 gap-6">
                    <div className="col-span-4">
                        <Card className="flex flex-col">
                            <CardHeader>
                                <CardTitle className="text-lg">{editingVisitorId ? '이용객 정보 수정' : '신규 이용객 등록'}</CardTitle>
                            </CardHeader>
                            <CardContent className="flex flex-col gap-4">
                                <div className="space-y-1">
                                    <Label htmlFor="tenant">입주기관</Label>
                                    <Select value={selectedTenant} onValueChange={setSelectedTenant}>
                                        <SelectTrigger id="tenant"><SelectValue placeholder="기관을 선택하세요" /></SelectTrigger>
                                        <SelectContent>
                                            {tenantInfo.map(t => <SelectItem key={t.id} value={t.id}>{t.companyName}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <Label htmlFor="year">기준연도</Label>
                                        <Input id="year" type="number" placeholder="YYYY" value={year} onChange={e => setYear(e.target.value)} />
                                    </div>
                                    <div className="space-y-1">
                                        <Label htmlFor="month">기준월</Label>
                                        <Input id="month" type="number" placeholder="MM" value={month} onChange={e => setMonth(e.target.value)} />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="visitorCount">월 이용객 수</Label>
                                    <Input id="visitorCount" type="number" placeholder="이용객 수를 입력하세요" value={visitorCount} onChange={e => setVisitorCount(e.target.value)} />
                                </div>
                                <div className="space-y-1 flex flex-col">
                                    <Label htmlFor="remarks">비고</Label>
                                    <Textarea id="remarks" placeholder="(옵션)" value={remarks} onChange={e => setRemarks(e.target.value)} />
                                </div>
                            </CardContent>
                            <CardFooter className="flex justify-end gap-2">
                                <Button variant="outline" onClick={resetForm}>초기화</Button>
                                <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white">{editingVisitorId ? '수정' : '저장'}</Button>
                            </CardFooter>
                        </Card>
                    </div>
                    <div className="col-span-8">
                        <Card className="flex flex-col h-[450px]">
                            <CardHeader>
                                <CardTitle>금년 월별 이용객 추이</CardTitle>
                            </CardHeader>
                            <CardContent className="flex-1 -ml-6">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={monthlyVisitorTrend}>
                                        <XAxis dataKey="month" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                        <Tooltip />
                                        <Legend />
                                        <Line type="monotone" dataKey="이용객 수" stroke="#2563eb" strokeWidth={2} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
            
            <VisitorListSlideOver 
                isOpen={isSlideOverOpen} 
                onClose={() => setIsSlideOverOpen(false)} 
                visitors={enrichedVisitorData} 
                onEdit={handleEditAndCloseDrawer} 
                onDelete={handleDelete} 
            />
        </div>
    );
};

export default VisitorStatusDashboard;
