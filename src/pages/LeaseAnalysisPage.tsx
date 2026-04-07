import { useState, useMemo, useEffect, useCallback } from 'react';
import { DollarSign } from "lucide-react";
import { useProjectData } from '../providers/ProjectDataProvider';
import { useLeaseAnalytics } from '@/hooks/useLeaseAnalytics';
import LeaseSimulator from '@/components/LeaseSimulator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { FinancialEntryForm } from '@/components/FinancialEntryForm';
import { FinancialDataTable } from '@/components/FinancialDataTable';
import { Income, Expense } from '@/types';
import FinancialSummary from '@/components/FinancialSummary';
import {
  addIncome, addExpense,
  getIncomes, getExpenses,
  updateIncome, updateExpense,
  deleteIncome, deleteExpense
} from '@/firebase';

const LeaseAnalysisPage = () => {
  const { tenantUnits, complexFacilities } = useProjectData();
  const { analytics } = useLeaseAnalytics(tenantUnits, complexFacilities);

  const [incomeItems, setIncomeItems] = useState<Income[]>([]);
  const [expenseItems, setExpenseItems] = useState<Expense[]>([]);

  const fetchFinancialData = useCallback(async () => {
    try {
      const [incomes, expenses] = await Promise.all([getIncomes(), getExpenses()]);
      setIncomeItems(incomes);
      setExpenseItems(expenses);
    } catch (error) {
      console.error("재무 데이터를 불러오는 중 오류 발생:", error);
    }
  }, []);

  useEffect(() => {
    fetchFinancialData();
  }, [fetchFinancialData]);

  const handleAddFinancialItem = async (
    item: Omit<Income, 'id'> | Omit<Expense, 'id'>, 
    type: 'income' | 'expense'
  ) => {
    try {
      if (type === 'income') {
        await addIncome(item as Omit<Income, 'id'>);
      } else {
        await addExpense(item as Omit<Expense, 'id'>);
      }
      await fetchFinancialData();
    } catch (error) {
      console.error("항목 추가 중 오류 발생:", error);
    }
  };

  const handleUpdateFinancialItem = async (
    id: string, 
    updates: Partial<Omit<Income, 'id'>> | Partial<Omit<Expense, 'id'>>,
    type: 'income' | 'expense'
  ) => {
    try {
      if (type === 'income') {
        await updateIncome(id, updates);
      } else {
        await updateExpense(id, updates);
      }
      await fetchFinancialData();
    } catch (error) {
      console.error("항목 수정 중 오류 발생:", error);
    }
  };

  const handleDeleteFinancialItem = async (id: string, type: 'income' | 'expense') => {
    try {
      if (type === 'income') {
        await deleteIncome(id);
      } else {
        await deleteExpense(id);
      }
      await fetchFinancialData();
    } catch (error) {
      console.error("항목 삭제 중 오류 발생:", error);
    }
  };
  
  const totalAnalytics = analytics['전체'] || { leasedRevenue: 0, leaseRate: 0 };
  const totalLeaseRevenue = totalAnalytics.leasedRevenue;
  const totalOtherIncome = incomeItems.reduce((sum, item) => sum + item.amount, 0);
  const totalExpense = expenseItems.reduce((sum, item) => sum + item.amount, 0);
  const netIncome = totalLeaseRevenue + totalOtherIncome - totalExpense;

  const formatCurrency = (value: number) => new Intl.NumberFormat('ko-KR').format(value) + '원';

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">실시간 임대 현황 및 수익 분석</h1>
      
      <Tabs defaultValue="overview">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview">종합 분석</TabsTrigger>
          <TabsTrigger value="details">상세 수익/지출 내역</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <div className="grid gap-6 mt-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-sm font-medium">총 임대료 수입</CardTitle>
                  <DollarSign className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(totalLeaseRevenue)}</div>
                  <p className="text-xs text-muted-foreground">모든 임대 세대 합산</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-sm font-medium">총 기타 수입</CardTitle>
                  <DollarSign className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(totalOtherIncome)}</div>
                  <p className="text-xs text-muted-foreground">관리비, 부대시설 등</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-sm font-medium">총 지출</CardTitle>
                  <DollarSign className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(totalExpense)}</div>
                  <p className="text-xs text-muted-foreground">유지보수, 용역비 등</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-sm font-medium">총 순수익</CardTitle>
                  <DollarSign className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(netIncome)}</div>
                  <p className="text-xs text-muted-foreground">(총 수입 - 총 지출)</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            <div className="lg:col-span-2">
                <FinancialSummary incomeData={incomeItems} expenseData={expenseItems} />
            </div>
            <div>
              <LeaseSimulator />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="details">
            <div className="grid gap-6 mt-6 lg:grid-cols-3">
                <div className="lg:col-span-1">
                    <FinancialEntryForm onSubmit={handleAddFinancialItem} />
                </div>
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader><CardTitle>수입 및 지출 내역</CardTitle></CardHeader>
                        <CardContent>
                            <FinancialDataTable 
                                incomeItems={incomeItems} 
                                expenseItems={expenseItems} 
                                onUpdate={handleUpdateFinancialItem}
                                onDelete={handleDeleteFinancialItem}
                            />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LeaseAnalysisPage;
