
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
import { cn } from "../../lib/utils"; // cn 유틸리티 임포트

interface TenantInfoListProps {
  tenants: TenantInfo[];
  selectedTenantId: string | null;
  onTenantSelect: (id: string) => void;
}

const TenantInfoList: React.FC<TenantInfoListProps> = ({ tenants, selectedTenantId, onTenantSelect }) => {
  return (
    <div className="overflow-y-auto">
        <Table>
            <TableHeader className="sticky top-0 bg-white">
                <TableRow>
                    <TableHead>업체(기관)명</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {tenants.length > 0 ? (
                    tenants.map((tenant) => (
                        <TableRow 
                            key={tenant.id} 
                            onClick={() => onTenantSelect(tenant.id)} 
                            className={cn(
                                "cursor-pointer hover:bg-gray-100",
                                selectedTenantId === tenant.id && "bg-blue-50 hover:bg-blue-100"
                            )}
                        >
                            <TableCell className="font-medium">{tenant.companyName}</TableCell>
                        </TableRow>
                    ))
                ) : (
                    <TableRow>
                        <TableCell colSpan={1} className="h-24 text-center">
                            등록된 임차인 정보가 없습니다.
                        </TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>
    </div>
  );
};

export default TenantInfoList;
