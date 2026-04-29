
import React, { useState, useMemo } from 'react';
import { useProjectData } from '../../providers/ProjectDataProvider';
import { Unit, TenantInfo, Contract } from '../../types';
import UnitEditModal from './UnitEditModal';
import TenantInfoEditModal from './TenantInfoEditModal';
import FloorPlan from './FloorPlan';
import UnitDetailPanel from './UnitDetailPanel';
import { Button } from '../../components/ui/button';
import FloorPlanDrafter from '../floor-plan/FloorPlanDrafter';
import { Card, CardContent } from "../../components/ui/card";

import floor1F from '../../assets/1F.png';
import floor2F from '../../assets/2F.png';
import floor3F from '../../assets/3F.png';

// 컴포넌트 내부에서 사용할 확장된 유닛 데이터 타입
export interface EnrichedUnit extends Unit {
  tenant?: TenantInfo;
  contract?: Contract;
  status: 'OCCUPIED' | 'VACANT';
}

const TenantRoster: React.FC = () => {
  const { units, contracts, tenantInfo, deleteUnit, addUnit, updateUnit, addContract, updateContract, deleteContract } = useProjectData();
  const [selectedFloor, setSelectedFloor] = useState('1F');
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);
  
  const [isUnitModalOpen, setUnitModalOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Partial<Unit> | null>(null);

  const [isTenantModalOpen, setTenantModalOpen] = useState(false);
  const [editingTenantId, setEditingTenantId] = useState<string | null>(null);

  const [isDrafterMode, setDrafterMode] = useState(false);

  const floorPlanImages: { [key: string]: string } = {
    '1F': floor1F,
    '2F': floor2F,
    '3F': floor3F,
  };

  const enrichedUnits: EnrichedUnit[] = useMemo(() => {
    if (!units || !contracts || !tenantInfo) return [];

    const contractMap = new Map(contracts.map(c => [c.unitId, c]));
    const tenantMap = new Map(tenantInfo.map(t => [t.id, t]));

    return units.map(unit => {
      const contract = contractMap.get(unit.id);
      const tenant = contract ? tenantMap.get(contract.tenantId) : undefined;
      return {
        ...unit,
        contract,
        tenant,
        status: contract ? 'OCCUPIED' : 'VACANT',
      };
    });
  }, [units, contracts, tenantInfo]);
  
  const leaseRateStats = useMemo(() => {
    const calculateRate = (unitList: EnrichedUnit[]) => {
      if (unitList.length === 0) return { rate: 0, occupied: 0, totalRentable: 0 };
      
      const occupiedArea = unitList
        .filter(u => u.status === 'OCCUPIED')
        .reduce((sum, u) => {
          const area = parseFloat(u.area_sqm as any);
          return sum + (isNaN(area) ? 0 : area);
        }, 0);
      
      const totalRentableArea = unitList.reduce((sum, u) => {
        const area = parseFloat(u.area_sqm as any);
        return sum + (isNaN(area) ? 0 : area);
      }, 0);
      
      if (totalRentableArea === 0) return { rate: 0, occupied: occupiedArea, totalRentable: 0 };
      
      const rate = (occupiedArea / totalRentableArea) * 100;
      return {
        rate: parseFloat(rate.toFixed(2)),
        occupied: parseFloat(occupiedArea.toFixed(2)),
        totalRentable: parseFloat(totalRentableArea.toFixed(2))
      };
    };

    const floor1Units = enrichedUnits.filter(u => u.floor === '1F');
    const floor2Units = enrichedUnits.filter(u => u.floor === '2F');
    const floor3Units = enrichedUnits.filter(u => u.floor === '3F');

    return {
      total: calculateRate(enrichedUnits),
      '1F': calculateRate(floor1Units),
      '2F': calculateRate(floor2Units),
      '3F': calculateRate(floor3Units),
    };
  }, [enrichedUnits]);

  const unitsOnSelectedFloor = useMemo(() => 
    enrichedUnits.filter(u => u.floor === selectedFloor),
    [enrichedUnits, selectedFloor]
  );

  const selectedUnit = useMemo(() => 
    (selectedUnitId ? enrichedUnits.find(u => u.id === selectedUnitId) : null) || null,
    [enrichedUnits, selectedUnitId]
  );

  const handleUnitSelect = (unitId: string) => {
    setSelectedUnitId(prevId => (prevId === unitId ? null : unitId));
  };

  const handleEditUnit = (unit: Unit) => {
    const { id, floor, name, area_sqm, pathData } = unit;
    setEditingUnit({ id, floor, name, area_sqm, pathData });
    setUnitModalOpen(true);
  };

  const handleEditTenant = (tenantId: string) => {
    setEditingTenantId(tenantId);
    setTenantModalOpen(true);
  }

  const handleAddNewUnit = () => {
    setEditingUnit(null); // 새로운 유닛 추가
    setUnitModalOpen(true);
  };
  
  const handleSaveUnit = (unitData: Partial<Unit>, contractData?: Partial<Contract>) => {
    if (unitData.id) { // Existing unit
      updateUnit(unitData as Unit);
      
      const existingContract = contracts.find(c => c.unitId === unitData.id);
      
      if (contractData && contractData.tenantId) { // Create or update contract
        if (existingContract) {
          updateContract({ ...existingContract, ...contractData });
        } else {
          addContract({ ...contractData, unitId: unitData.id } as Omit<Contract, 'id'>);
        }
      } else { // Remove contract if tenant is unselected
        if (existingContract) {
            deleteContract(existingContract.id);
        }
      }
    } else { // New unit
      const newUnit = addUnit({
        floor: selectedFloor,
        name: unitData.name || '새 유닛',
        area_sqm: unitData.area_sqm || 0,
        pathData: unitData.pathData,
      });

      if (contractData && contractData.tenantId) {
        addContract({ ...contractData, unitId: newUnit.id } as Omit<Contract, 'id'>);
      }
    }
    setUnitModalOpen(false);
  };

  const handleDeleteUnit = (unitId: string) => {
    if (window.confirm('정말로 이 유닛을 삭제하시겠습니까? 연관된 계약 정보는 삭제되지 않습니다.')) {
      if (selectedUnitId === unitId) {
        setSelectedUnitId(null);
      }
      deleteUnit(unitId);
    }
  };

  if (isDrafterMode) {
    return <FloorPlanDrafter />;
  }

  return (
    <div className="h-full flex flex-col p-4 gap-4">
      <UnitEditModal 
        isOpen={isUnitModalOpen} 
        onClose={() => setUnitModalOpen(false)} 
        onSave={handleSaveUnit}
        unit={editingUnit}
        floor={selectedFloor}
        tenantInfo={tenantInfo} // Pass tenantInfo here
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
              onEdit={() => handleEditUnit(selectedUnit)}
              onDelete={() => handleDeleteUnit(selectedUnit.id)}
              onEditTenant={selectedUnit.tenant ? () => handleEditTenant(selected.tenant!.id) : undefined}
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
