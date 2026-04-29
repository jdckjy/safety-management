
import React, { useMemo } from 'react';
import { useProjectData } from '../../providers/ProjectDataProvider';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';

const TenantRoster: React.FC = () => {
  const { tenantInfo, contracts, units } = useProjectData();

  const getTenantMetrics = (tenantId: string) => {
    const tenantContracts = (contracts || []).filter(c => c.tenantId === tenantId);
    
    const totalArea = tenantContracts.reduce((sum, contract) => {
      const unit = (units || []).find(u => u.id === contract.unitId);
      return sum + (unit?.area_sqm || 0);
    }, 0);

    const totalRent = tenantContracts.reduce((sum, contract) => sum + (contract.monthlyRent || 0), 0);
    
    const averageRentPerSqm = totalArea > 0 ? totalRent / totalArea : 0;

    return { totalArea, totalRent, averageRentPerSqm };
  };

  const sortedTenantInfo = useMemo(() => {
    if (!tenantInfo) return [];
    return [...tenantInfo].sort((a, b) => {
      const metricsA = getTenantMetrics(a.id);
      const metricsB = getTenantMetrics(b.id);
      return metricsB.totalArea - metricsA.totalArea;
    });
  }, [tenantInfo, contracts, units]);


  if (!tenantInfo) {
    return <div>임차인 정보를 불러오는 중입니다...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>임차인 명단 (면적순)</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>순위</TableHead>
              <TableHead>업체(기관)명</TableHead>
              <TableHead>대표자명</TableHead>
              <TableHead>총 임대 면적</TableHead>
              <TableHead>월 임대료 총액</TableHead>
              <TableHead>단위면적당 임대료</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedTenantInfo.map((tenant, index) => {
              const { totalArea, totalRent, averageRentPerSqm } = getTenantMetrics(tenant.id);
              return (
                <TableRow key={tenant.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell className="font-medium">{tenant.companyName}</TableCell>
                  <TableCell>{tenant.representativeName}</TableCell>
                  <TableCell>{totalArea.toFixed(2)} ㎡</TableCell>
                  <TableCell>{totalRent.toLocaleString()} 원</TableCell>
                  <TableCell>{averageRentPerSqm.toLocaleString('ko-KR', { style: 'currency', currency: 'KRW' })} / ㎡</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default TenantRoster;
