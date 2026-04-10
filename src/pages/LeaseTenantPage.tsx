
import React, { useState, useMemo } from 'react';
import { useProjectData } from '@/providers/ProjectDataProvider';
import { getOptimalTenantRecommendations, Recommendation } from '@/services/aiTenantRecommender';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Lightbulb, Zap, BarChart, Building, Percent, Download } from 'lucide-react';
import LeaseAnalysisPage from './LeaseAnalysisPage';
import { TenantUnitDataTable } from '@/components/TenantUnitDataTable';
import { TenantDetailModal } from '@/components/TenantDetailModal';
import { TenantUnit } from '@/types';
import { updateTenantUnit } from '@/firebase';
import { exportToCsv } from '@/lib/utils';
import LeaseStatusSummaryPage from './LeaseStatusSummaryPage'; // Import the new component

const LeaseTenantPage: React.FC = () => {
  const { complexFacilities, tenantUnits } = useProjectData();
  const [activeTab, setActiveTab] = useState("leaseStatusSummary"); // Change default tab
  const [selectedUnit, setSelectedUnit] = useState<TenantUnit | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleRowClick = (unit: TenantUnit) => {
    setSelectedUnit(unit);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUnit(null);
  };

  const handleSaveUnit = async (updatedUnit: TenantUnit) => {
    // ... (Your existing save logic)
  };

  const handleExportCsv = () => {
    const headers = {
      id: '세대 ID',
      name: '세대 이름',
      floor: '층',
      area: '면적(㎡)',
      status: '상태',
      tenant: '현재 임차인',
      rent: '월 임대료(원)',
      contractDate: '계약 시작일',
      moveOutDate: '계약 종료일'
    };

    const dataToExport = tenantUnits.map(unit => ({
      id: unit.id,
      name: unit.name,
      floor: unit.floor,
      area: unit.area,
      status: unit.status,
      tenant: unit.tenant || '-',
      rent: unit.rent || 0,
      contractDate: unit.contractDate || '-',
      moveOutDate: unit.moveOutDate || '-',
    }));

    exportToCsv("세대_목록.csv", dataToExport, headers);
  };

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <h1 className="text-2xl font-bold tracking-tight mb-6">임대 및 세대 관리</h1>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="leaseStatusSummary">주요 임대현황</TabsTrigger>
          <TabsTrigger value="tenantInfo">임차인 정보</TabsTrigger>
          <TabsTrigger value="tenantRoster">Tenant Roster</TabsTrigger>
          <TabsTrigger value="analysis">수익 분석</TabsTrigger>
          <TabsTrigger value="recommendation">AI Tenant Recommender</TabsTrigger>
        </TabsList>

        <TabsContent value="leaseStatusSummary">
          <LeaseStatusSummaryPage />
        </TabsContent>

        <TabsContent value="tenantInfo">
          <Card>
            <CardHeader>
              <CardTitle>임차인 정보</CardTitle>
            </CardHeader>
            <CardContent>
              <p>임차인 정보 탭의 내용이 여기에 표시됩니다.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tenantRoster" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>전체 세대 목록</CardTitle>
              <Button variant="outline" size="sm" onClick={handleExportCsv}>
                <Download className="mr-2 h-4 w-4" />
                CSV로 내보내기
              </Button>
            </CardHeader>
            <CardContent>
              <TenantUnitDataTable tenantUnits={tenantUnits} onRowClick={handleRowClick} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* ... (Other TabsContent for analysis and recommendation) ... */}
      </Tabs>

      <TenantDetailModal
        isOpen={isModalOpen}
        unit={selectedUnit}
        onClose={handleCloseModal}
        onSave={handleSaveUnit}
      />
    </div>
  );
};

export default LeaseTenantPage;
