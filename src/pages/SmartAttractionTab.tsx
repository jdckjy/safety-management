
import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';

// --- 데이터 타입 정의 ---
interface TargetCompany {
  id: string;
  companyName: string;
  businessNumber: string;
  industry: string;
  location: string;
  financialScore: number;
  growthScore: number;
  clusterFitScore: number;
  totalScore: number;
}

interface IRActivity {
  id: string;
  type: string;
  content: string;
  createdAt: any;
}

const SmartAttractionTab: React.FC = () => {
  const [targets, setTargets] = useState<TargetCompany[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedTarget, setSelectedTarget] = useState<TargetCompany | null>(null);
  const [activities, setActivities] = useState<IRActivity[]>([]);
  const [newActivityType, setNewActivityType] = useState('');
  const [newActivityContent, setNewActivityContent] = useState('');
  const [isLogDialogOpen, setIsLogDialogOpen] = useState(false);

  // --- 데이터 로딩 ---
  useEffect(() => {
    const q = query(collection(db, 'attraction_targets'), orderBy('totalScore', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const companies = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TargetCompany));
      setTargets(companies);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // --- IR 활동 로딩 ---
  useEffect(() => {
    if (selectedTarget) {
      const activityQuery = query(
        collection(db, `attraction_targets/${selectedTarget.id}/ir_activities`),
        orderBy('createdAt', 'desc')
      );
      const unsubscribe = onSnapshot(activityQuery, (snapshot) => {
        const fetchedActivities = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as IRActivity));
        setActivities(fetchedActivities);
      });
      return () => unsubscribe();
    }
  }, [selectedTarget]);

  // --- IR 활동 저장 ---
  const handleSaveActivity = async () => {
    if (!selectedTarget || !newActivityType || !newActivityContent) {
      alert('활동 유형과 내용을 모두 입력해주세요.');
      return;
    }
    const activityCollection = collection(db, `attraction_targets/${selectedTarget.id}/ir_activities`);
    await addDoc(activityCollection, {
      type: newActivityType,
      content: newActivityContent,
      createdAt: serverTimestamp(),
    });
    setNewActivityType('');
    setNewActivityContent('');
    setIsLogDialogOpen(false);
  };

  return (
    <div>
      {/* ... (Header remains the same) ... */}
      <h2 className="text-xl font-semibold mb-2">스마트 타겟팅: 잠재 유치 기업 리스트</h2>
      <p className="text-sm text-gray-600 mb-4">심평원 및 통계청 데이터를 기반으로 자동 분석된 헬스케어타운 최적화 잠재 유치 기업 목록입니다.</p>
      <div className="border rounded-lg">
        <Table>
           <TableHeader>
            <TableRow>
              <TableHead>기업명</TableHead>
              <TableHead>업종</TableHead>
              <TableHead className="text-right">종합 유치 점수</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={3} className="text-center">데이터를 불러오는 중입니다...</TableCell></TableRow>
            ) : targets.length === 0 ? (
              <TableRow><TableCell colSpan={3} className="text-center">아직 등록된 타겟 기업이 없습니다.</TableCell></TableRow>
            ) : (
              targets.map((target) => (
                <Dialog key={target.id} onOpenChange={(open) => open && setSelectedTarget(target)}>
                  <DialogTrigger asChild>
                    <TableRow className="cursor-pointer">
                      <TableCell className="font-medium">{target.companyName}</TableCell>
                      <TableCell>{target.industry}</TableCell>
                      <TableCell className="text-right font-bold">{target.totalScore}</TableCell>
                    </TableRow>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[800px] bg-white">
                    <DialogHeader>
                      <DialogTitle>{target.companyName}</DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-x-8 gap-y-4 py-4">
                      <div>
                        <h4 className="font-semibold mb-3">기업 정보</h4>
                        <p><strong>사업자등록번호:</strong> {target.businessNumber}</p>
                        <p><strong>소재지:</strong> {target.location}</p>
                        <p><strong>재무건전성:</strong> {target.financialScore} / 100</p>
                        <p><strong>성장성:</strong> {target.growthScore} / 100</p>
                        <p><strong>클러스터 적합도:</strong> {target.clusterFitScore} / 100</p>
                      </div>
                      <div>
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="font-semibold">IR 활동 로그</h4>
                           <Dialog open={isLogDialogOpen} onOpenChange={setIsLogDialogOpen}>
                            <DialogTrigger asChild>
                              <Button size="sm">IR 활동 기록</Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                               <DialogHeader>
                                <DialogTitle>새 IR 활동 기록</DialogTitle>
                              </DialogHeader>
                              <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label htmlFor="activity-type" className="text-right">활동 유형</Label>
                                  <Input id="activity-type" value={newActivityType} onChange={(e) => setNewActivityType(e.target.value)} className="col-span-3" placeholder="예: 최초 연락, 제안서 발송"/>
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label htmlFor="activity-content" className="text-right">내용</Label>
                                  <Textarea id="activity-content" value={newActivityContent} onChange={(e) => setNewActivityContent(e.target.value)} className="col-span-3" placeholder="활동에 대한 구체적인 내용을 입력하세요."/>
                                </div>
                              </div>
                               <Button onClick={handleSaveActivity}>저장</Button>
                            </DialogContent>
                          </Dialog>
                        </div>
                        <Card>
                          <CardContent className="pt-6">
                            {activities.length > 0 ? (
                              <div className="space-y-4">
                                {activities.map(act => (
                                  <div key={act.id} className="text-sm">
                                    <p className="font-bold">{act.type} <span className="text-xs font-normal text-gray-500 ml-2">{new Date(act.createdAt?.toDate()).toLocaleString()}</span></p>
                                    <p className="text-gray-700 whitespace-pre-wrap">{act.content}</p>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-center text-gray-500">기록된 IR 활동이 없습니다.</p>
                            )}
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default SmartAttractionTab;
