import React, { useState, useMemo } from 'react';
import { useProjectData } from '@/providers/ProjectDataProvider';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, PlusCircle } from 'lucide-react';
import { ComplexFacility } from '@/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import FacilityDetailModal from '@/components/shared/FacilityDetailModal';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const formatNumber = (num: number | null | undefined) => num?.toLocaleString() ?? '-';
const formatRatio = (num: number | null | undefined) => num?.toFixed(2) ?? '-';

const ComplexFacilitiesTab: React.FC = () => {
  const { complexFacilities, addComplexFacility, updateComplexFacility, deleteComplexFacility } = useProjectData();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFacility, setEditingFacility] = useState<ComplexFacility | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCriteria, setFilterCriteria] = useState('name');

  const filteredFacilities = useMemo(() => {
    return (complexFacilities || []).filter(facility => {
      if (!searchTerm) return true;
      const target = facility[filterCriteria as keyof ComplexFacility];
      if (typeof target === 'string') {
        return target.toLowerCase().includes(searchTerm.toLowerCase());
      }
      return false;
    });
  }, [complexFacilities, searchTerm, filterCriteria]);

  const groupedFacilities = useMemo(() => 
    (filteredFacilities || []).reduce((acc, facility) => {
      const { category } = facility;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(facility);
      return acc;
    }, {} as Record<string, ComplexFacility[]>),
  [filteredFacilities]);

  const categories = Object.keys(groupedFacilities);

  const handleAddNew = () => {
    setEditingFacility(null);
    setIsModalOpen(true);
  };

  const handleEdit = (facility: ComplexFacility) => {
    setEditingFacility(facility);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('정말로 이 항목을 삭제하시겠습니까? 데이터는 복구할 수 없습니다.')) {
      deleteComplexFacility(id);
    }
  };

  const handleSave = (facilityData: ComplexFacility | Omit<ComplexFacility, 'id'>) => {
    if ('id' in facilityData && facilityData.id) {
      updateComplexFacility(facilityData as ComplexFacility);
    } else {
      addComplexFacility(facilityData);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="pt-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-2">
          <Input
            placeholder="검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-60"
          />
          <Select value={filterCriteria} onValueChange={setFilterCriteria}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="필터" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">시설명</SelectItem>
              <SelectItem value="mainUse">주용도</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex-shrink-0">
          <Button onClick={handleAddNew} variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
            <PlusCircle className="mr-2 h-4 w-4" />
            신규 시설 추가
          </Button>
        </div>
      </div>

      <Tabs defaultValue={categories.length > 0 ? categories[0] : 'empty'}>
        <TabsList className="bg-transparent p-0 h-auto overflow-x-auto flex items-center space-x-1 border-b">
          {categories.map((category) => (
            <TabsTrigger key={category} value={category} 
              className="whitespace-nowrap rounded-none border-b-2 border-transparent px-4 py-2 text-sm font-medium text-gray-500 transition-all
                         hover:bg-gray-200/70 hover:border-gray-300
                         data-[state=active]:border-blue-600 data-[state=active]:text-gray-900 data-[state=active]:shadow-none"
            >
              {category}
            </TabsTrigger>
          ))}
        </TabsList>

        {categories.length > 0 ? (
          categories.map((category) => (
            <TabsContent key={category} value={category} className="mt-6">
              <div className="border rounded-lg overflow-x-auto">
                <Table className="min-w-full divide-y divide-gray-200">
                  <TableHeader className="bg-gray-50">
                    <TableRow>
                      <TableHead>세부시설명</TableHead>
                      <TableHead>시설면적(㎡)</TableHead>
                      <TableHead>건축면적(㎡)</TableHead>
                      <TableHead>건폐율(%)</TableHead>
                      <TableHead>지상연면적(㎡)</TableHead>
                      <TableHead>용적률(%)</TableHead>
                      <TableHead>용도</TableHead>
                      <TableHead>높이(m)</TableHead>
                      <TableHead>비고</TableHead>
                      <TableHead><span className="sr-only">관리</span></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="bg-white divide-y divide-gray-200">
                    {groupedFacilities[category].map((facility) => (
                      <TableRow key={facility.id} className="hover:bg-gray-50">
                        <TableCell className="font-medium">{facility.name}</TableCell>
                        <TableCell>{formatNumber(facility.area)}</TableCell>
                        <TableCell>{formatNumber(facility.buildingArea)}</TableCell>
                        <TableCell>{formatRatio(facility.buildingCoverageRatio)}</TableCell>
                        <TableCell>{formatNumber(facility.grossFloorArea)}</TableCell>
                        <TableCell>{formatRatio(facility.floorAreaRatio)}</TableCell>
                        <TableCell className="max-w-xs">{facility.mainUse}</TableCell>
                        <TableCell>{facility.height}</TableCell>
                        <TableCell className="max-w-xs">{facility.remarks}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0 text-gray-400 hover:text-gray-800">
                                <span className="sr-only">메뉴 열기</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEdit(facility)}>수정</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDelete(facility.id)} className="text-red-500 focus:text-red-500">삭제</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}\
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          ))
        ) : (
          <div className="text-center py-20 mt-6">
            <p className="text-lg text-gray-500">{searchTerm ? '검색 결과가 없습니다.' : '표시할 시설 정보가 없습니다.'}</p>
            {!searchTerm && <p className="text-sm text-gray-400 mt-2">우측 상단의 '신규 시설 추가' 버튼으로 정보를 등록해보세요.</p>}
          </div>
        )}
      </Tabs>

      <FacilityDetailModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        facility={editingFacility}
      />
    </div>
  );
};

export default ComplexFacilitiesTab;
