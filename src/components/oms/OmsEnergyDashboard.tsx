
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useProjectData } from '../../providers/ProjectDataProvider';
import { MonthlyReport } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { TrendingUp, Zap, Droplets, Flame } from 'lucide-react';

const OmsEnergyDashboard: React.FC = () => {
  const { monthly_reports } = useProjectData();

  if (!monthly_reports || monthly_reports.length === 0) {
    return (
      <Alert>
        <TrendingUp className="h-4 w-4" />
        <AlertTitle>데이터 없음</AlertTitle>
        <AlertDescription>
          표시할 에너지 데이터가 없습니다. 먼저 '보고서 업로드' 탭에서 월간 보고서를 추가해주세요.
        </AlertDescription>
      </Alert>
    );
  }

  // 최신 보고서를 기준으로 데이터를 표시합니다.
  const latestReport = monthly_reports.reduce((latest, report) => 
    new Date(report.year, report.month - 1) > new Date(latest.year, latest.month - 1) ? report : latest
  , monthly_reports[0]);

  const { energyUsage, energyCosts } = latestReport.raw_data;

  // 월별 전기 사용량 데이터 (과거 데이터가 있다면 차트에 표시)
  const chartData = monthly_reports
    .map((report: MonthlyReport) => ({
      month: `${report.year}-${String(report.month).padStart(2, '0')}`,
      "전기 사용량 (kWh)": report.raw_data.energyUsage.electricityKwh.value || 0,
      "수도 사용량 (m³)": report.raw_data.energyUsage.waterM3.value || 0,
    }))
    .sort((a, b) => a.month.localeCompare(b.month));

  return (
    <div className="space-y-6">
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center">
                    <TrendingUp className="mr-2 text-indigo-500" />
                    {latestReport.year}년 {latestReport.month}월 에너지 현황
                </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-500 flex items-center"><Zap className="w-4 h-4 mr-1.5 text-yellow-500"/>전기</h4>
                    <p className="text-2xl font-bold">{energyUsage.electricityKwh.value.toLocaleString()} <span className="text-sm font-normal">{energyUsage.electricityKwh.unit}</span></p>
                    <p className="text-sm text-gray-600">{energyCosts.electricity.finalAmount.value.toLocaleString()}원</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-500 flex items-center"><Droplets className="w-4 h-4 mr-1.5 text-blue-500"/>수도</h4>
                    <p className="text-2xl font-bold">{energyUsage.waterM3.value.toLocaleString()} <span className="text-sm font-normal">{energyUsage.waterM3.unit}</span></p>
                    <p className="text-sm text-gray-600">{energyCosts.water.generalTotal.value.toLocaleString()}원</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-500 flex items-center"><Flame className="w-4 h-4 mr-1.5 text-red-500"/>가스</h4>
                    <p className="text-2xl font-bold">{energyUsage.gasM3.value.toLocaleString()} <span className="text-sm font-normal">{energyUsage.gasM3.unit}</span></p>
                    <p className="text-sm text-gray-600">{energyCosts.gas.usageCharge.value.toLocaleString()}원</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <h4 className="text-sm font-medium text-green-700">총 에너지 비용</h4>
                    <p className="text-2xl font-bold text-green-800">{energyCosts.total.value.toLocaleString()}<span className="text-sm font-normal">원</span></p>
                </div>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>월별 사용량 추이</CardTitle>
            </CardHeader>
            <CardContent>
                <div style={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer>
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                        <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                        <Tooltip formatter={(value: number, name: string) => [value.toLocaleString(), name]} />
                        <Legend />
                        <Bar yAxisId="left" dataKey="전기 사용량 (kWh)" fill="#8884d8" />
                        <Bar yAxisId="right" dataKey="수도 사용량 (m³)" fill="#82ca9d" />
                    </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    </div>
  );
};

export default OmsEnergyDashboard;
