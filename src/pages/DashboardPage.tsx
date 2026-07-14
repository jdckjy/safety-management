
import React, { useMemo } from 'react';
import { useProjectData } from '@/providers/ProjectDataProvider';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { TrendingUp, Users, AlertTriangle, Briefcase, Zap, Building, CheckCircle, Clock, XCircle, FileText, ArrowRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { TaskStatusChart } from '@/components/TaskStatusChart';
import { format, subMonths, getMonth } from 'date-fns';
import { ko } from 'date-fns/locale';
import { ProfitSummaryCard } from '@/components/ProfitSummaryCard';
import { TASK_STATUS } from '@/constants';
import { HotSpot, GeneralActivity } from '@/types';

interface TaskItemProps {
  type: 'Hot Spot' | '업무';
  title: string;
  status: string;
  statusColor: string;
}

const TaskItem: React.FC<TaskItemProps> = ({ type, title, status, statusColor }) => (
  <div className="flex items-start space-x-3 py-2 border-b border-gray-100 last:border-b-0">
    <div className={`mt-1 flex-shrink-0 h-2.5 w-2.5 rounded-full ${statusColor}`}></div>
    <div className="flex-1">
      <div className="text-xs text-gray-500">{type}</div>
      <p className="text-sm font-medium text-gray-800 leading-snug">{title}</p>
      <div className="text-xs text-gray-400 mt-1">{status}</div>
    </div>
  </div>
);

const DashboardCard: React.FC<{ title: string; value: React.ReactNode; icon: React.ReactNode; className?: string }> = ({ title, value, icon, className }) => (
    <Card className={className}>
        <CardContent className="p-3 flex items-center justify-between">
            <div className="flex items-baseline space-x-2">
                <p className="text-sm font-medium text-gray-600">{title}</p>
                <p className="text-xl font-bold">{value}</p>
            </div>
            {icon}
        </CardContent>
    </Card>
);

const MiniChartCard: React.FC<{ title: string; data: any[]; dataKey: string; color: string; icon: React.ReactNode; value: string; change: string; }> = ({ title, data, dataKey, color, icon, value, change }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className={`text-xs ${change.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>{change}</p>
      <div className="h-16 w-full mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={`color-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.8}/>
                <stop offset="95%" stopColor={color} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <Tooltip
              contentStyle={{ fontSize: '12px', padding: '4px 8px', border: '1px solid #e2e8f0', borderRadius: '0.375rem' }}
              labelFormatter={(label) => `월: ${label}`}
            />
            <Area type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} fillOpacity={1} fill={`url(#color-${dataKey})`} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </CardContent>
  </Card>
);

interface UnifiedActivity {
  id: string;
  title: string;
  date: string;
  isHotspot: boolean;
}

const DashboardPage: React.FC = () => {
  const { kpiData, hotspots, generalActivities, leaseRealtimeMetrics } = useProjectData();

  const 업무요약 = useMemo(() => {
    if (!kpiData) return { monthly: {}, overall: {} };
    const allTasks = kpiData.flatMap(kpi => kpi.activities?.flatMap(a => a.tasks) || []);
    const currentMonth = getMonth(new Date()); // 0-indexed

    const monthlyTasks = allTasks.filter(task => task && new Date(task.startDate).getMonth() === currentMonth);

    const monthlyCompleted = monthlyTasks.filter(t => t.status === TASK_STATUS.COMPLETED).length;
    const monthlyInProgress = monthlyTasks.filter(t => t.status === TASK_STATUS.IN_PROGRESS).length;
    const monthlyPending = monthlyTasks.filter(t => t.status === TASK_STATUS.NOT_STARTED).length;
    const monthlyDelayed = monthlyTasks.filter(t => t.status === TASK_STATUS.OVERDUE).length;

    const overallCompleted = allTasks.filter(t => t.status === TASK_STATUS.COMPLETED).length;
    const overallInProgress = allTasks.filter(t => t.status === TASK_STATUS.IN_PROGRESS).length;
    const overallPending = allTasks.filter(t => t.status === TASK_STATUS.NOT_STARTED || t.status === 'waiting').length;
    const overallTotal = allTasks.length;

    return {
      monthly: {
        총업무: monthlyTasks.length,
        완료: monthlyCompleted,
        진행중: monthlyInProgress,
        예정: monthlyPending,
        지연: monthlyDelayed,
      },
      overall: {
        완료: overallCompleted,
        미완료: overallInProgress + overallPending,
        총업무: overallTotal,
      }
    };
  }, [kpiData]);

  const recentActivities: UnifiedActivity[] = useMemo(() => {
    const hotspotActivities = (hotspots || []).map((h: HotSpot) => ({
        id: h.id,
        title: h.name,
        date: new Date().toISOString(), // HotSpot has no date, so using current for now.
        isHotspot: true,
    }));

    const generalSystemActivities = (generalActivities || []).map((g: GeneralActivity) => ({
        id: g.id,
        title: g.description,
        date: g.date,
        isHotspot: false,
    }));

    const all = [...hotspotActivities, ...generalSystemActivities];
    all.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return all.slice(0, 5);
  }, [hotspots, generalActivities]);

  const visitorData = useMemo(() => {
    const data = Array.from({ length: 6 }, (_, i) => {
      const month = subMonths(new Date(), 5 - i);
      return {
        name: format(month, 'M월', { locale: ko }),
        방문객: 12458 - (i * 300) + Math.floor(Math.random() * 600),
      };
    });
    return data;
  }, []);

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6 mb-6">
        <DashboardCard title="7월 총 업무" value={업무요약.monthly?.총업무 ?? 0} icon={<Briefcase className="text-gray-400" />} />
        <DashboardCard title="시작전" value={업무요약.monthly?.예정 ?? 0} icon={<Clock className="text-gray-400" />} />
        <DashboardCard title="진행중" value={업무요약.monthly?.진행중 ?? 0} icon={<Zap className="text-yellow-500" />} />
        <DashboardCard title="완료" value={업무요약.monthly?.완료 ?? 0} icon={<CheckCircle className="text-green-500" />} />
        <DashboardCard title="지연" value={업무요약.monthly?.지연 ?? 0} icon={<XCircle className="text-red-500" />} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
              <CardHeader><CardTitle>2024년 업무진척도</CardTitle></CardHeader>
              <CardContent className="flex items-center justify-center">
                <div className="w-48 h-48">
                    <TaskStatusChart completed={업무요약.overall?.완료 ?? 0} inProgress={업무요약.overall?.미완료 ?? 0} pending={0} />
                </div>
                <div className="ml-8 text-sm text-gray-600">
                  <div className="flex items-center mb-2"><span className="w-3 h-3 rounded-full bg-green-500 mr-2"></span>완료: {업무요약.overall?.완료 ?? 0}건</div>
                  <div className="flex items-center mb-2"><span className="w-3 h-3 rounded-full bg-gray-300 mr-2"></span>미완료: {업무요약.overall?.미완료 ?? 0}건</div>
                  <div className="font-bold mt-4">총 업무: {업무요약.overall?.총업무 ?? 0}건</div>
                </div>
              </CardContent>
          </Card>

          <Card>
              <CardHeader><CardTitle>임대 현황 요약</CardTitle></CardHeader>
              <CardContent className="flex items-center justify-center">
                <div className="w-48 h-48 relative">
                  <Progress value={leaseRealtimeMetrics?.realtimeOccupancyRate || 0} className="w-full h-full rounded-full" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="text-4xl font-bold">{`${Math.round(leaseRealtimeMetrics?.realtimeOccupancyRate || 0)}%`}</div>
                    <div className="text-sm text-gray-500">임대율</div>
                  </div>
                </div>
                <div className="ml-8 text-sm text-gray-600">
                  <div className="mb-2"><b>총 면적:</b> {leaseRealtimeMetrics?.totalRentableArea.toLocaleString() || 0}㎡</div>
                  <div><b>임대 면적:</b> {leaseRealtimeMetrics?.totalLeasedArea.toLocaleString() || 0}㎡</div>
                </div>
              </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>경영평가 시뮬레이션</CardTitle>
                <span className="text-xs font-semibold px-2 py-1 rounded-full bg-green-100 text-green-700">Good</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-4">
                <div className="text-5xl font-bold text-blue-600">1,599<span className="text-xl text-gray-500">점</span></div>
                <p className="text-sm text-gray-500">종합점수 2.5점 / 3점</p>
              </div>
              <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                      <span>득점 확보 현황</span>
                      <span className="font-bold">63.99%</span>
                  </div>
                  <Progress value={63.99} className="h-2" />
                  <div className="h-24 mt-4">
                      <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={[{v:1200}, {v:1400}, {v:1350}, {v:1599}]} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                              <Tooltip contentStyle={{ fontSize: '12px' }}/>
                              <Area type="monotone" dataKey="v" stroke="#3b82f6" strokeWidth={2} fill="#dbeafe" />
                          </AreaChart>
                      </ResponsiveContainer>
                  </div>
              </div>
            </CardContent>
          </Card>

          <ProfitSummaryCard />
            
          <MiniChartCard 
            title="이용객 현황" 
            value="13,488명" 
            change="+10.0% (전년 동기대비)"
            icon={<Users className="text-gray-400" />} 
            data={visitorData} 
            dataKey="방문객" 
            color="#8884d8"
          />

        </div>

        <div className="xl:col-span-1 flex flex-col gap-6">
          <Card>
            <CardHeader><CardTitle>주요 업무</CardTitle></CardHeader>
            <CardContent>
                <TaskItem type="Hot Spot" title="건축/승강기 하자검사 시행" status="완료" statusColor="bg-green-500" />
                <TaskItem type="업무" title="1층 옥상방수 하자검사 시행" status="진행중" statusColor="bg-yellow-500" />
                <TaskItem type="업무" title="미화팀 휴게실 개선" status="지연" statusColor="bg-red-500" />
            </CardContent>
          </Card>
          <Card className="flex-grow">
            <CardHeader><CardTitle>최근 활동 피드</CardTitle></CardHeader>
            <CardContent>
              {recentActivities.length > 0 ? (
                <div className="space-y-4">
                  {recentActivities.map(activity => (
                    <div key={activity.id} className="flex items-start text-sm">
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                        {activity.isHotspot ? <AlertTriangle size={16} className="text-yellow-600" /> : <FileText size={16} className="text-blue-600" />}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{activity.title}</p>
                        <p className="text-xs text-gray-500">{format(new Date(activity.date), 'yyyy년 M월 d일', { locale: ko })}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-sm text-gray-400 py-8">최근 완료된 활동이 없습니다.</div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
