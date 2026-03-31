
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import OmsUploader from './OmsUploader';
import OmsEnergyDashboard from './OmsEnergyDashboard';
import OmsTeamTasks from './OmsTeamTasks';

const OmsSystem: React.FC = () => {
  const [activeTab, setActiveTab] = useState('uploader');

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50/50 min-h-full">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-2xl mx-auto">
          <TabsTrigger value="uploader">보고서 업로드</TabsTrigger>
          <TabsTrigger value="energy">에너지 사용량</TabsTrigger>
          <TabsTrigger value="tasks">팀별 업무내역</TabsTrigger>
        </TabsList>

        <TabsContent value="uploader" className="mt-6">
          <OmsUploader />
        </TabsContent>

        <TabsContent value="energy" className="mt-6">
          <OmsEnergyDashboard />
        </TabsContent>

        <TabsContent value="tasks" className="mt-6">
          <OmsTeamTasks />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OmsSystem;
