
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const LeaseStatusSummaryPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>주요 임대 현황 요약</CardTitle>
        </CardHeader>
        <CardContent>
          <p>여기에 주요 임대 현황 관련 요약 정보(예: 총 임대 가능 면적, 현재 임대된 면적, 공실률, 만기 예정 계약 등)가 표시될 것입니다.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default LeaseStatusSummaryPage;
