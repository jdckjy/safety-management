
import React from 'react';
import { useProjectData } from '../../providers/ProjectDataProvider';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

/**
 * 통합 안전 관리 대시보드 컴포넌트
 * safetyKPIs, hotspots, generalActivities 데이터를 기반으로 안전 현황을 시각화합니다.
 */
const OmsSafetyDashboard = () => {
  // 전역 데이터 공급자로부터 프로젝트 데이터를 가져옵니다.
  const { safetyKPIs, hotspots, generalActivities } = useProjectData();

  // 안전 관련 데이터 필터링
  const safetyActivitiesData = generalActivities.filter(
    (activity) => activity.category === '안전'
  ) || [];

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-2xl font-bold">통합 안전 관리 대시보드</h2>
      
      {/* 1. 핵심 안전 KPI 현황판 */}
      <div className="grid gap-4 md:grid-cols-3">
        {safetyKPIs.map((kpi) => (
          <Card key={kpi.id}>
            <CardHeader>
              <CardTitle>{kpi.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">{kpi.current} {kpi.unit}</div>
              <p className="text-sm text-muted-foreground">
                목표: {kpi.target} {kpi.unit}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* 2. 실시간 위험 요인 목록 */}
        <Card>
          <CardHeader>
            <CardTitle>실시간 위험 요인 (Hotspots)</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {hotspots.map((spot) => (
                <li key={spot.id} className="flex justify-between items-center">
                  <span>{spot.name} ({spot.location})</span>
                  <span className="px-2 py-1 text-xs font-semibold text-white bg-red-500 rounded-full">
                    {spot.status}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* 3. 최근 안전 활동 타임라인 */}
        <Card>
          <CardHeader>
            <CardTitle>최근 안전 활동</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {safetyActivitiesData.map((activity) => (
                <li key={activity.id}>
                  <p className="font-semibold">{activity.title}</p>
                  <p className="text-sm text-muted-foreground">{activity.date} - {activity.description}</p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OmsSafetyDashboard;
