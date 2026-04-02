
import React, { useState } from 'react';
import OmsUploader from './OmsUploader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import OmsEnergyDashboard from './OmsEnergyDashboard';
import OmsDashboard from './OmsDashboard';
import OmsReportTimeline from './OmsReportTimeline'; // New Timeline Component

const OmsSystem: React.FC = () => {

  return (
    <>
      <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-4 max-w-2xl mx-auto bg-gray-100 rounded-lg">
            <TabsTrigger value="dashboard">대시보드</TabsTrigger>
            <TabsTrigger value="energy">에너지 사용량</TabsTrigger>
            <TabsTrigger value="list">보고서 목록</TabsTrigger>
            <TabsTrigger value="upload">새 보고서 업로드</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="mt-6">
            <OmsDashboard />
          </TabsContent>

          <TabsContent value="energy" className="mt-6">
            <OmsEnergyDashboard />
          </TabsContent>

          <TabsContent value="list" className="mt-6">
            <OmsReportTimeline />
          </TabsContent>

          <TabsContent value="upload" className="mt-6">
            <OmsUploader />
          </TabsContent>
      </Tabs>
    </>
  );
};

export default OmsSystem;
