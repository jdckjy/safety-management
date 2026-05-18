
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Contract, Unit } from '../../types';

interface TenantContractsTabProps {
  contracts: Contract[];
  units: Unit[];
}

// 숫자를 안전하게 파싱하고, 실패 시 0을 반환하는 헬퍼 함수
const parseSafeNumber = (value: any): number => {
  const num = parseFloat(value);
  return isNaN(num) ? 0 : num;
};

// 숫자를 통화 형식으로 안전하게 포맷하는 헬퍼 함수
const formatCurrencySafe = (amount: any) => {
  const num = parseSafeNumber(amount);
  // ₩0과 NaN/Invalid 값을 구분하기 위해, 원래 값이 0이 아닐 때만 N/A 처리
  if (num === 0 && amount !== 0 && amount !== '0') {
      return 'N/A';
  }
  return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(num);
};

const ContractCard: React.FC<{ contract: Contract, unit?: Unit }> = ({ contract, unit }) => {
  const today = new Date();
  const startDate = new Date(contract.startDate);
  const endDate = new Date(contract.endDate);
  const isActive = today >= startDate && today <= endDate;
  
  const area = parseSafeNumber(unit?.area_sqm);

  const cardTitle = unit?.name ? `${unit.name} (${unit.floor})` : `삭제된 유닛 (${contract.unitId})`;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-md font-bold">
          {cardTitle}
        </CardTitle>
        <Badge variant={isActive ? 'success' : 'outline'}>
          {isActive ? '계약중' : '종료'}
        </Badge>
      </CardHeader>
      <CardContent className="text-sm">
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-4">
          <p className="text-gray-500">계약 기간</p>
          <p className="font-mono text-right">{`${contract.startDate} ~ ${contract.endDate}`}</p>

          <p className="text-gray-500">면적</p>
          <p className="font-mono text-right">{area.toFixed(2)} ㎡</p>

          <p className="text-gray-500">보증금</p>
          <p className="font-mono text-right">{formatCurrencySafe(contract.deposit)}</p>

          <p className="text-gray-500">월 임대료</p>
          <p className="font-mono text-right">{formatCurrencySafe(contract.monthlyRent)}</p>
        </div>
      </CardContent>
    </Card>
  );
};

const TenantContractsTab: React.FC<TenantContractsTabProps> = ({ contracts, units }) => {
  const unitsMap = useMemo(() => 
    (units || []).reduce((map, unit) => {
      map[unit.id] = unit;
      return map;
    }, {} as { [key: string]: Unit })
  , [units]);

  const validContracts = useMemo(
    () => (contracts || []).filter(contract => unitsMap[contract.unitId]),
    [contracts, unitsMap]
  );

  if (validContracts.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>해당 임차인의 계약 정보가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {validContracts.map(contract => (
        <ContractCard 
          key={contract.id} 
          contract={contract} 
          unit={unitsMap[contract.unitId]} 
        />
      ))}
    </div>
  );
};

export default TenantContractsTab;
