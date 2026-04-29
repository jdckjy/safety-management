
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Contract, Unit } from '../../types';

interface TenantContractsTabProps {
  contracts: Contract[];
  units: Unit[];
}

// 숫자를 통화 형식으로 포맷하는 헬퍼 함수
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(amount);
};

const ContractCard: React.FC<{ contract: Contract, unit?: Unit }> = ({ contract, unit }) => {
  const today = new Date();
  const startDate = new Date(contract.startDate);
  const endDate = new Date(contract.endDate);
  const isActive = today >= startDate && today <= endDate;
  const area = unit ? unit.area_sqm : '0';

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-md font-bold">
          {unit?.name || contract.spaceName} ({contract.spaceId})
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
          <p className="font-mono text-right">{parseFloat(String(area)).toFixed(2)} ㎡</p>

          <p className="text-gray-500">보증금</p>
          <p className="font-mono text-right">{formatCurrency(contract.deposit)}</p>

          <p className="text-gray-500">월 임대료</p>
          <p className="font-mono text-right">{formatCurrency(contract.monthlyRent)}</p>
        </div>
      </CardContent>
    </Card>
  );
};

const TenantContractsTab: React.FC<TenantContractsTabProps> = ({ contracts, units }) => {
  const unitsMap: { [key: string]: Unit } = (units || []).reduce((map, unit) => {
    map[unit.id] = unit;
    return map;
  }, {} as { [key: string]: Unit });

  if (contracts.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>해당 임차인의 계약 정보가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {contracts.map(contract => {
        const unit = unitsMap[contract.unitId];
        return <ContractCard key={contract.id} contract={contract} unit={unit} />
      })}
    </div>
  );
};

export default TenantContractsTab;
