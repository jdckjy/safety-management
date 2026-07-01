
import React, { useMemo } from 'react';
import { ArrowRight } from 'lucide-react';
import { useProfitAnalysis } from '@/hooks/useProfitAnalysis';
import { useProjectData } from '@/providers/ProjectDataProvider';
import { LineChart, Line, BarChart, Bar, ResponsiveContainer, YAxis, Tooltip } from 'recharts';

export const ProfitSummaryCard: React.FC = () => {
  const { summary, loading, error, transactions } = useProfitAnalysis();
  const { navigateTo } = useProjectData();

  const chartData = useMemo(() => {
    if (!transactions || transactions.length === 0) return [];
    
    const sorted = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    let cumulativeProfit = 0;
    const data = sorted.map(t => {
        cumulativeProfit += (t.type === 'income' ? t.amount : -t.amount);
        return { date: new Date(t.date).toLocaleDateString(), profit: cumulativeProfit };
    });
    return data;
  }, [transactions]);

  const barChartData = [
    {
      name: '수익/지출',
      총수입: summary.totalIncome,
      총지출: summary.totalExpense,
    },
  ];

  const formatCurrency = (value: number) => {
    if (typeof value !== 'number') return '0원';
    return `${new Intl.NumberFormat('ko-KR').format(value)}원`;
  }
  
  const cardBaseClasses = "bg-white p-4 md:p-6 rounded-2xl shadow-sm h-full flex flex-col";

  if (loading) {
    return <div className={`${cardBaseClasses} items-center justify-center`}><p className="text-gray-500">수익 데이터 로딩 중...</p></div>;
  }
  if (error) {
    return <div className={`${cardBaseClasses} items-center justify-center p-4 text-center`}><p className="font-semibold text-red-500">데이터 로드 실패</p><p className="text-xs text-gray-400 mt-1">{error}</p></div>;
  }
  if (transactions.length === 0) {
    return <div className={`${cardBaseClasses} items-center justify-center`}><p className="text-gray-500">거래 내역 없음</p></div>;
  }

  const { totalIncome, totalExpense } = summary;
  const netProfit = totalIncome - totalExpense;
  const expenseRatio = totalIncome > 0 ? (totalExpense / totalIncome) * 100 : 0;

  const Commentary = () => {
    if (netProfit < 0) {
      return (
        <p className="text-xs text-gray-500 bg-gray-50 p-2 rounded-md">
          연 총 지출이 수입을 초과하여 적자 발생. 지출 효율화가 필요합니다.
        </p>
      )
    }
    return (
        <p className="text-xs text-gray-500 bg-gray-50 p-2 rounded-md">
            수익이 안정적으로 발생하고 있습니다. 추가적인 사업 확장을 고려해볼 수 있습니다.
        </p>
    )
  }

  return (
    <div className={`${cardBaseClasses} space-y-4`}>
      <div className="flex flex-row items-center justify-between">
        <h3 className="text-base font-semibold text-gray-800">수익 현황 요약</h3>
        <button onClick={() => navigateTo({ menuKey: 'lease' })} className="flex items-center text-xs text-gray-500 hover:text-gray-700">
            detail <ArrowRight className="h-4 w-4 ml-1" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="h-16">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
              <Line type="monotone" dataKey="profit" stroke="#ef4444" strokeWidth={2} dot={false} />
              <Tooltip 
                contentStyle={{ fontSize: '10px', padding: '2px 5px', border: '1px solid #eee', borderRadius: '5px'}} 
                labelFormatter={(label) => `날짜: ${label}`}
                formatter={(value: number) => [formatCurrency(value), '누적 순이익']}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="h-16 flex justify-end">
           <ResponsiveContainer width="50%" height="100%">
                <BarChart data={barChartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                    <Bar dataKey="총수입" fill="#3b82f6" />
                    <Bar dataKey="총지출" fill="#ef4444" />
                    <Tooltip 
                      contentStyle={{ fontSize: '10px', padding: '2px 5px', border: '1px solid #eee', borderRadius: '5px'}} 
                      formatter={(value: number) => [formatCurrency(value), '금액']}
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
      </div>

      <div className="text-center">
          <p className="text-xs text-gray-500">순이익</p>
          <p className={`text-2xl font-bold ${netProfit >= 0 ? 'text-gray-800' : 'text-red-600'}`}>
              {formatCurrency(netProfit)}
          </p>
      </div>

      <div className="w-full">
        <div className="relative h-2 w-full bg-red-400 rounded-full overflow-hidden">
          <div className="absolute h-2 bg-blue-500 rounded-full" style={{ width: `${100 - (expenseRatio > 100 ? 100 : expenseRatio)}%` }}></div>
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1.5">
          <span>총수입: {formatCurrency(totalIncome)}</span>
          <span>총지출: {formatCurrency(totalExpense)}</span>
        </div>
      </div>

      <Commentary />

    </div>
  );
};
