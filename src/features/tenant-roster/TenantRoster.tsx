
import React, { useState, useMemo } from 'react';
import { useProjectData } from '../../providers/ProjectDataProvider';
import { TenantUnit } from '../../types';
import UnitEditModal from './UnitEditModal';
import TenantInfoEditModal from './TenantInfoEditModal'; // 새로 만든 모달 import
import FloorPlan from './FloorPlan';
import UnitDetailPanel from './UnitDetailPanel';
import { Button } from '../../components/ui/button';
import FloorPlanDrafter from '../floor-plan/FloorPlanDrafter';
import { Card, CardContent } from "../../components/ui/card";
import { UNIT_STATUS } from '../../constants';

import floor1F from '../../assets/1F.png';
import floor2F from '../../assets/2F.png';
import floor3F from '../../assets/3F.png';

const TenantRoster: React.FC = () => {
  const { tenantUnits, deleteTenantUnit } = useProjectData();
  const [selectedFloor, setSelectedFloor] = useState('1F');
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);
  
  // 호실 수정 모달 상태
  const [isUnitModalOpen, setUnitModalOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Partial<TenantUnit> | null>(null);

  // 임차인 수정 모달 상태 (새로 추가)
  const [isTenantModalOpen, setTenantModalOpen] = useState(false);
  const [editingTenantId, setEditingTenantId] = useState<string | null>(null);

  const [isDrafterMode, setDrafterMode] = useState(false);

  const floorPlanImages: { [key: string]: string } = {
    '1F': floor1F,
    '2F': floor2F,
    '3F': floor3F,
  };
  
  const leaseRateStats = useMemo(() => {
    const calculateRate = (units: TenantUnit[]) => {
      if (!units || units.length === 0) return { rate: 0, occupied: 0, totalRentable: 0 };
      const roundToTwo = (num: number) => parseFloat(num.toFixed(2));
      const rentableStatuses: string[] = [UNIT_STATUS.OCCUPIED, UNIT_STATUS.VACANT, UNIT_STATUS.IN_DISCUSSION];
      const occupiedArea = roundToTwo(
        units
          .filter(u => u.status === UNIT_STATUS.OCCUPIED)
          .reduce((sum, u) => sum + u.area, 0)
      );
      const totalRentableArea = roundToTwo(
        units
          .filter(u => rentableStatuses.includes(u.status))
          .reduce((sum, u) => sum + u.area, 0)
      );
      if (totalRentableArea === 0) return { rate: 0, occupied: occupiedArea, totalRentable: 0 };
      const rate = (occupiedArea / totalRentableArea) * 100;
      return {
        rate: roundToTwo(rate),
        occupied: occupiedArea,
        totalRentable: totalRentableArea
      };
    };

    const allUnits = tenantUnits;
    const floor1Units = allUnits.filter(u => u.floor === '1F');
    const floor2Units = allUnits.filter(u => u.floor === '2F');
    const floor3Units = allUnits.filter(u => u.floor === '3F');

    return {
      total: calculateRate(allUnits),
      '1F': calculateRate(floor1Units),
      '2F': calculateRate(floor2Units),
      '3F': calculateRate(floor3Units),
    };
  }, [tenantUnits]);

  const unitsOnSelectedFloor = useMemo(() => 
    tenantUnits.filter(u => u.floor === selectedFloor),
    [tenantUnits, selectedFloor]
  );

  const selectedUnit = useMemo(() => 
    (selectedUnitId ? tenantUnits.find(u => u.id === selectedUnitId) : null) || null,
    [tenantUnits, selectedUnitId]
  );

  const handleUnitSelect = (unitId: string) => {
    setSelectedUnitId(prevId => (prevId === unitId ? null : unitId));
  };

  // 호실 수정 핸들러
  const handleEditUnit = (unit: TenantUnit) => {
    setEditingUnit(unit);
    setUnitModalOpen(true);
  };

  // 임차인 수정 핸들러 (새로 추가)
  const handleEditTenant = (tenantId: string) => {
    setEditingTenantId(tenantId);
    setTenantModalOpen(true);
  }

  const handleAddNewUnit = () => {
    setEditingUnit(null);
    setUnitModalOpen(true);
  };

  const handleDeleteUnit = (unitId: string) => {
    if (window.confirm('정말로 이 유닛을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      if (selectedUnitId === unitId) {
        setSelectedUnitId(null);
      }
      deleteTenantUnit(unitId);
    }
  };

  if (isDrafterMode) {
    return <FloorPlanDrafter />;
  }

  return (
    <div className="h-full flex flex-col p-4 gap-4">
      {/* 모달창 렌더링 */}
      <UnitEditModal 
        isOpen={isUnitModalOpen} 
        onClose={() => setUnitModalOpen(false)} 
        unit={editingUnit}
        floor={selectedFloor}
      />
      <TenantInfoEditModal
        isOpen={isTenantModalOpen}
        onClose={() => setTenantModalOpen(false)}
        tenantId={editingTenantId}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-3">
            <div className="flex items-baseline justify-between space-x-2">
              <div className="flex items-baseline space-x-2">
                  <p className="text-sm font-medium">전체</p>
                  <p className="text-xl font-bold text-blue-600">{leaseRateStats.total.rate}%</p>
              </div>
              <p className="text-sm text-muted-foreground whitespace-nowrap">
                {leaseRateStats.total.occupied.toLocaleString()}m² / {leaseRateStats.total.totalRentable.toLocaleString()}m²
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="flex items-baseline justify-between space-x-2">
              <div className="flex items-baseline space-x-2">
                  <p className="text-sm font-medium">{selectedFloor}</p>
                  <p className="text-xl font-bold">{leaseRateStats[selectedFloor as '1F' | '2F' | '3F'].rate}%</p>
              </div>
              <p className="text-sm text-muted-foreground whitespace-nowrap">
                {leaseRateStats[selectedFloor as '1F' | '2F' | '3F'].occupied.toLocaleString()}m² / {leaseRateStats[selectedFloor as '1F' | '2F' | '3F'].totalRentable.toLocaleString()}m²
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between items-center mt-2">
        <div className="flex space-x-2">
          {Object.keys(floorPlanImages).map(floor => (
            <Button 
              key={floor} 
              onClick={() => { setSelectedFloor(floor); setSelectedUnitId(null); }}
              variant={selectedFloor === floor ? 'default' : 'outline'}>
              {floor}
            </Button>
          ))}
        </div>
        <div className="flex space-x-2">
          <Button onClick={handleAddNewUnit} variant="default">신규 유닛 추가</Button>
          <Button onClick={() => setDrafterMode(true)} variant="secondary">도면 편집</Button>
        </div>
      </div>

      <div className="flex-grow grid grid-cols-1 md:grid-cols-3 gap-4" style={{ minHeight: 0 }}>
        <div className="md:col-span-2 bg-white p-4 rounded-lg shadow-md">
           <FloorPlan 
              units={unitsOnSelectedFloor}
              onUnitSelect={handleUnitSelect}
              selectedUnitId={selectedUnitId}
              floorPlanImage={floorPlanImages[selectedFloor]}
            />
        </div>

        <div className="md:col-span-1 h-full">
          {selectedUnit ? (
            <UnitDetailPanel 
              unit={selectedUnit} 
              onEdit={handleEditUnit} // 이름 변경
              onDelete={handleDeleteUnit} // 이름 변경
              onEditTenant={handleEditTenant} // 새로 추가된 핸들러 전달
            />
          ) : (
            <div className="bg-white rounded-lg shadow-lg h-full flex items-center justify-center">
              <p className="text-gray-500">도면에서 유닛을 선택해주세요.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TenantRoster;
