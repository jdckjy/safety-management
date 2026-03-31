
import React, { useMemo } from 'react';
import { useProjectData } from '../../providers/ProjectDataProvider';
import { MonthlyReport, TeamActivity } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ListChecks } from 'lucide-react';

const OmsTeamTasks: React.FC = () => {
  const { monthly_reports } = useProjectData();

  const latestReport = useMemo(() => {
    if (!monthly_reports || monthly_reports.length === 0) return null;
    
    return monthly_reports.reduce((latest, report) => 
      new Date(report.year, report.month - 1) > new Date(latest.year, latest.month - 1) ? report : latest
    , monthly_reports[0]);
  }, [monthly_reports]);

  if (!latestReport) {
    return (
        <Alert>
            <ListChecks className="h-4 w-4" />
            <AlertTitle>데이터 없음</AlertTitle>
            <AlertDescription>
            표시할 팀별 업무 내역이 없습니다. 먼저 '보고서 업로드' 탭에서 월간 보고서를 추가해주세요.
            </AlertDescription>
      </Alert>
    );
  }

  const teamActivities = latestReport.raw_data.teamActivities;

  const getTeamIcon = (teamId: string) => {
      switch(teamId) {
          case 'facility': return '🔧';
          case 'cleaning': return '🧹';
          case 'security': return '🛡️';
          default: return ''
      }
  }

  return (
    <Card>
        <CardHeader>
            <CardTitle className="flex items-center">
                <ListChecks className="mr-2 text-sky-500"/>
                {latestReport.year}년 {latestReport.month}월 팀별 업무내역
            </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
            {teamActivities.map((activity: TeamActivity) => (
                <div key={activity.id}>
                    <h4 className="font-semibold text-lg mb-2 flex items-center">
                        <span className="mr-2 text-xl">{getTeamIcon(activity.id)}</span> {activity.teamName}
                    </h4>
                    <div className="space-y-4 text-sm text-gray-700 bg-gray-50 p-4 rounded-md">
                        {activity.tasks.map((task, index) => {
                            // "1주차: " 와 같은 부분을 분리합니다.
                            const parts = task.split(': ');
                            const week = parts[0];
                            const description = parts.slice(1).join(': ');
                            return (
                                <div key={index} className="flex items-start">
                                    <span className="font-semibold text-gray-600 w-16 flex-shrink-0">{week}</span>
                                    <p className="flex-grow pl-4 border-l">{description}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}
      </CardContent>
    </Card>
  );
};

export default OmsTeamTasks;
