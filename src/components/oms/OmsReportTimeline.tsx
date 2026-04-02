
import React from 'react';
import { useProjectData } from '@/providers/ProjectDataProvider';
import { TeamActivity, MonthlyReport } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// A placeholder for status icons - will be replaced with actual icons
const StatusIcon = ({ status }: { status: string }) => {
  const color = status === '완료' ? 'bg-green-500' : 'bg-amber-500';
  return <span className={`inline-block w-3 h-3 ${color} rounded-full mr-2`}></span>;
};

const TeamActivityCard: React.FC<{ activity: TeamActivity }> = ({ activity }) => {
    return (
        <Card className="mb-4 bg-white shadow-sm">
            <CardHeader className="p-4">
                <CardTitle className="text-md font-semibold text-gray-800">{activity.teamName}</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
                <ul className="list-none text-sm text-gray-600 space-y-2">
                    {activity.tasks.map((task, index) => {
                        const isImportant = task.includes('이·취임식') || task.includes('EV4호기');
                        return (
                            <li key={index} className={`flex items-center ${isImportant ? 'font-bold text-blue-800' : 'text-gray-600'}`}>
                                {task}
                            </li>
                        );
                    })}
                </ul>
            </CardContent>
        </Card>
    );
};


const OmsReportTimeline: React.FC = () => {
    const { monthly_reports } = useProjectData();

    if (!monthly_reports || monthly_reports.length === 0) {
        return (
            <div className="text-center py-20 bg-gray-50 rounded-lg">
                <h2 className="text-2xl font-bold text-gray-700">생성된 보고서가 없습니다.</h2>
                <p className="text-gray-500 mt-2">\'새 보고서 업로드\' 탭으로 이동하여 첫 보고서를 만들어보세요.</p>
            </div>
        );
    }

    // Sort reports by year and month, descending
    const sortedReports = [...monthly_reports].sort((a, b) => {
        if (a.year !== b.year) return b.year - a.year;
        return b.month - a.month;
    });

    return (
        <div className="relative pl-6">
            {/* Vertical Timeline Bar */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>

            {sortedReports.map(report => (
                <div key={report.id} className="mb-12">
                    <div className="flex items-center mb-4">
                         {/* Timeline Dot */}
                        <div className="absolute left-[18px] w-3 h-3 bg-blue-500 rounded-full border-2 border-white"></div>
                        <h3 className="text-lg font-bold text-gray-800 ml-6">{`${report.year}년 ${report.month}월`}</h3>
                    </div>
                     <div className="ml-6 space-y-4">
                        {report.raw_data.teamActivities.map(activity => (
                             <TeamActivityCard key={activity.id} activity={activity} />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default OmsReportTimeline;
