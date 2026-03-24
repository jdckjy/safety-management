
import React, { useState } from 'react';
import { useProjectData } from '../providers/ProjectDataProvider';
import { ComplexFacility } from '../types';
import { Plus, Edit, Trash2 } from 'lucide-react';
import FacilityDetailModal from './shared/FacilityDetailModal';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { Button } from './ui/button';

const ComplexFacilityManager: React.FC = () => {
  const { complexFacilities, addComplexFacility, updateComplexFacility, deleteComplexFacility } = useProjectData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState<ComplexFacility | null>(null);

  const handleAddClick = () => {
    setSelectedFacility(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (facility: ComplexFacility) => {
    setSelectedFacility(facility);
    setIsModalOpen(true);
  };

  const handleSave = (facilityData: ComplexFacility | Omit<ComplexFacility, 'id'>) => {
    if ('id' in facilityData && facilityData.id) {
      updateComplexFacility(facilityData as ComplexFacility);
    } else {
      addComplexFacility(facilityData);
    }
    setIsModalOpen(false);
  };

  const groupedFacilities = complexFacilities.reduce((acc, facility) => {
    if (!acc[facility.category]) {
      acc[facility.category] = [];
    }
    acc[facility.category].push(facility);
    return acc;
  }, {} as Record<string, ComplexFacility[]>);

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">단지 시설 정보</h2>
        <Button onClick={handleAddClick} className="flex items-center gap-2">
          <Plus size={18} />
          시설 추가
        </Button>
      </div>
      <div className="space-y-6">
        {Object.entries(groupedFacilities).map(([category, facilities]) => (
          <div key={category}>
            <h3 className="text-lg font-semibold mb-2">{category}</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">세부시설명</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">시설면적(㎡)</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">주용도</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">높이(m)</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">비고</th>
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {facilities.map((facility) => (
                    <tr key={facility.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{facility.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{facility.area.toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{facility.mainUse}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{facility.height}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{facility.remarks}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Button variant="ghost" size="sm" onClick={() => handleEditClick(facility)} className="text-indigo-600 hover:text-indigo-900">
                          <Edit size={18} />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-900">
                              <Trash2 size={18} />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>정말 삭제하시겠습니까?</AlertDialogTitle>
                              <AlertDialogDescription>
                                이 작업은 되돌릴 수 없습니다. {facility.name} 시설 정보를 영구적으로 삭제합니다.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>취소</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deleteComplexFacility(facility.id)}>삭제</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
      <FacilityDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        facility={selectedFacility}
      />
    </div>
  );
};

export default ComplexFacilityManager;
