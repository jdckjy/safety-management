
import React from 'react';
import { useProjectData } from '../../providers/ProjectDataProvider';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { UNIT_STATUS } from '../../constants';

/**
 * 종합 임대 현황 대시보드 컴포넌트
 * tenantUnits 데이터를 기반으로 임대 현황을 시각화합니다.
 */
const OmsLeaseDashboard = () => {
  const { tenantUnits } = useProjectData();

  const units = tenantUnits || [];

  // 1. 전체 임대율 계산
  const totalArea = units.reduce((sum, unit) => sum + (unit.area || 0), 0);
  const occupiedArea = units
    .filter(unit => unit.status === UNIT_STATUS.OCCUPIED)
    .reduce((sum, unit) => sum + (unit.area || 0), 0);
  const occupancyRate = totalArea > 0 ? (occupiedArea / totalArea) * 100 : 0;

  // 2. 공실 현황
  const vacantUnits = units.filter(unit => unit.status === UNIT_STATUS.VACANT);
  const vacantUnitsCount = vacantUnits.length;
  const vacantArea = vacantUnits.reduce((sum, unit) => sum + (unit.area || 0), 0);

  // 3. 신규 리드 (데이터가 없으므로 0으로 표시)
  const newLeadsCount = 0;

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-2xl font-bold">종합 임대 현황</h2>
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>전체 임대율 (면적 기준)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{occupancyRate.toFixed(1)}%</div>
            <p className="text-sm text-muted-foreground">
              총 {totalArea.toFixed(0)}㎡ 중 {occupiedArea.toFixed(0)}㎡
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>공실 현황</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{vacantUnitsCount}개</div>
            <p className="text-sm text-muted-foreground">
              총 면적: {vacantArea.toFixed(0)}㎡
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>신규 잠재고객</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{newLeadsCount}건</div>
            <p className="text-sm text-muted-foreground">데이터 연동 필요</p>
          </CardContent>
        </Card>
         <Card>
          <CardHeader>
            <CardTitle>계약 만료 임박</CardTitle>
          </CardHeader>
          <CardContent>
            {/* 현재 데이터 구조에 계약 만료일이 없어, 임시로 UI만 구현합니다 */}
            <div className="text-4xl font-bold">0건</div>
            <p className="text-sm text-muted-foreground">30일 내 만료 예정</p>
          </CardContent>
        </Card>
      </div>
      {/* 여기에 공실 목록, 잠재고객 목록 등 상세 테이블 추가 가능 */}
    </div>
  );
};

export default OmsLeaseDashboard;
