
import { useMemo, useCallback } from 'react';
import { TenantUnit, ComplexFacility, TenantUnitStatus } from '../types';

export interface LeaseAnalytics {
  totalArea: number;
  leasedArea: number;
  leaseRate: number;
  totalPotentialRevenue: number;
  leasedRevenue: number;
  unitCount: number;
  vacantCount: number;
}

const getFacilityForUnit = (unit: TenantUnit, facilities: ComplexFacility[]): string => {
  if (unit.facilityId) {
    const matchedFacility = facilities.find(f => f.id === unit.facilityId);
    if (matchedFacility) return matchedFacility.name;
  }
  const floorPrefix = unit.floor.split('-')[0];
  const parentFacility = facilities.find(f => f.id.startsWith(floorPrefix));
  if (parentFacility) return parentFacility.name;
  return '기타';
};

// [신규] 핵심 분석 로직을 재사용 가능하도록 별도 함수로 분리
const calculateLeaseAnalytics = (units: TenantUnit[], facilities: ComplexFacility[]): Record<string, LeaseAnalytics> => {
    if (!units || !facilities) return {};
    const result: Record<string, LeaseAnalytics> = {};
    const overall: LeaseAnalytics = {
      totalArea: 0, leasedArea: 0, leaseRate: 0,
      totalPotentialRevenue: 0, leasedRevenue: 0,
      unitCount: 0, vacantCount: 0,
    };
    for (const unit of units) {
      const facilityName = getFacilityForUnit(unit, facilities);
      if (!result[facilityName]) {
        result[facilityName] = { totalArea: 0, leasedArea: 0, leaseRate: 0, totalPotentialRevenue: 0, leasedRevenue: 0, unitCount: 0, vacantCount: 0 };
      }
      const category = result[facilityName];
      category.totalArea += unit.area;
      overall.totalArea += unit.area;
      category.unitCount++;
      overall.unitCount++;
      if(unit.rent) {
        category.totalPotentialRevenue += unit.rent;
        overall.totalPotentialRevenue += unit.rent;
      }
      if (unit.status === '입주') {
        category.leasedArea += unit.area;
        overall.leasedArea += unit.area;
        if (unit.rent) {
          category.leasedRevenue += unit.rent;
          overall.leasedRevenue += unit.rent;
        }
      } else {
        category.vacantCount++;
        overall.vacantCount++;
      }
    }
    for (const key in result) {
      const category = result[key];
      category.leaseRate = category.totalArea > 0 ? (category.leasedArea / category.totalArea) * 100 : 0;
    }
    if (overall.totalArea > 0) {
      overall.leaseRate = (overall.leasedArea / overall.totalArea) * 100;
    }
    result['전체'] = overall;
    return result;
}

export const useLeaseAnalytics = (units: TenantUnit[], facilities: ComplexFacility[]) => {
  const analytics = useMemo(() => calculateLeaseAnalytics(units, facilities), [units, facilities]);

  const vacantUnits = useMemo(() => {
    if (!units) return [];
    return units.filter(unit => unit.status !== '입주');
  }, [units]);

  // [신규] 공실 해소 시뮬레이션 함수
  const runLeaseSimulation = useCallback((areaToLease: number, avgRentPerSqm: number) => {
    // 원본 데이터의 불변성을 유지하기 위해 깊은 복사 수행
    const simulatedUnits: TenantUnit[] = JSON.parse(JSON.stringify(units));
    let remainingAreaToLease = areaToLease;
    
    // 공실 중인 유닛들을 대상으로 시뮬레이션 진행 (작은 면적부터 채움)
    const sortedVacantUnits = simulatedUnits.filter(u => u.status !== '입주').sort((a,b) => a.area - b.area);

    for (const unit of sortedVacantUnits) {
      if (remainingAreaToLease > 0) {
        // 가상으로 임대할 유닛의 원래 ID를 찾기 위해 원본 배열을 참조
        const originalUnitInSimulatedArray = simulatedUnits.find(u => u.id === unit.id);
        if(originalUnitInSimulatedArray){
            originalUnitInSimulatedArray.status = '입주';
            if (!originalUnitInSimulatedArray.rent) {
                originalUnitInSimulatedArray.rent = originalUnitInSimulatedArray.area * avgRentPerSqm;
            }
            remainingAreaToLease -= originalUnitInSimulatedArray.area;
        }
      }
    }
    // 변경된 가상 데이터를 기반으로 분석 로직 재실행
    return calculateLeaseAnalytics(simulatedUnits, facilities);
  }, [units, facilities]);

  return { analytics, vacantUnits, runLeaseSimulation };
};
