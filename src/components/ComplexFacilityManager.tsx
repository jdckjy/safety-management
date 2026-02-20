
import React, { useState } from 'react';
import { useAppData } from '../providers/AppDataContext';
import { ComplexFacility } from '../types';
import { Plus, Edit, Trash2 } from 'lucide-react';

// TODO: Add/Edit Modal Component

const ComplexFacilityManager: React.FC = () => {
  const { complexFacilities, addComplexFacility, updateComplexFacility, deleteComplexFacility } = useAppData();

  // Group facilities by category for rendering
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
        <button 
          className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          onClick={() => { /* TODO: Open Add Modal */ }}
        >
          <Plus size={18} />
          시설 추가
        </button>
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
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">시설내용</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">건축면적(㎡)</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">주용도</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">높이(m)</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">비고</th>
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">Edit</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {facilities.map((facility) => (
                    <tr key={facility.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{facility.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{facility.area}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{facility.details}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{facility.buildingArea}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{facility.mainUse}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{facility.height}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{facility.remarks}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button className="text-indigo-600 hover:text-indigo-900 mr-4">
                          <Edit size={18} />
                        </button>
                        <button className="text-red-600 hover:text-red-900" onClick={() => deleteComplexFacility(facility.id)}>
                           <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ComplexFacilityManager;
