
import React, { useMemo } from 'react';
import { useAppData } from '../../providers/AppDataContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';

const TenantRoster: React.FC = () => {
  const { buildings } = useAppData();

  const tenants = useMemo(() => {
    // [✅ 최종 수정] 어떤 경우에도 오류가 발생하지 않도록, buildings가 유효한 배열이 아닐 경우 항상 빈 배열을 반환하도록 방어 코드를 강화합니다.
    if (!Array.isArray(buildings) || buildings.length === 0) {
      return [];
    }
    
    const allUnits = buildings.flatMap(b => b?.units ?? []);

    return allUnits.filter(unit => unit && unit.status === 'occupied' && unit.tenant_name);
  }, [buildings]);

  const totalTenants = tenants.length;

  return (
    <Card>
      <CardHeader>
        <CardTitle>임차인 명단 (Tenant Roster)</CardTitle>
        <p className="text-sm text-gray-500 mt-1">
          현재 점유 중인 총 {totalTenants}개의 임차인이 있습니다.
        </p>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>유닛 ID</TableHead>
              <TableHead>임차인</TableHead>
              <TableHead>면적 (sqm)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tenants.length > 0 ? (
              tenants.map(unit => (
                <TableRow key={unit.id}>
                  <TableCell className="font-medium">{unit.id}</TableCell>
                  <TableCell>{unit.tenant_name}</TableCell> 
                  <TableCell>{unit.area_sqm}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} className="text-center">
                  표시할 임차인 정보가 없습니다.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default TenantRoster;
