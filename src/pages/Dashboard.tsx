
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useProjectData } from '@/providers/ProjectDataProvider';
import { AlertTriangle, TrendingUp, Clock, CheckCircle, AlertCircle as AlertCircleIcon, Briefcase } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, formatDistanceToNow, parseISO, isAfter, subDays } from 'date-fns';
import { ko } from 'date-fns/locale';
import { TASK_STATUS } from '@/constants';
import { DonutChart } from '@/components/charts/CustomCharts';
import { ResponsiveContainer, AreaChart, Area, Tooltip } from 'recharts';

const SummaryCard = ({ title, value }: { title: string, value: string | number }) => (
  <Card className="text-center p-4">
    <CardContent className="p-0">
      <p className="text-sm font-medium text-gray-500 mb-2">{title}</p>
      <div className="text-3xl font-bold">{value}</div>
    </CardContent>
  </Card>
);

const Dashboard: React.FC = () => {
  const { kpiData, leaseRealtimeMetrics, latestEvaluationResult } = useProjectData();
  const today = new Date();

  const taskSummary = useMemo(() => {
    let summary = { total: 0, completed: 0, pending: 0, inProgress: 0, delayed: 0 };
    if (!kpiData) return summary;

    const allTasks = kpiData.flatMap(kpi => kpi.activities?.flatMap(a => a.tasks) || []);
    summary.total = allTasks.length;

    allTasks.forEach(task => {
        if (!task) return;
        const endDate = new Date(task.endDate);
        if (task.status === TASK_STATUS.COMPLETED) {
            summary.completed++;
        } else if (task.status === TASK_STATUS.IN_PROGRESS) {
            summary.inProgress++;
        } else if (task.status === TASK_STATUS.NOT_STARTED) {
            summary.pending++;
        }
        if (task.status !== TASK_STATUS.COMPLETED && endDate < today) {
            summary.delayed++;
        }
    });
    return summary;
  }, [kpiData, today]);

  const delayedTasks = useMemo(() => {
    if (!kpiData) return [];
    return kpiData
      .flatMap(kpi => kpi.activities.flatMap(activity => activity.tasks.map(task => ({ ...task, kpiTitle: kpi.title }))))
      .filter(task => task.status !== TASK_STATUS.COMPLETED && new Date(task.endDate) < today)
      .slice(0, 3);
  }, [kpiData, today]);

  const recentCompletedActivities = useMemo(() => {
    if (!kpiData) return [];
    return kpiData
        .flatMap(kpi => 
            kpi.activities.map(activity => ({
                ...activity,
                parentKpiTitle: kpi.title,
                timestamp: activity.tasks.reduce((latest, task) => {
                    if (activity.status === TASK_STATUS.COMPLETED) {
                        return latest > task.endDate ? latest : task.endDate;
                    }
                    return latest;
                }, '1970-01-01T00:00:00.000Z')
            }))
        )
        .filter(activity => activity.status === TASK_STATUS.COMPLETED && isAfter(parseISO(activity.timestamp), subDays(new Date(), 7)))
        .sort((a, b) => parseISO(b.timestamp).getTime() - parseISO(a.timestamp).getTime())
        .slice(0, 5);
  }, [kpiData]);


  const workProgress = taskSummary.total > 0 ? (taskSummary.completed / taskSummary.total) * 100 : 0;
  const occupancyRate = leaseRealtimeMetrics?.realtimeOccupancyRate ?? 79.2;
  const evaluationScore = latestEvaluationResult?.score ?? 1.599;
  const evaluationRating = latestEvaluationResult?.rating ?? 63.95;

  return (
    <div className="flex-1 space-y-6 p-6 bg-slate-50">
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
        <SummaryCard title="7월 총 업무" value={taskSummary.total} />
        <SummaryCard title="시작 전" value={taskSummary.pending} />
        <SummaryCard title="진행중" value={taskSummary.inProgress} />
        <SummaryCard title="완료" value={taskSummary.completed} />
        <SummaryCard title="지연" value={taskSummary.delayed} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
                <CardHeader><CardTitle>2026년 업무진척도</CardTitle></CardHeader>
                <CardContent className="flex flex-col items-center text-center">
                    <div className="relative w-40 h-40">
                        <DonutChart value={workProgress} strokeColor="#ef4444" strokeWidth={12} />
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-3xl font-bold">{Math.round(workProgress)}%</span>
                            <span className="text-sm text-gray-500">완료율</span>
                        </div>
                    </div>
                    <div className="mt-4 text-sm w-full max-w-xs">
                        <div className="flex justify-between items-center"><span className='flex items-center'><span className="w-2 h-2 rounded-full bg-red-500 mr-2"></span>완료</span> <span>{taskSummary.completed}건</span></div>
                        <div className="flex justify-between items-center"><span className='flex items-center'><span className="w-2 h-2 rounded-full bg-gray-300 mr-2"></span>미완료</span> <span>{taskSummary.total - taskSummary.completed}건</span></div>
                        <div className="font-bold mt-2 pt-2 border-t flex justify-between"><span>총 업무</span><span>{taskSummary.total}건</span></div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader><CardTitle>임대 현황 요약</CardTitle></CardHeader>
                <CardContent className="flex flex-col items-center text-center">
                    <div className="relative w-40 h-40">
                        <DonutChart value={occupancyRate} strokeColor="#3b82f6" strokeWidth={12} />
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-3xl font-bold">{occupancyRate.toFixed(1)}%</span>
                            <span className="text-sm text-gray-500">임대율</span>
                        </div>
                    </div>
                    <div className="mt-4 text-sm w-full max-w-xs">
                        <div className="flex justify-between items-center"><span className='flex items-center'><span className="w-2 h-2 rounded-full bg-blue-500 mr-2"></span>임대 면적</span> <span>{leaseRealtimeMetrics?.totalLeasedArea.toLocaleString() ?? '3,081.17'} m²</span></div>
                        <div className="flex justify-between items-center"><span className='flex items-center'><span className="w-2 h-2 rounded-full bg-gray-300 mr-2"></span>공실/리모델링</span> <span>{(leaseRealtimeMetrics ? leaseRealtimeMetrics.totalRentableArea - leaseRealtimeMetrics.totalLeasedArea : 831.14).toLocaleString()} m²</span></div>
                        <div className="font-bold mt-2 pt-2 border-t flex justify-between"><span>총 면적</span><span>{leaseRealtimeMetrics?.totalRentableArea.toLocaleString() ?? '3,912.31'} m²</span></div>
                    </div>
                </CardContent>
            </Card>

            <Card className="md:col-span-2">
                <CardHeader><CardTitle>경영평가 시뮬레이션</CardTitle></CardHeader>
                <CardContent className="flex flex-col md:flex-row items-center gap-6">
                    <div className="text-center flex-shrink-0">
                      <div className="text-indigo-500 text-sm font-semibold">현시점 득점</div>
                      <div className="text-5xl font-bold text-indigo-600">{evaluationScore.toFixed(3)}<span className="text-2xl font-normal text-gray-500 ml-1">점</span></div>
                      <div className="text-sm text-gray-500">총 배점 2.5점 기준</div>
                    </div>
                    <div className="w-full">
                        <div className="flex justify-between items-center text-sm mb-1">
                            <span>득점 확보 현황</span><span className="font-bold">{evaluationRating.toFixed(2)}%</span>
                        </div>
                        <Progress value={evaluationRating} className="h-2 [&>div]:bg-indigo-500" />
                        <div className="text-sm font-medium mt-3 mb-1">최근 5개년 임대율 추이</div>
                        <div className="h-20">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={[{v:75},{v:81},{v:78},{v:85},{v:occupancyRate}]} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                              <defs><linearGradient id="eval-grad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#4ade80" stopOpacity={0.4}/><stop offset="95%" stopColor="#4ade80" stopOpacity={0}/></linearGradient></defs>
                              <Tooltip contentStyle={{ fontSize: '12px' }}/>
                              <Area type="monotone" dataKey="v" stroke="#4ade80" strokeWidth={2} fill="url(#eval-grad)" />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>

        <div className="lg:col-span-1 grid grid-cols-1 gap-6 auto-rows-min">
            <Card>
                <CardHeader><CardTitle>이용객 현황 요약</CardTitle></CardHeader>
                <CardContent className="text-center">
                    <div className="text-4xl font-bold">13,755<span className="text-lg font-normal text-gray-500">명</span></div>
                    <p className="text-xs text-green-600 font-semibold flex items-center justify-center"><TrendingUp className="w-4 h-4 mr-1"/>100.0% (전년 동기 대비)</p>
                    <div className="relative w-32 h-32 mx-auto my-2">
                        <DonutChart value={32.9} strokeColor="#2563eb" strokeWidth={12} />
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-2xl font-bold text-blue-700">32.9%</span>
                        </div>
                    </div>
                    <p className="text-xs text-gray-500">연 목표 13,755 / 41,769명 달성</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex-row justify-between items-center pb-2">
                    <CardTitle>수익 현황 요약</CardTitle>
                    <a href="#" className="text-sm font-semibold text-blue-600">detail →</a>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-gray-500">순이익</p>
                    <p className="text-3xl font-bold text-red-600">-63,212,867원</p>
                </CardContent>
                <CardFooter className="flex-col items-start text-xs text-gray-500 border-t pt-2">
                    <div className="w-full flex justify-between"><span>총수입</span><span>326,486,694원</span></div>
                    <div className="w-full flex justify-between"><span>총지출</span><span>389,699,561원</span></div>
                    <p className="text-red-600 mt-2 text-center bg-red-50 p-2 rounded-md w-full">연 총지출이 수입을 초과하여 적자 발생. 지출 효율화가 필요합니다.</p>
                </CardFooter>
            </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="flex items-center"><AlertTriangle className="h-5 w-5 mr-2 text-red-500"/>지연 업무</CardTitle></CardHeader>
          <CardContent>
             <div className="space-y-3">
              {delayedTasks.length > 0 ? (
                delayedTasks.map(task => (
                  <div key={task.id} className="bg-red-50 border-l-4 border-red-400 p-3 rounded-r-md">
                    <div className="font-semibold text-sm text-gray-800">{task.name}</div>
                    <div className="text-xs text-gray-600 mt-1">{task.kpiTitle}</div>
                    <div className="text-xs text-red-600 font-medium mt-1">마감일: {formatDistanceToNow(new Date(task.endDate), { addSuffix: true, locale: ko })}</div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-gray-500">현재 지연된 업무가 없습니다.</div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>최근 활동 피드</CardTitle></CardHeader>
          <CardContent>
             <div className="space-y-4">
              {recentCompletedActivities.length > 0 ? (
                recentCompletedActivities.map(activity => (
                  <div key={activity.id} className="flex items-start">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-3 flex-shrink-0">
                        <CheckCircle size={16} className="text-green-600" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold">{activity.name}</p>
                        <p className="text-xs text-gray-500">
                            {activity.parentKpiTitle} › {formatDistanceToNow(parseISO(activity.timestamp), { addSuffix: true, locale: ko })} 완료
                        </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-gray-500">최근 7일간 완료된 활동이 없습니다.</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
