
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { useLeaseAnalytics } from '../hooks/useLeaseAnalytics';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { useProjectData } from '../providers/ProjectDataProvider';
import LeaseSimulator from '../components/LeaseSimulator'; // [신규] 시뮬레이터 컴포넌트 임포트

ChartJS.register(
  CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend
);

const StatDisplay = ({ label, value }: { label: string; value: string | number }) => (
  <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-gray-50 text-center">
    <p className="text-sm font-medium text-gray-500">{label}</p>
    <p className="text-xl font-bold text-gray-800">{value}</p>
  </div>
);

const LeaseAnalysisPage: React.FC = () => {
  const { tenantUnits, complexFacilities } = useProjectData();
  const { analytics } = useLeaseAnalytics(tenantUnits, complexFacilities);

  const chartData = {
    labels: Object.keys(analytics).filter(k => k !== '전체'),
    datasets: [
      {
        label: '임대율 (%)',
        data: Object.values(analytics).filter(v => v !== analytics['전체']).map(v => v.leaseRate.toFixed(1)),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
      },
    ],
  };

  const overallAnalytics = analytics['전체'];

  if (!tenantUnits || !complexFacilities || !overallAnalytics) {
    return (
        <div className="flex justify-center items-center h-screen">
            <p className="text-lg text-gray-600">분석 데이터를 불러오는 중입니다...</p>
        </div>
    );
  }

  // [수정] 2단 그리드 레이아웃 적용
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* 좌측: 기존 분석 대시보드 */}
      <div className="lg:col-span-2">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>실시간 임대 현황 및 수익 분석</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatDisplay label="전체 임대율" value={`${overallAnalytics.leaseRate.toFixed(1)}%`} />
                <StatDisplay label="월 예상수익 (현재)" value={`${(overallAnalytics.leasedRevenue / 100000000).toFixed(1)}억`} />
                <StatDisplay label="총 공실 수" value={`${overallAnalytics.vacantCount}개`} />
                <StatDisplay label="전체 잠재수익" value={`${(overallAnalytics.totalPotentialRevenue / 100000000).toFixed(1)}억`} />
            </div>

            {Object.keys(analytics).filter(k => k !== '전체').length > 0 ? (
              <div>
                <h3 className="font-semibold text-md mb-2 text-gray-800">시설별 임대율 현황</h3>
                <div style={{height: '250px'}}>
                  <Bar 
                    data={chartData} 
                    options={{ maintainAspectRatio: false, responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, max: 100, ticks: { stepSize: 25, callback: (value) => `${value}%` } }, x: { grid: { display: false } } } }}
                  />
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500">시설별 분석 데이터가 없습니다.</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 우측: 공실 해소 시뮬레이터 */}
      <div className="lg:col-span-1">
        <LeaseSimulator />
      </div>
    </div>
  );
};

export default LeaseAnalysisPage;
