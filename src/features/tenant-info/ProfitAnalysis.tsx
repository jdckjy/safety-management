
import React, { useState, useMemo, useEffect, useRef } from 'react';
import * as XLSX from 'xlsx';
import { collection, addDoc, getDocs, query, orderBy, writeBatch, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';

export interface ProfitAnalysisData {
  id?: string;
  date: string;
  category: string;
  description: string;
  client: string;
  amount: number;
  type: 'income' | 'expense';
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
const TRANSACTIONS_COLLECTION = 'transactions';

const ProfitAnalysis: React.FC = () => {
  const [transactions, setTransactions] = useState<ProfitAnalysisData[]>([]);
  const [stagedTransactions, setStagedTransactions] = useState<ProfitAnalysisData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');

  useEffect(() => {
    setSelectedMonth('all');
  }, [selectedYear]);

  const availableYears = useMemo(() => {
    const years = new Set(transactions.map(t => new Date(t.date).getFullYear()));
    return ['all', ...Array.from(years).sort((a, b) => b - a)];
  }, [transactions]);

  const yearFilteredTransactions = useMemo(() => {
    if (selectedYear === 'all') {
      return transactions;
    }
    const year = parseInt(selectedYear, 10);
    return transactions.filter(t => !isNaN(year) && new Date(t.date).getFullYear() === year);
  }, [transactions, selectedYear]);

  const availableMonths = useMemo(() => {
    if (selectedYear === 'all') return [];
    const months = new Set(yearFilteredTransactions.map(t => new Date(t.date).toISOString().slice(5, 7)));
    return ['all', ...Array.from(months).sort()];
  }, [yearFilteredTransactions, selectedYear]);

  const filteredTransactions = useMemo(() => {
    if (selectedMonth === 'all') {
      return yearFilteredTransactions;
    }
    return yearFilteredTransactions.filter(t => new Date(t.date).toISOString().slice(5, 7) === selectedMonth);
  }, [yearFilteredTransactions, selectedMonth]);

  const { incomeTransactions, expenseTransactions } = useMemo(() => {
    const income = filteredTransactions.filter(t => t.type === 'income');
    const expense = filteredTransactions.filter(t => t.type === 'expense');
    return { incomeTransactions: income, expenseTransactions: expense };
  }, [filteredTransactions]);

  const fetchTransactions = async () => {
    setLoading(true);
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
            let type: 'income' | 'expense';

            if (category === '잡이익') {
              type = 'income';
              amount = Math.abs(amount);
            } else {
              const budgetBalanceStr = String(row['운영예산잔액'] || '0');
              const budgetBalance = parseFloat(budgetBalanceStr.replace(/,/g, ''));
              type = budgetBalance > 0 ? 'expense' : 'income';
            }

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
  }

  const handleClearAllData = async () => {
    if (window.confirm("정말로 모든 데이터를 영구적으로 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) {
      setLoading(true);
      try {
        const q = query(collection(db, TRANSACTIONS_COLLECTION));
        const querySnapshot = await getDocs(q);
        const batch = writeBatch(db);
        querySnapshot.docs.forEach(doc => {
          batch.delete(doc.ref);
        });
        await batch.commit();
        alert("모든 데이터가 삭제되었습니다.");
        setTransactions([]);
        setStagedTransactions([]); 
      } catch (err: any) {
        setError("데이터 삭제 중 오류가 발생했습니다: " + err.message);
      } finally {
        setLoading(false);
      }
    }
  };

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
    const data = yearFilteredTransactions.reduce((acc, curr) => {
      const month = new Date(curr.date).toISOString().slice(0, 7);
      if (!acc[month]) {
        acc[month] = { month, income: 0, expense: 0 };
      }
      if (curr.type === 'income') acc[month].income += curr.amount;
      else acc[month].expense += curr.amount;
      return acc;
    }, {} as Record<string, { month: string; income: number; expense: number }>);
    return Object.values(data).sort((a, b) => a.month.localeCompare(b.month));
  }, [yearFilteredTransactions]);

  return (
    <div className="container mx-auto p-4 space-y-8">
      <header>
        <h1 className="text-3xl font-bold mb-2">수익 분석 대시보드</h1>
        <p className="text-muted-foreground">엑셀 파일을 업로드하여 수입/지출 내역을 분석하고 관리하세요.</p>
      </header>

      <Tabs defaultValue="analysis" className="space-y-4">
        <TabsList>
          <TabsTrigger value="analysis">데이터 조회</TabsTrigger>
          <TabsTrigger value="management">데이터 관리</TabsTrigger>
        </TabsList>

        <TabsContent value="analysis" className="space-y-4">
          <div className="flex justify-end gap-2">
            <div className="w-[180px]">
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger>
                  <SelectValue placeholder="연도 선택" />
                </SelectTrigger>
                <SelectContent>
                  {availableYears.map(year => (
                    <SelectItem key={year} value={String(year)}>
                      {year === 'all' ? '전체 연도' : `${year}년`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedYear !== 'all' && (
              <div className="w-[120px]">
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger>
                    <SelectValue placeholder="월 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableMonths.map(month => (
                      <SelectItem key={month} value={String(month)}>
                        {month === 'all' ? '전체 월' : `${month}월`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {loading && <div className="text-center py-4">데이터를 불러오는 중...</div>}

          {!loading && transactions.length === 0 && (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">데이터가 없습니다. '데이터 관리' 탭에서 엑셀 파일을 업로드하여 분석을 시작하세요.</p>
              </CardContent>
            </Card>
          )}

          {!loading && transactions.length > 0 && yearFilteredTransactions.length === 0 && selectedYear !== 'all' && (
            <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-muted-foreground">{selectedYear}년에는 데이터가 없습니다.</p>
                </CardContent>
            </Card>
          )}
          
          {yearFilteredTransactions.length > 0 && (
            <>
              {selectedMonth !== 'all' && filteredTransactions.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center">
                    <p className="text-muted-foreground">{selectedYear}년 {selectedMonth}월에는 데이터가 없습니다.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <SummaryCard title="총 수입" value={summary.totalIncome} />
                  <SummaryCard title="총 지출" value={summary.totalExpense} />
                  <SummaryCard title="순이익" value={netProfit} />
                  <SummaryCard title="총 거래 건수" value={filteredTransactions.length} isCurrency={false} />
                </div>
              )}

              <Tabs defaultValue="categories">
                <TabsList>
                  <TabsTrigger value="categories">카테고리별 분석</TabsTrigger>
                  <TabsTrigger value="monthly">월별 추이</TabsTrigger>
                </TabsList>
                <TabsContent value="categories" className="grid gap-4 md:grid-cols-2">
                  {filteredTransactions.length > 0 ? (
                    <>
                      <ChartCard title="지출 카테고리 (상위 5개)">
                        <CategoryPieChart data={categoryData.expense.slice(0, 5)} />
                      </ChartCard>
                      <ChartCard title="수입 카테고리 (상위 5개)">
                        <CategoryPieChart data={categoryData.income.slice(0, 5)} />
                      </ChartCard>
                    </>
                  ) : (
                    <div className="md:col-span-2">
                      <Card>
                        <CardContent className="p-6 text-center">
                          <p className="text-muted-foreground">표시할 카테고리 데이터가 없습니다.</p>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="monthly">
                  <ChartCard title="월별 수입 및 지출">
                    <MonthlyLineChart data={monthlyData} />
                  </ChartCard>
                </TabsContent>
              </Tabs>
              
              {filteredTransactions.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <TransactionTable title="지출 내역" data={expenseTransactions} showType={false} />
                  <TransactionTable title="수입 내역" data={incomeTransactions} showType={false} />
                </div>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="management" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>데이터 관리</CardTitle>
              <CardDescription>엑셀 파일을 업로드하거나 모든 데이터를 초기화할 수 있습니다.</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center space-x-4">
              <Input id="excel-upload" type="file" accept=".xlsx, .xls" onChange={handleFileChange} ref={fileInputRef} className="max-w-sm" disabled={loading} />
              <Button onClick={handleClearAllData} variant="destructive" disabled={loading}>모든 데이터 삭제</Button>
            </CardContent>
            {error && <CardFooter><p className="text-red-500 mt-2">오류: {error}</p></CardFooter>}
          </Card>

          {stagedTransactions.length > 0 && (
            <Card className="border-blue-500 border-2">
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
        </TabsContent>
      </Tabs>
    </div>
  );
};

// --- Helper Components ---

const SummaryCard: React.FC<{ title: string; value: number; isCurrency?: boolean }> = ({ title, value, isCurrency = true }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">
        {isCurrency ? new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(value) : value}
      </div>
    </CardContent>
  </Card>
);

const ChartCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <Card>
    <CardHeader><CardTitle>{title}</CardTitle></CardHeader>
    <CardContent>
      <ResponsiveContainer width="100%" height={300}>{children}</ResponsiveContainer>
    </CardContent>
  </Card>
);

const CategoryPieChart: React.FC<{ data: { name: string; value: number }[] }> = ({ data }) => (
  <PieChart>
    <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#8884d8" label>
      {data.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
    </Pie>
    <Tooltip formatter={(value) => `${new Intl.NumberFormat('ko-KR').format(value as number)} 원`} />
    <Legend />
  </PieChart>
);

const MonthlyLineChart: React.FC<{ data: { month: string; income: number; expense: number }[] }> = ({ data }) => (
  <LineChart data={data}>
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey="month" />
    <YAxis tickFormatter={(value) => new Intl.NumberFormat('ko-KR').format(value as number)} />
    <Tooltip formatter={(value) => new Intl.NumberFormat('ko-KR').format(value as number)} />
    <Legend />
    <Line type="monotone" dataKey="income" stroke="#82ca9d" name="수입" strokeWidth={2} />
    <Line type="monotone" dataKey="expense" stroke="#ff8042" name="지출" strokeWidth={2} />
  </LineChart>
);

const TransactionTable: React.FC<{ title: string, data: ProfitAnalysisData[], showType?: boolean }> = ({ title, data, showType = true }) => (
    <Card>
        <CardHeader>
            <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>일자</TableHead>
                            {showType && <TableHead>유형</TableHead>}
                            <TableHead>카테고리</TableHead>
                            <TableHead>거래처</TableHead>
                            <TableHead>내용</TableHead>
                            <TableHead className="text-right">금액</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.length > 0 ? data.map((t, index) => (
                            <TableRow key={t.id || `staged-${index}`}>
                                <TableCell>{new Date(t.date).toLocaleDateString()}</TableCell>
                                {showType && 
                                    <TableCell>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${t.type === 'income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {t.type === 'income' ? '수입' : '지출'}
                                        </span>
                                    </TableCell>
                                }
                                <TableCell>{t.category}</TableCell>
                                <TableCell>{t.client}</TableCell>
                                <TableCell>{t.description}</TableCell>
                                <TableCell className="text-right">{new Intl.NumberFormat('ko-KR').format(t.amount)}원</TableCell>
                            </TableRow>
                        )) : (
                            <TableRow>
                                <TableCell colSpan={showType ? 6 : 5} className="text-center">표시할 데이터가 없습니다.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </CardContent>
    </Card>
);

export default ProfitAnalysis;
