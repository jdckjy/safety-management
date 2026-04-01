import React, { useState } from 'react';
import { useProjectData } from '@/providers/ProjectDataProvider';
import { MonthlyReport, TeamActivity } from '@/types';
import OmsUploader from './OmsUploader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import OmsEnergyDashboard from './OmsEnergyDashboard';
import OmsDashboard from './OmsDashboard'; // OmsTeamTasks 대신 OmsDashboard를 import
import Modal from '@/components/ui/Modal';
import { Button } from '@/components/ui/button';

// 월간 보고서 상세 정보 모달 컴포넌트
const MonthlyReportDetailModal: React.FC<{ report: MonthlyReport | null; onClose: () => void }> = ({ report, onClose }) => {
  if (!report) return null;

  const renderTeamActivity = (activity: TeamActivity) => (
    <div key={activity.id} className="mb-3 p-3 bg-gray-50 rounded-md">
      <h4 className="font-semibold text-gray-700">{activity.teamName}</h4>
      <ul className="list-disc list-inside text-sm text-gray-600 mt-1">
        {activity.tasks.map((task, index) => <li key={index}>{task}</li>)}
      </ul>
    </div>
  );

  return (
    <Modal isOpen={!!report} onClose={onClose}>
      <div className="p-6">
        <h2 className="text-xl font-bold mb-4">{`${report.year}년 ${report.month}월 보고서`}</h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-bold text-lg mb-2">에너지 사용량</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-3 bg-blue-50 rounded-lg"><p className="text-sm text-blue-800 font-semibold">전기</p><p className="text-xl font-bold">{report.raw_data.energyUsage.electricityKwh.value.toLocaleString()} kWh</p></div>
              <div className="p-3 bg-green-50 rounded-lg"><p className="text-sm text-green-800 font-semibold">수도</p><p className="text-xl font-bold">{report.raw_data.energyUsage.waterM3.value.toLocaleString()} m³</p></div>
              <div className="p-3 bg-yellow-50 rounded-lg"><p className="text-sm text-yellow-800 font-semibold">가스</p><p className="text-xl font-bold">{report.raw_data.energyUsage.gasM3.value.toLocaleString()} m³</p></div>
            </div>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-2">팀별 활동</h3>
            {report.raw_data.teamActivities.map(renderTeamActivity)}
          </div>
        </div>
        <div className="mt-6 text-right">
          <Button onClick={onClose} variant="outline">닫기</Button>
        </div>
      </div>
    </Modal>
  );
};


// OmsSystem 컴포넌트
const OmsSystem: React.FC = () => {
  const { monthly_reports } = useProjectData();
  const [selectedReport, setSelectedReport] = useState<MonthlyReport | null>(null);
  const [view, setView] = useState('list'); 

  const handleReportClick = (report: MonthlyReport) => {
    setSelectedReport(report);
  };

  if (view === 'upload') {
    return (
      <div className="p-4">
        <Button onClick={() => setView('list')} className="mb-4" variant="outline">
          보고서 목록으로 돌아가기
        </Button>
        <OmsUploader />
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button onClick={() => setView('upload')}>새 보고서 업로드</Button>
      </div>
      
      {(!monthly_reports || monthly_reports.length === 0) ? (
        <div className="text-center py-20 bg-gray-50 rounded-lg">
            <h2 className="text-2xl font-bold text-gray-700">생성된 보고서가 없습니다.</h2>
            <p className="text-gray-500 mt-2">'새 보고서 업로드' 버튼을 눌러 첫 보고서를 만들어보세요.</p>
        </div>
       ) : (
        <Tabs defaultValue="dashboard" className="w-full">
            <TabsList className="grid w-full grid-cols-3 max-w-2xl mx-auto">
              <TabsTrigger value="dashboard">대시보드</TabsTrigger>
              <TabsTrigger value="energy">에너지 사용량</TabsTrigger>
              <TabsTrigger value="list">보고서 목록</TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard" className="mt-6">
              <OmsDashboard />
            </TabsContent>

            <TabsContent value="energy" className="mt-6">
              <OmsEnergyDashboard />
            </TabsContent>

            <TabsContent value="list" className="mt-6">
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-2xl font-bold mb-4">월간 보고서 목록</h2>
                    <div className="space-y-4">
                        {monthly_reports.map(report => (
                        <div 
                            key={report.id}
                            onClick={() => handleReportClick(report)}
                            className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                        >
                            <div>
                            <p className="font-semibold">{`${report.year}년 ${report.month}월`}</p>
                            <p className="text-sm text-gray-500">보고일: {report.report_date}</p>
                            </div>
                            <span className="text-sm font-medium text-green-600">분석 완료</span>
                        </div>
                        ))}
                    </div>
                </div>
            </TabsContent>
        </Tabs>
      )}
      
      <MonthlyReportDetailModal 
        report={selectedReport}
        onClose={() => setSelectedReport(null)}
      />
    </>
  );
};

export default OmsSystem;