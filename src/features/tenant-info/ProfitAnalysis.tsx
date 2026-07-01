
import React, { useState, useMemo, useEffect, useRef } from 'react';
import * as XLSX from 'xlsx';
import { collection, getDocs, query, orderBy, writeBatch, doc } from 'firebase/firestore';
import { db } from '../../firebase';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '../../components/ui/sheet';
import { FileUp, Trash2, List, TrendingUp, TrendingDown, Wallet, FileText } from 'lucide-react';

export interface ProfitAnalysisData {
  id?: string;
  date: string;
  category: string;
  description: string;
  client: string;
  amount: number;
  type: 'income' | 'expense';
}

const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#3B82F6', '#F97316'];
const TRANSACTIONS_COLLECTION = 'transactions';

// Helper component for empty chart states
const ChartPlaceholder = ({ message }: { message: string }) => (
  <div className="flex items-center justify-center h-full text-center">
    <p className="text-sm text-muted-foreground">{message}</p>
  </div>
);

const ProfitAnalysis: React.FC = () => {
  const [transactions, setTransactions] = useState<ProfitAnalysisData[]>([]);
  const [stagedTransactions, setStagedTransactions] = useState<ProfitAnalysisData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    setSelectedMonth('all');
    setSelectedCategory(null);
  }, [selectedYear]);

  useEffect(() => {
    setSelectedCategory(null);
  }, [selectedMonth]);

  const fetchTransactions = async () => {
    setLoading(true);
    setError(null);
    try {
      const q = query(collection(db, TRANSACTIONS_COLLECTION), orderBy("date", "desc"));
      const querySnapshot = await getDocs(q);
      const dataFromDb = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ProfitAnalysisData));
      setTransactions(dataFromDb);
    } catch (err: any) {
      setError("데이터를 불러오는 중 오류가 발생했습니다: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setLoading(true);
      setError(null);
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array', cellDates: true });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const json: any[] = XLSX.utils.sheet_to_json(worksheet);

          const processedData: ProfitAnalysisData[] = json.map((row: any): ProfitAnalysisData => {
            const category = row['계정과목명'] || '';
            const amountStr = String(row['당기실적'] || '0');
            let amount = parseFloat(amountStr.replace(/,/g, ''));
            const detailedProjectCode = String(row['세부사업'] || '');
            const type: 'income' | 'expense' = detailedProjectCode.startsWith('9') ? 'income' : 'expense';
            const dateValue = row['일자'];
            let isoDate = '';
            if (dateValue instanceof Date) {
              isoDate = dateValue.toISOString();
            } else if (typeof dateValue === 'number') {
              const excelEpoch = new Date(Date.UTC(1899, 11, 30));
              const jsDate = new Date(excelEpoch.getTime() + dateValue * 24 * 60 * 60 * 1000);
              isoDate = jsDate.toISOString();
            } else {
              isoDate = new Date().toISOString();
            }

            return {
              date: isoDate,
              category: category,
              description: row['적요'] || '',
              client: row['거래처명'] || '',
              amount: isNaN(amount) ? 0 : amount,
              type: type,
            };
          }).filter(item => item.amount !== 0 && item.category && item.category.trim() !== '');

          const newItems = processedData.filter(newItem =>
            !transactions.some(existingItem =>
              existingItem.date === newItem.date &&
              existingItem.category === newItem.category &&
              existingItem.description === newItem.description &&
              existingItem.client === newItem.client &&
              existingItem.amount === newItem.amount &&
              existingItem.type === newItem.type
            )
          );
          
          setStagedTransactions(newItems);
          const duplicateCount = processedData.length - newItems.length;
          const zeroAmountCount = json.length - processedData.length;
          alert(`${newItems.length}개의 새로운 데이터를 미리보기에 추가했습니다. ${duplicateCount}개의 중복 데이터와 ${zeroAmountCount}개의 0원 데이터를 제외했습니다.`);

        } catch (err: any) {
          setError('파일 처리 중 오류가 발생했습니다: ' + err.message);
        } finally {
          setLoading(false);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        }
      };
      reader.onerror = () => {
        setError('파일을 읽는 데 실패했습니다.');
        setLoading(false);
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const handleSaveStagedTransactions = async () => {
    if (stagedTransactions.length === 0) {
      alert("저장할 새로운 데이터가 없습니다.");
      return;
    }
    setLoading(true);
    try {
      const batch = writeBatch(db);
      const collectionRef = collection(db, TRANSACTIONS_COLLECTION);
      stagedTransactions.forEach(item => {
        const docRef = doc(collectionRef);
        batch.set(docRef, item);
      });

      await batch.commit();

      alert(`${stagedTransactions.length}개의 데이터가 성공적으로 저장되었습니다.`);
      setStagedTransactions([]);
      await fetchTransactions();
    } catch (err: any) {
      setError('데이터 저장 중 오류가 발생했습니다: ' + err.message);
      setLoading(false);
    }
  };

  const handleClearStaged = () => {
    if (loading) return;
    setStagedTransactions([]);
  };
  
  const handleClearAllData = async () => {
    if (window.confirm("정말로 모든 데이터를 영구적으로 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) {
      setLoading(true);
      setError(null);
      try {
        const q = query(collection(db, TRANSACTIONS_COLLECTION));
        const querySnapshot = await getDocs(q);
        const docsToDelete = querySnapshot.docs;
        const totalDocs = docsToDelete.length;

        if (totalDocs === 0) {
          alert("삭제할 데이터가 없습니다.");
          setLoading(false);
          return;
        }

        const batchSize = 500;
        for (let i = 0; i < totalDocs; i += batchSize) {
          const batch = writeBatch(db);
          const end = Math.min(i + batchSize, totalDocs);
          const batchDocs = docsToDelete.slice(i, end);
          
          batchDocs.forEach(doc => {
            batch.delete(doc.ref);
          });
          
          await batch.commit();
        }

        alert(`총 ${totalDocs}개의 데이터가 성공적으로 삭제되었습니다.`);
        setTransactions([]);
        setStagedTransactions([]);
      } catch (err: any) {
        setError("데이터 삭제 중 오류가 발생했습니다: " + err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const availableYears = useMemo(() => {
    const years = new Set(transactions.map(t => new Date(t.date).getFullYear()));
    return ['all', ...Array.from(years).sort((a, b) => b - a)];
  }, [transactions]);

  const yearFilteredTransactions = useMemo(() => {
    if (selectedYear === 'all') return transactions;
    const year = parseInt(selectedYear, 10);
    return transactions.filter(t => !isNaN(year) && new Date(t.date).getFullYear() === year);
  }, [transactions, selectedYear]);

  const availableMonths = useMemo(() => {
    if (selectedYear === 'all') return [];
    const months = new Set(yearFilteredTransactions.map(t => new Date(t.date).toISOString().slice(5, 7)));
    return ['all', ...Array.from(months).sort()];
  }, [yearFilteredTransactions, selectedYear]);

  const filteredTransactions = useMemo(() => {
    if (selectedMonth === 'all' || selectedYear === 'all') return yearFilteredTransactions;
    return yearFilteredTransactions.filter(t => new Date(t.date).toISOString().slice(5, 7) === selectedMonth);
  }, [yearFilteredTransactions, selectedMonth, selectedYear]);
  
  const { incomeTransactions, expenseTransactions } = useMemo(() => {
    const income = filteredTransactions.filter(t => t.type === 'income');
    const expense = filteredTransactions.filter(t => t.type === 'expense');
    return { incomeTransactions: income, expenseTransactions: expense };
  }, [filteredTransactions]);

  const summary = useMemo(() => {
    return filteredTransactions.reduce((acc, curr) => {
      if (curr.type === 'income') acc.totalIncome += curr.amount;
      else acc.totalExpense += curr.amount;
      return acc;
    }, { totalIncome: 0, totalExpense: 0 });
  }, [filteredTransactions]);

  const netProfit = summary.totalIncome - summary.totalExpense;

  const categoryData = useMemo(() => {
    const data = filteredTransactions.reduce((acc, curr) => {
     const { category, amount, type } = curr;
     if (!acc[type][category]) {
       acc[type][category] = 0;
     }
     acc[type][category] += amount;
     return acc;
   }, { income: {} as Record<string, number>, expense: {} as Record<string, number> });

   return {
     income: Object.entries(data.income).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value),
     expense: Object.entries(data.expense).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value),
   };
  }, [filteredTransactions]);

  const monthlyData = useMemo(() => {
    if (selectedYear === 'all') return [];
    const data = yearFilteredTransactions.reduce((acc, curr) => {
      const month = new Date(curr.date).toISOString().slice(0, 7);
      if (!acc[month]) {
        acc[month] = { month, income: 0, expense: 0, netProfit: 0 };
      }
      if (curr.type === 'income') acc[month].income += curr.amount;
      else acc[month].expense += curr.amount;
      acc[month].netProfit = acc[month].income - acc[month].expense;
      return acc;
    }, {} as Record<string, { month: string; income: number; expense: number, netProfit: number }>);
    return Object.values(data).sort((a, b) => a.month.localeCompare(b.month));
  }, [yearFilteredTransactions, selectedYear]);


  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 bg-slate-50/50 rounded-lg">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b pb-4 border-slate-200">
          <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-slate-800">수익 분석 대시보드</h1>
              <p className="text-muted-foreground mt-1 text-sm">
                  {selectedYear === 'all'
                      ? '전체 기간'
                      : `${selectedYear}년 ${selectedMonth === 'all' ? '' : `${selectedMonth}월`}`
                  }
                  의 수입 및 지출 내역을 요약하여 보여줍니다.
              </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger className="w-[120px] bg-white"><SelectValue placeholder="연도 선택" /></SelectTrigger>
                  <SelectContent>{availableYears.map(year => <SelectItem key={year} value={String(year)}>{year === 'all' ? '전체 연도' : `${year}년`}</SelectItem>)}</SelectContent>
              </Select>
              {selectedYear !== 'all' && (
                  <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                      <SelectTrigger className="w-[100px] bg-white"><SelectValue placeholder="월 선택" /></SelectTrigger>
                      <SelectContent>{availableMonths.map(month => <SelectItem key={month} value={String(month)}>{month === 'all' ? '전체 월' : `${month}월`}</SelectItem>)}</SelectContent>
                  </Select>
              )}
              <Button variant="outline" className="bg-white" onClick={() => fileInputRef.current?.click()} disabled={loading}><FileUp className="mr-2 h-4 w-4" />업로드</Button>
              <input id="excel-upload" type="file" accept=".xlsx, .xls" onChange={handleFileChange} ref={fileInputRef} style={{ display: 'none' }} />
              <Sheet>
                  <SheetTrigger asChild>
                      <Button variant="outline" className="bg-white"><List className="mr-2 h-4 w-4" />상세 내역</Button>
                  </SheetTrigger>
                  <SheetContent className="w-full max-w-[90vw] sm:max-w-4xl lg:max-w-6xl">
                      <SheetHeader><SheetTitle>수입 및 지출 상세 내역</SheetTitle></SheetHeader>
                      <div className="py-4 grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-80px)] overflow-y-auto">
                          <TransactionTable title="지출 내역" data={expenseTransactions} />
                          <TransactionTable title="수입 내역" data={incomeTransactions} />
                      </div>
                  </SheetContent>
              </Sheet>
              <Button onClick={handleClearAllData} variant="destructive" size="icon" disabled={loading}><Trash2 className="h-4 w-4" /></Button>
          </div>
      </div>

      {loading && <div className="text-center py-10 text-muted-foreground">데이터를 불러오는 중...</div>}
      {error && <Card className="bg-red-50 border-red-200"><CardContent className="p-4 text-center text-red-700">{error}</CardContent></Card>}

      {!loading && transactions.length === 0 && (
          <Card className="flex items-center justify-center h-96 bg-white">
              <CardContent className="p-6 text-center">
                  <p className="text-lg text-muted-foreground">데이터가 없습니다.</p>
                  <p className="text-sm text-muted-foreground mt-2">상단의 '업로드' 버튼을 클릭하여 엑셀 파일을 추가하세요.</p>
              </CardContent>
          </Card>
      )}
      
      {!loading && transactions.length > 0 && (
        <>
          {filteredTransactions.length === 0 ? (
            <Card className="flex items-center justify-center h-96 bg-white">
              <CardContent className="p-6 text-center">
                <p className="text-lg text-muted-foreground">선택된 기간에 데이터가 없습니다.</p>
                <p className="text-sm text-muted-foreground mt-2">다른 연도나 월을 선택해주세요.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
                <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
                    <SummaryCard title="총 수입" value={summary.totalIncome} icon={<TrendingUp className="text-blue-500"/>} />
                    <SummaryCard title="총 지출" value={summary.totalExpense} icon={<TrendingDown className="text-red-500"/>} />
                    <SummaryCard title="순이익" value={netProfit} icon={<Wallet className="text-green-500"/>}/>
                    <SummaryCard title="총 거래 건수" value={filteredTransactions.length} isCurrency={false} icon={<FileText className="text-slate-500"/>}/>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <ChartCard title="지출 카테고리 (상위 7개)">
                            {categoryData.expense.length > 0 ? <CategoryPieChart data={categoryData.expense.slice(0, 7)} /> : <ChartPlaceholder message="지출 데이터 없음" />}
                        </ChartCard>
                        <ChartCard title="수입 카테고리 (상위 7개)">
                            {categoryData.income.length > 0 ? <CategoryPieChart data={categoryData.income.slice(0, 7)} /> : <ChartPlaceholder message="수입 데이터 없음" />}
                        </ChartCard>
                    </div>
                    <div className="lg:col-span-1">
                       <ChartCard title="월별 추이">
                            {monthlyData.length > 1 ? <MonthlyLineChart data={monthlyData} /> : <ChartPlaceholder message="차트를 표시하기에 월별 데이터가 부족합니다." />}
                        </ChartCard>
                    </div>
                </div>
            </div>
          )}
        </>
      )}

      {stagedTransactions.length > 0 && (
        <Card className="border-blue-500 border-2 mt-6">
          <CardHeader>
            <CardTitle>미리보기 및 저장</CardTitle>
            <CardDescription>{stagedTransactions.length}개의 새로운 거래 내역을 저장할 준비가 되었습니다. 아래에서 내용을 확인하세요.</CardDescription>
          </CardHeader>
          <CardContent>
            <TransactionTable title="저장 대기중인 데이터" data={stagedTransactions} />
          </CardContent>
          <CardFooter className="flex justify-end space-x-2">
            <Button onClick={handleSaveStagedTransactions} variant="default" disabled={loading}>저장</Button>
            <Button onClick={handleClearStaged} variant="outline" disabled={loading}>취소</Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
};

const SummaryCard: React.FC<{ title: string; value: number; isCurrency?: boolean, icon: React.ReactNode }> = ({ title, value, isCurrency = true, icon }) => (
  <Card className="bg-white hover:shadow-md transition-shadow">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-slate-600">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">
        {isCurrency ? new Intl.NumberFormat('ko-KR').format(value) + '원' : value}
      </div>
    </CardContent>
  </Card>
);

const ChartCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <Card className="bg-white h-full flex flex-col">
    <CardHeader><CardTitle className="text-lg">{title}</CardTitle></CardHeader>
    <CardContent className="flex-grow h-[300px] w-full">
      {children}
    </CardContent>
  </Card>
);

const CategoryPieChart: React.FC<{ data: { name: string; value: number }[] }> = ({ data }) => {
  const total = useMemo(() => data.reduce((sum, entry) => sum + entry.value, 0), [data]);

  return (
    <div className="w-full h-full flex flex-col sm:flex-row items-center justify-between">
      <div className="w-full sm:w-1/2 h-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" innerRadius="55%" outerRadius="80%" fill="#8884d8" paddingAngle={5} dataKey="value" labelLine={false}>
              {data.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
            </Pie>
            <Tooltip formatter={(value) => `${new Intl.NumberFormat('ko-KR').format(value as number)} 원`} />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
          <p className="text-xs text-muted-foreground">총계</p>
          <p className="text-lg font-bold">
            {new Intl.NumberFormat('ko-KR', { maximumFractionDigits: 0 }).format(total)}원
          </p>
        </div>
      </div>
      <div className="w-full sm:w-1/2 pr-0 sm:pr-4 flex flex-col justify-center space-y-1 mt-2 sm:mt-0">
        {data.map((entry, index) => (
          <div key={`legend-${index}`} className="flex items-center text-xs">
            <span className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: COLORS[index % COLORS.length] }}/>
            <span className="flex-1 truncate" title={entry.name}>{entry.name}</span>
            <span className="font-semibold ml-2">{`${((entry.value / total) * 100).toFixed(0)}%`}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const MonthlyLineChart: React.FC<{ data: { month: string; income: number; expense: number }[] }> = ({ data }) => (
  <ResponsiveContainer width="100%" height="100%">
    <LineChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="month" tickFormatter={(str) => `${parseInt(str.slice(5,7))}월`} fontSize={12} />
      <YAxis tickFormatter={(value) => new Intl.NumberFormat('ko-KR', {notation: 'compact'}).format(value as number)} fontSize={12} />
      <Tooltip formatter={(value) => new Intl.NumberFormat('ko-KR').format(value as number)} />
      <Legend verticalAlign="top" height={36}/>
      <Line type="monotone" dataKey="income" name="수입" stroke="#82ca9d" strokeWidth={2} dot={false} />
      <Line type="monotone" dataKey="expense" name="지출" stroke="#ff8042" strokeWidth={2} dot={false} />
    </LineChart>
  </ResponsiveContainer>
);

const TransactionTable: React.FC<{ title: string, data: ProfitAnalysisData[] }> = ({ title, data }) => (
    <Card className="h-full">
        <CardHeader><CardTitle>{title}</CardTitle></CardHeader>
        <CardContent className="h-[calc(100%-80px)] overflow-y-auto">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[100px]">일자</TableHead>
                        <TableHead>카테고리</TableHead>
                        <TableHead className="text-right">금액</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.length > 0 ? data.map((t, index) => (
                        <TableRow key={t.id || `staged-${index}`}>
                            <TableCell>{new Date(t.date).toLocaleDateString('ko-KR', { year: '2-digit', month: 'short', day: 'numeric' })}</TableCell>
                            <TableCell>{t.category}</TableCell>
                            <TableCell className="text-right font-mono">{new Intl.NumberFormat('ko-KR').format(t.amount)}원</TableCell>
                        </TableRow>
                    )) : (
                        <TableRow><TableCell colSpan={3} className="text-center h-24">데이터가 없습니다.</TableCell></TableRow>
                    )}
                </TableBody>
            </Table>
        </CardContent>
    </Card>
);

export default ProfitAnalysis;
