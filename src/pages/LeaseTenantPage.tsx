
import React, { useState, useMemo } from 'react';
import { useProjectData } from '@/providers/ProjectDataProvider';
import { getOptimalTenantRecommendations, Recommendation } from '@/services/aiTenantRecommender';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Lightbulb, Zap, BarChart, Building, Percent, Download } from 'lucide-react'; // 신규: Download 아이콘 import
import LeaseAnalysisPage from './LeaseAnalysisPage';
import { TenantUnitDataTable } from '@/components/TenantUnitDataTable';
import { TenantDetailModal } from '@/components/TenantDetailModal';
import { TenantUnit, LeaseRecord } from '@/types';
import { updateTenantUnit } from '@/firebase';
import { exportToCsv } from '@/lib/utils'; // 신규: CSV 내보내기 함수 import

const LeaseTenantPage: React.FC = () => {
  const { complexFacilities, tenantUnits, refreshData } = useProjectData();
  const [activeTab, setActiveTab] = useState("tenantRoster");
  // ... (기존 상태 선언들)
  const [selectedUnit, setSelectedUnit] = useState<TenantUnit | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // ... (기존 코드: commercialFacilities, leaseRateStats, handleAnalyze, formatRevenue)

  const handleRowClick = (unit: TenantUnit) => {
    setSelectedUnit(unit);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUnit(null);
  };

  const handleSaveUnit = async (updatedUnit: TenantUnit) => {
    // ... (기존 저장 로직)
  };
  
  // 신규: CSV 내보내기 핸들러
  const handleExportCsv = () => {
    const headers = {
      id: '세대 ID',
      name: '세대 이름',
      floor: '층',
      area: '면적(㎡)',
      status: '상태',
      tenantName: '현재 임차인',
      rent: '월 임대료(원)',
      leaseStartDate: '계약 시작일',
      leaseEndDate: '계약 종료일'
    };
    
    // rent 필드가 없는 경우 0으로 처리하는 등 데이터 정제
    const dataToExport = tenantUnits.map(unit => ({
      ...unit,
      tenantName: unit.tenantName || '-',
      rent: unit.rent || 0,
      leaseStartDate: unit.leaseStartDate || '-',
      leaseEndDate: unit.leaseEndDate || '-',
    }));

    exportToCsv("세대_목록.csv", dataToExport, headers);
  };

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <h1 className="text-2xl font-bold tracking-tight mb-6">임대 및 세대 관리</h1>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        {/* ... (TabsList 및 다른 탭들) ... */}
        
        <TabsContent value="tenantRoster" className="space-y-6">
            <Card>
              {/* ... (임대율 현황 카드) ... */}
            </Card>

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

        {/* ... (다른 탭들 및 모달) ... */}
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
