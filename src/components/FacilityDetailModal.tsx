// src/components/FacilityDetailModal.tsx
import React, { useState, useEffect } from 'react';
import { ComplexFacility } from '../types';
import { Button } from './ui/button';

// [1] 모달 컴포넌트가 받을 props 타입을 정의합니다.
interface FacilityDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  facility: ComplexFacility | null;
  onSave: (facility: ComplexFacility) => void;
}

// [핵심] shadcn/ui의 스타일을 모방한 Input 및 Label 컴포넌트입니다.
const Input = ({ ...props }) => <input className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" {...props} />;
const Label = ({ ...props }) => <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" {...props} />;
const Textarea = ({ ...props }) => <textarea className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" {...props} />;


export const FacilityDetailModal: React.FC<FacilityDetailModalProps> = ({ isOpen, onClose, facility, onSave }) => {
  // [2] 폼 데이터를 관리하는 상태 변수입니다.
  const [formData, setFormData] = useState<ComplexFacility | null>(null);

  // [3] facility prop이 변경될 때마다 formData를 업데이트합니다.
  useEffect(() => {
    setFormData(facility);
  }, [facility]);

  // [4] 폼 입력값 변경 시 formData를 업데이트하는 함수입니다.
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!formData) return;
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // [5] 저장 버튼 클릭 시 onSave 콜백을 호출하는 함수입니다.
  const handleSave = () => {
    if (formData) {
      onSave(formData);
    }
  };

  if (!isOpen || !formData) return null;

  const isNewFacility = !facility?.id;

  return (
    // [6] 모달 오버레이
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      {/* [7] 모달 컨텐츠 */}
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
        <h2 className="text-xl font-bold mb-4">{isNewFacility ? '신규 시설 등록' : '시설 정보 수정'}</h2>

        {/* ================================================================================= */}
        {/* [핵심 구현] 시설 정보를 입력받는 폼입니다.                                   */}
        {/* ================================================================================= */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">시설명</Label>
            <Input id="name" name="name" value={formData.name} onChange={handleChange} />
          </div>
          <div>
            <Label htmlFor="location">위치</Label>
            <Input id="location" name="location" value={formData.location} onChange={handleChange} />
          </div>
          <div>
            <Label htmlFor="openingDate">운영 시작일</Label>
            <Input id="openingDate" name="openingDate" type="date" value={formData.openingDate} onChange={handleChange} />
          </div>
          <div>
            <Label htmlFor="closingDate">운영 종료일 (미입력 시 상시 운영)</Label>
            <Input id="closingDate" name="closingDate" type="date" value={formData.closingDate || ''} onChange={handleChange} />
          </div>
          <div>
            <Label htmlFor="operatingHours">운영 시간</Label>
            <Input id="operatingHours" name="operatingHours" value={formData.operatingHours} onChange={handleChange} />
          </div>
          <div>
            <Label htmlFor="contact">연락처</Label>
            <Input id="contact" name="contact" value={formData.contact} onChange={handleChange} />
          </div>
          <div className="col-span-2">
            <Label htmlFor="description">시설 설명</Label>
            <Textarea id="description" name="description" value={formData.description} onChange={handleChange} />
          </div>
        </div>

        {/* ================================================================================= */}
        {/* [핵심 구현] 모달 하단의 버튼 영역입니다.                                       */}
        {/* ================================================================================= */}
        <div className="flex justify-end space-x-2 mt-6">
          <Button variant="outline" onClick={onClose}>취소</Button>
          <Button onClick={handleSave}>저장</Button>
        </div>
      </div>
    </div>
  );
};
