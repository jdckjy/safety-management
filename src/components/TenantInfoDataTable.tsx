
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { TenantInfo } from '@/types';

interface Props {
  tenantInfo: TenantInfo[];
  onEdit: (tenant: TenantInfo) => void;
  onDelete: (tenantId: string) => void;
}

export const TenantInfoDataTable: React.FC<Props> = ({ tenantInfo, onEdit, onDelete }) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>업체(기관)명</TableHead>
          <TableHead>사업자등록번호</TableHead>
          <TableHead>대표자명</TableHead>
          <TableHead>연락처</TableHead>
          <TableHead>업종</TableHead>
          <TableHead>기업 규모</TableHead>
          <TableHead>작업</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tenantInfo.map((tenant) => (
          <TableRow key={tenant.id}>
            <TableCell>{tenant.companyName}</TableCell>
            <TableCell>{tenant.businessRegistrationNumber}</TableCell>
            <TableCell>{tenant.representativeName}</TableCell>
            <TableCell>{tenant.contact}</TableCell>
            <TableCell>{tenant.businessCategory}</TableCell>
            <TableCell>{tenant.companySize}</TableCell>
            <TableCell>
              <Button variant="outline" size="sm" onClick={() => onEdit(tenant)}>수정</Button>
              <Button variant="destructive" size="sm" onClick={() => onDelete(tenant.id)} className="ml-2">삭제</Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
