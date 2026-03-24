import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { TenantUnit } from "../types";
import { Badge } from "./ui/badge";

interface TenantUnitDataTableProps {
  tenantUnits: TenantUnit[];
  onRowClick: (unit: TenantUnit) => void;
}

export const TenantUnitDataTable = ({ tenantUnits, onRowClick }: TenantUnitDataTableProps) => {

  const formatCurrency = (amount: number | undefined) => {
    if (typeof amount !== 'number') return '-';
    return new Intl.NumberFormat('ko-KR').format(amount) + '원';
  };

  const getStatusVariant = (status: TenantUnit['status']) => {
    switch (status) {
      case '입주':
        return 'default';
      case '공실':
        return 'secondary';
      case '수리중':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[150px]">세대</TableHead>
          <TableHead className="w-[80px]">층</TableHead>
          <TableHead className="w-[100px] text-right">면적(㎡)</TableHead>
          <TableHead className="w-[100px] text-center">상태</TableHead>
          <TableHead>현재 임차인</TableHead>
          <TableHead className="w-[150px] text-right">월 임대료</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tenantUnits.length > 0 ? (
          tenantUnits.map((unit) => (
            <TableRow key={unit.id} onClick={() => onRowClick(unit)} className="cursor-pointer hover:bg-muted/50">
              <TableCell className="font-medium">{unit.name}</TableCell>
              <TableCell>{unit.floor}</TableCell>
              <TableCell className="text-right">{unit.area.toFixed(2)}</TableCell>
              <TableCell className="text-center">
                <Badge variant={getStatusVariant(unit.status)}>{unit.status}</Badge>
              </TableCell>
              <TableCell>{unit.tenantName || '-'}</TableCell>
              <TableCell className="text-right">{formatCurrency(unit.rent)}</TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={6} className="h-24 text-center">등록된 세대 정보가 없습니다.</TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};
