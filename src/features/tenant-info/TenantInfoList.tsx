
import React from 'react';
import { TenantInfo } from '../../types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table"

interface TenantInfoListProps {
  tenants: TenantInfo[];
  onTenantSelect: (id: string) => void;
}

const TenantInfoList: React.FC<TenantInfoListProps> = ({ tenants, onTenantSelect }) => {
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
            </TableRow>
        </TableHeader>
        <TableBody>
            {tenants.length > 0 ? (
                tenants.map((tenant) => (
                    <TableRow key={tenant.id} onClick={() => onTenantSelect(tenant.id)} className="cursor-pointer hover:bg-gray-50">
                        <TableCell className="font-medium">{tenant.companyName}</TableCell>
                        <TableCell>{tenant.businessRegistrationNumber}</TableCell>
                        <TableCell>{tenant.representativeName}</TableCell>
                        <TableCell>{tenant.contact}</TableCell>
                        <TableCell>{tenant.businessCategory}</TableCell>
                        <TableCell>{tenant.companySize}</TableCell>
                    </TableRow>
                ))
            ) : (
                <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                        등록된 임차인 정보가 없습니다.
                    </TableCell>
                </TableRow>
            )}
        </TableBody>
    </Table>
  );
};

export default TenantInfoList;
