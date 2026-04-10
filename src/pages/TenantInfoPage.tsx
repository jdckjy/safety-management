
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const TenantInfoPage: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>임차인 정보</CardTitle>
      </CardHeader>
      <CardContent>
        <p>임차인 정보 탭의 내용이 여기에 표시됩니다.</p>
      </CardContent>
    </Card>
  );
};

export default TenantInfoPage;
