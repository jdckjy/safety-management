
import React, { useState, useMemo } from 'react';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import { parseExcelFile, ProfitAnalysisData } from '../../utils/ExcelParser';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const ProfitAnalysis: React.FC = () => {
  const [transactions, setTransactions] = useState<ProfitAnalysisData[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        setError(null);
        const jsonData = await parseExcelFile(file);
        setTransactions(jsonData);
      } catch (err: any) {
        setError(err.message || 'An unexpected error occurred during parsing.');
        setTransactions([]);
      }
    }
  };

  const summary = useMemo(() => {
    const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const netProfit = totalIncome - totalExpense;
    return { totalIncome, totalExpense, netProfit, transactionCount: transactions.length };
  }, [transactions]);

  const categoryData = useMemo(() => {
    const expenseByCategory = transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {} as { [key: string]: number });

    const incomeByCategory = transactions
      .filter(t => t.type === 'income')
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {} as { [key: string]: number });

    return {
      expense: Object.entries(expenseByCategory).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value),
      income: Object.entries(incomeByCategory).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value),
    };
  }, [transactions]);

  const monthlyData = useMemo(() => {
    const dataByMonth = transactions.reduce((acc, t) => {
      const month = new Date(t.date).toISOString().slice(0, 7); // YYYY-MM
      if (!acc[month]) {
        acc[month] = { month, income: 0, expense: 0 };
      }
      if (t.type === 'income') {
        acc[month].income += t.amount;
      } else {
        acc[month].expense += t.amount;
      }
      return acc;
    }, {} as { [key: string]: { month: string; income: number; expense: number } });

    return Object.values(dataByMonth).sort((a, b) => a.month.localeCompare(b.month));
  }, [transactions]);


  return (
    <div className="container mx-auto p-4 space-y-8">
      
      <div>
        <h1 className="text-2xl font-bold mb-4">수익 분석 대시보드</h1>
        <Card>
          <CardHeader>
            <CardTitle>엑셀 파일 업로드</CardTitle>
          </CardHeader>
          <CardContent>
            <Input id="excel-upload" type="file" accept=".xlsx, .xls" onChange={handleFileChange} className="max-w-sm" />
            {error && <p className="text-red-500 mt-2">Error: {error}</p>}
          </CardContent>
        </Card>
      </div>

      {transactions.length > 0 && (
        <>
          {/* Summary Section */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">총 수입</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(summary.totalIncome)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">총 지출</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(summary.totalExpense)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">순이익</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(summary.netProfit)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">총 거래 건수</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary.transactionCount}</div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Section */}
          <Tabs defaultValue="categories">
            <TabsList>
              <TabsTrigger value="categories">카테고리별 분석</TabsTrigger>
              <TabsTrigger value="monthly">월별 추이</TabsTrigger>
            </TabsList>
            <TabsContent value="categories" className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>지출 카테고리</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie data={categoryData.expense.slice(0, 5)} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#8884d8" label>
                         {categoryData.expense.slice(0, 5).map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                      </Pie>
                      <Tooltip formatter={(value) => new Intl.NumberFormat('ko-KR').format(value as number)} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>수입 카테고리</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie data={categoryData.income.slice(0, 5)} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#82ca9d" label>
                        {categoryData.income.slice(0, 5).map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                      </Pie>
                      <Tooltip formatter={(value) => new Intl.NumberFormat('ko-KR').format(value as number)} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="monthly">
              <Card>
                <CardHeader>
                  <CardTitle>월별 수입 및 지출</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis tickFormatter={(value) => new Intl.NumberFormat('ko-KR').format(value as number)} />
                      <Tooltip formatter={(value) => new Intl.NumberFormat('ko-KR').format(value as number)} />
                      <Legend />
                      <Line type="monotone" dataKey="income" stroke="#82ca9d" name="수입" />
                      <Line type="monotone" dataKey="expense" stroke="#ff8042" name="지출" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Transactions Table */}
          <Card>
            <CardHeader>
              <CardTitle>전체 거래 내역</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>일자</TableHead>
                    <TableHead>유형</TableHead>
                    <TableHead>카테고리</TableHead>
                    <TableHead>거래처</TableHead>
                    <TableHead>내용</TableHead>
                    <TableHead className="text-right">금액</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((t, index) => (
                    <TableRow key={index}>
                      <TableCell>{new Date(t.date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${t.type === 'income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {t.type === 'income' ? '수입' : '지출'}
                        </span>
                      </TableCell>
                      <TableCell>{t.category}</TableCell>
                      <TableCell>{t.client}</TableCell>
                      <TableCell>{t.description}</TableCell>
                      <TableCell className="text-right">{new Intl.NumberFormat('ko-KR').format(t.amount)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default ProfitAnalysis;
