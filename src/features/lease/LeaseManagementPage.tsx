
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import TenantRoster from '../tenant-roster/TenantRoster';
import FloorPlanBrowser from './FloorPlanBrowser';
import { useAppData } from '../../providers/AppDataContext';
import { KPI } from '../../types';
import { ActivityList } from '../../components/ActivityList';

interface LeaseManagementPageProps {
  kpi: KPI;
}

const LeaseManagementPage: React.FC<LeaseManagementPageProps> = ({ kpi }) => {
  const [activeTab, setActiveTab] = useState('roster'); // 테스트를 위해 'roster' 탭을 기본으로 설정
  const { buildings } = useAppData(); // 전역 컨텍스트에서 건물 데이터 가져오기

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">{kpi.title}</h1>
        <p className="mt-1 text-sm text-gray-600">{kpi.description}</p>
      </div>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="roster">Tenant Roster</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="mt-4">
          <ActivityList kpiId={kpi.id} activities={kpi.activities} />
        </TabsContent>
        <TabsContent value="roster" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <TenantRoster />
              {/* 컨텍스트에서 가져온 올바른 건물 데이터를 전달합니다. 더 이상 leaseData prop은 필요 없습니다. */}
              <FloorPlanBrowser buildings={buildings} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LeaseManagementPage;
