
import React, { useState, useMemo } from 'react';
import { useProjectData } from '@/providers/ProjectDataProvider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { Unit, TenantInfo, Contract } from '@/types';
import { exportToCsv } from '@/lib/utils';

import LeaseStatusSummaryPage from './LeaseStatusSummaryPage';
import TenantInfoPage from './TenantInfoPage';
import ProfitAnalysis from '@/features/tenant-info/ProfitAnalysis';
import AITenantRecommender from '@/components/AITenantRecommender';
import { TenantUnitDataTable } from '@/components/TenantUnitDataTable';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { TenantDetailModal } from '@/components/TenantDetailModal';

export interface TenantUnit extends Unit {
  status: '임대중' | '공실';
  tenant: string | null;
  rent: number | null;
  contractDate: string | null;
  moveOutDate: string | null;
  tenantInfo: TenantInfo | null;
  contract: Contract | null;
}

const LeaseTenantPage: React.FC = () => {
  const { units, tenantInfo, contracts, updateUnit } = useProjectData();
  // Set the default active tab to 'profitAnalysis' as requested
  const [activeTab, setActiveTab] = useState("profitAnalysis"); 
  const [selectedUnit, setSelectedUnit] = useState<TenantUnit | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const tenantUnits = useMemo((): TenantUnit[] => {
    const tenantMap = new Map<string, TenantInfo>(tenantInfo.map(t => [t.id, t]));
    const contractMap = new Map<string, Contract>();
    contracts.forEach(c => {
        contractMap.set(c.unitId, c);
    });

    return units.map(unit => {
      const contract = contractMap.get(unit.id);
      const tenant = contract ? tenantMap.get(contract.tenantId) : undefined;
      const status = tenant ? '임대중' : '공실';

      return {
        ...unit,
        status,
        tenant: tenant ? tenant.companyName : null,
        rent: contract ? contract.monthlyRent : null,
        contractDate: contract ? contract.startDate : null,
        moveOutDate: contract ? contract.endDate : null,
        tenantInfo: tenant || null,
        contract: contract || null,
      };
    });
  }, [units, tenantInfo, contracts]);

  const handleRowClick = (unit: TenantUnit) => {
    setSelectedUnit(unit);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUnit(null);
  };

  const handleSaveUnit = async (updatedUnit: Unit) => {
    if (updatedUnit) {
      await updateUnit(updatedUnit);
      handleCloseModal();
    }
  };

  const handleExportCsv = () => {
    const headers = {
      id: '세대 ID',
      name: '세대 이름',
      floor: '층',
      area_sqm: '면적(㎡)',
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
      area_sqm: unit.area_sqm,
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
      {/* Correctly assign values and set the active tab */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="leaseStatusSummary">주요 임대현황</TabsTrigger>
          <TabsTrigger value="tenantInfo">임차인 정보</TabsTrigger>
          <TabsTrigger value="tenantRoster">Tenant Roster</TabsTrigger>
          {/* Correctly add the 'profitAnalysis' tab */}
          <TabsTrigger value="profitAnalysis">수익 분석</TabsTrigger>
          <TabsTrigger value="recommendation">AI Tenant Recommender</TabsTrigger>
        </TabsList>

        <TabsContent value="leaseStatusSummary">
          <LeaseStatusSummaryPage />
        </TabsContent>

        <TabsContent value="tenantInfo">
          <TenantInfoPage />
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
        
        {/* Add the TabsContent for the new ProfitAnalysis component */}
        <TabsContent value="profitAnalysis">
          <ProfitAnalysis />
        </TabsContent>

        <TabsContent value="recommendation">
           <AITenantRecommender />
        </TabsContent>
      </Tabs>

      {selectedUnit && <TenantDetailModal
        isOpen={isModalOpen}
        unit={selectedUnit}
        onClose={handleCloseModal}
        onSave={(updatedUnit) => handleSaveUnit(updatedUnit as Unit)}
      />}
    </div>
  );
};

export default LeaseTenantPage;
