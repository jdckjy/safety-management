
import React from 'react';
import { useAppData } from '@/providers/AppDataContext';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import { ComplexFacility } from '@/types';

// 숫자를 포맷하거나, null일 경우 '-'를 반환하는 헬퍼 함수
const formatNumber = (num: number | null | undefined) => num?.toLocaleString() ?? '-';
const formatRatio = (num: number | null | undefined) => num?.toFixed(2) ?? '-';

const ComplexFacilitiesTab: React.FC = () => {
  const { complexFacilities, deleteComplexFacility } = useAppData();

  // 데이터를 카테고리별로 그룹화
  const groupedFacilities = (complexFacilities || []).reduce((acc, facility) => {
    const { category } = facility;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(facility);
    return acc;
  }, {} as Record<string, ComplexFacility[]>);

  const handleDelete = (id: string) => {
    if (window.confirm('정말로 이 항목을 삭제하시겠습니까? 데이터는 복구할 수 없습니다.')) {
      deleteComplexFacility(id);
    }
  };

  return (
    <div className="pt-4">
      {/* TODO: 나중에 여기에 '신규 시설 추가' 버튼을 구현할 수 있습니다. */}
      
      {Object.entries(groupedFacilities).map(([category, facilities]) => (
        <div key={category} className="mb-10">
          <h2 className="text-xl font-bold mb-4 tracking-tight">{category}</h2>
          <div className="border rounded-lg overflow-x-auto">
            <Table className="min-w-full divide-y divide-gray-200">
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead className="whitespace-nowrap px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">세부시설명</TableHead>
                  <TableHead className="whitespace-nowrap px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">시설면적(㎡)</TableHead>
                  <TableHead className="whitespace-nowrap px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">구성비(%)</TableHead>
                  <TableHead className="whitespace-nowrap px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">건축면적(㎡)</TableHead>
                  <TableHead className="whitespace-nowrap px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">건폐율(%)</TableHead>
                  <TableHead className="whitespace-nowrap px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">지상연면적(㎡)</TableHead>
                  <TableHead className="whitespace-nowrap px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">용적률(%)</TableHead>
                  <TableHead className="whitespace-nowrap px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">용도(주용도)</TableHead>
                  <TableHead className="whitespace-nowrap px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">높이(m)</TableHead>
                  <TableHead className="whitespace-nowrap px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">비고</TableHead>
                  <TableHead className="relative px-4 py-3">
                    <span className="sr-only">관리</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="bg-white divide-y divide-gray-200">
                {facilities.map((facility) => (
                  <TableRow key={facility.id} className="hover:bg-gray-50">
                    <TableCell className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{facility.name}</TableCell>
                    <TableCell className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{formatNumber(facility.area)}</TableCell>
                    <TableCell className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{facility.compositionRatio ?? '-'}</TableCell>
                    <TableCell className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{formatNumber(facility.buildingArea)}</TableCell>
                    <TableCell className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{formatRatio(facility.buildingCoverageRatio)}</TableCell>
                    <TableCell className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{formatNumber(facility.grossFloorArea)}</TableCell>
                    <TableCell className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{formatRatio(facility.floorAreaRatio)}</TableCell>
                    <TableCell className="px-4 py-4 whitespace-pre-wrap text-sm text-gray-500 max-w-xs">{facility.mainUse}</TableCell>
                    <TableCell className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{facility.height}</TableCell>
                    <TableCell className="px-4 py-4 whitespace-pre-wrap text-sm text-gray-500 max-w-xs">{facility.remarks}</TableCell>
                    <TableCell className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0 text-gray-400 hover:text-gray-800">
                            <span className="sr-only">메뉴 열기</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {/* TODO: 나중에 여기에 수정 기능(Modal 또는 Form)을 연결합니다. */}
                          <DropdownMenuItem>수정</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDelete(facility.id)} className="text-red-500 focus:text-red-500 focus:bg-red-50">
                            삭제
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ComplexFacilitiesTab;
