
import React, { useState, useMemo, useEffect } from 'react';
import { doc, collection, addDoc, updateDoc, deleteDoc, serverTimestamp, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '@/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { Users } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useProjectData } from '@/providers/ProjectDataProvider';


interface VisitorData {
    id: string;
    tenantId: string;
    year: number;
    month: number;
    visitorCount: number;
    remarks: string;
    createdAt: any;
}

const VisitorStatusDashboard: React.FC = () => {
    const { tenantInfo } = useProjectData();
    const [visitorData, setVisitorData] = useState<VisitorData[]>([]);
    const [selectedTenant, setSelectedTenant] = useState<string>('');
    const [year, setYear] = useState<string>('');
    const [month, setMonth] = useState<string>('');
    const [visitorCount, setVisitorCount] = useState<string>('');
    const [remarks, setRemarks] = useState<string>('');
    const [editingVisitorId, setEditingVisitorId] = useState<string | null>(null);

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

    const handleDelete = async (id: string) => {
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
        setYear('');
        setMonth('');
        setVisitorCount('');
        setRemarks('');
    }
    
    const enrichedVisitorData = useMemo(() => {
        return visitorData.map(v => ({
            ...v,
            tenantName: tenantInfo.find(t => t.id === v.tenantId)?.companyName || '알 수 없음'
        }));
    }, [visitorData, tenantInfo]);

    const { totalVisitors, visitorGrowthRate } = useMemo(() => {
        const currentMonthData = enrichedVisitorData.filter(d => d.year === new Date().getFullYear() && d.month === new Date().getMonth() + 1);
        const prevMonthData = enrichedVisitorData.filter(d => d.year === new Date().getFullYear() && d.month === new Date().getMonth());
        
        const totalCurrent = currentMonthData.reduce((sum, item) => sum + item.visitorCount, 0);
        const totalPrev = prevMonthData.reduce((sum, item) => sum + item.visitorCount, 0);
        
        const growth = totalPrev > 0 ? ((totalCurrent - totalPrev) / totalPrev) * 100 : 0;
        return { totalVisitors: totalCurrent, visitorGrowthRate: growth };
    }, [enrichedVisitorData]);

    const monthlyVisitorTrend = useMemo(() => {
        const trend = Array.from({ length: 12 }, (_, i) => ({ month: `${i + 1}월`, '이용객 수': 0 }));
        enrichedVisitorData.forEach(d => {
            if (d.year === new Date().getFullYear()) {
                trend[d.month - 1]['이용객 수'] += d.visitorCount;
            }
        });
        return trend;
    }, [enrichedVisitorData]);
    
    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">이용객 현황 관리 대시보드</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">총 이용객</CardTitle>
                        <Users className="h-4 w-4 text-gray-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalVisitors.toLocaleString()}명</div>
                        <p className={`text-xs ${visitorGrowthRate >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {visitorGrowthRate.toFixed(1)}% 전월 대비
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <Card className="lg:col-span-1">
                     <CardHeader>
                        <CardTitle>{editingVisitorId ? '이용객 정보 수정' : '이용객 등록'}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Select value={selectedTenant} onValueChange={setSelectedTenant}>
                            <SelectTrigger><SelectValue placeholder="입주기관 선택" /></SelectTrigger>
                            <SelectContent>
                                {tenantInfo.map(t => <SelectItem key={t.id} value={t.id}>{t.companyName}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <div className="grid grid-cols-2 gap-4">
                            <Input type="number" placeholder="기준연도 (e.g. 2024)" value={year} onChange={e => setYear(e.target.value)} />
                            <Input type="number" placeholder="기준월 (1-12)" value={month} onChange={e => setMonth(e.target.value)} />
                        </div>
                        <Input type="number" placeholder="월 이용객 수" value={visitorCount} onChange={e => setVisitorCount(e.target.value)} />
                        <Textarea placeholder="비고 (옵션)" value={remarks} onChange={e => setRemarks(e.target.value)} />
                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={resetForm}>초기화</Button>
                            <Button onClick={handleSave}>{editingVisitorId ? '수정' : '저장'}</Button>
                        </div>
                    </CardContent>
                </Card>
                
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

            <Card>
                <CardHeader>
                    <CardTitle>이용객 현황</CardTitle>
                </CardHeader>
                <CardContent>
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
                                {enrichedVisitorData.map(d => (
                                    <TableRow key={d.id}>
                                        <TableCell>{d.tenantName}</TableCell>
                                        <TableCell>{d.year}-{String(d.month).padStart(2, '0')}</TableCell>
                                        <TableCell>{d.visitorCount.toLocaleString()}</TableCell>
                                        <TableCell>{d.createdAt?.toDate().toLocaleDateString()}</TableCell>
                                        <TableCell>
                                            <Button variant="link" size="sm" onClick={() => handleEdit(d)}>수정</Button>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="link" size="sm" className="text-red-500">삭제</Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>정말로 삭제하시겠습니까?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            이 작업은 되돌릴 수 없습니다. 데이터가 영구적으로 삭제됩니다.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>취소</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => handleDelete(d.id)}>삭제</AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
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
