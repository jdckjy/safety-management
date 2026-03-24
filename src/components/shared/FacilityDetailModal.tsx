
import React, { useState, useEffect } from 'react';
import { ComplexFacility } from '@/types';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (facilityData: ComplexFacility | Omit<ComplexFacility, 'id'>) => void;
  facility: ComplexFacility | null;
}

const FacilityDetailModal: React.FC<Props> = ({ isOpen, onClose, onSave, facility }) => {
  const [formData, setFormData] = useState<Partial<ComplexFacility>>({});

  useEffect(() => {
    if (facility) {
      setFormData(facility);
    } else {
      setFormData({
        category: '공공편익시설', name: '', area: 0, buildingArea: 0, compositionRatio: 0,
        buildingCoverageRatio: 0, grossFloorArea: 0, floorAreaRatio: 0, mainUse: '', height: '', remarks: '',
      });
    }
  }, [facility, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const isNumericField = ['area', 'buildingArea', 'compositionRatio', 'buildingCoverageRatio', 'grossFloorArea', 'floorAreaRatio'].includes(name);
    setFormData(prev => ({ ...prev, [name]: isNumericField ? parseFloat(value) || 0 : value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData as ComplexFacility);
  };

  if (!isOpen) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="sm:max-w-[700px] bg-white text-gray-900">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-gray-900">{facility ? '시설 정보 수정' : '신규 시설 추가'}</AlertDialogTitle>
        </AlertDialogHeader>
        <form id="facility-form" onSubmit={handleSubmit} className="py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            
            <div className="space-y-2">
              <Label htmlFor="category" className="text-gray-700">시설 구분</Label>
              <Select name="category" value={formData.category || ''} onValueChange={(value) => handleSelectChange('category', value)}>
                <SelectTrigger id="category" className="bg-white border-gray-300 text-gray-900">
                  <SelectValue placeholder="시설 구분을 선택하세요" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="공공편익시설">공공편익시설</SelectItem>
                  <SelectItem value="숙박시설">숙박시설</SelectItem>
                  <SelectItem value="의료서비스시설">의료서비스시설</SelectItem>
                  <SelectItem value="기타시설">기타시설</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name" className="text-gray-700">세부시설명</Label>
              <Input id="name" name="name" value={formData.name || ''} onChange={handleChange} className="bg-white border-gray-300 text-gray-900" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="area" className="text-gray-700">시설면적(㎡)</Label>
              <Input id="area" name="area" type="number" value={formData.area || 0} onChange={handleChange} className="bg-white border-gray-300 text-gray-900" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="buildingArea" className="text-gray-700">건축면적(㎡)</Label>
              <Input id="buildingArea" name="buildingArea" type="number" value={formData.buildingArea || 0} onChange={handleChange} className="bg-white border-gray-300 text-gray-900" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="grossFloorArea" className="text-gray-700">연면적(㎡)</Label>
              <Input id="grossFloorArea" name="grossFloorArea" type="number" value={formData.grossFloorArea || 0} onChange={handleChange} className="bg-white border-gray-300 text-gray-900" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="compositionRatio" className="text-gray-700">구성비(%)</Label>
              <Input id="compositionRatio" name="compositionRatio" type="number" value={formData.compositionRatio || 0} onChange={handleChange} className="bg-white border-gray-300 text-gray-900" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="buildingCoverageRatio" className="text-gray-700">건폐율(%)</Label>
              <Input id="buildingCoverageRatio" name="buildingCoverageRatio" type="number" value={formData.buildingCoverageRatio || 0} onChange={handleChange} className="bg-white border-gray-300 text-gray-900" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="floorAreaRatio" className="text-gray-700">용적률(%)</Label>
              <Input id="floorAreaRatio" name="floorAreaRatio" type="number" value={formData.floorAreaRatio || 0} onChange={handleChange} className="bg-white border-gray-300 text-gray-900" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="height" className="text-gray-700">높이(m)</Label>
              <Input id="height" name="height" value={formData.height || ''} onChange={handleChange} className="bg-white border-gray-300 text-gray-900" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mainUse" className="text-gray-700">주용도</Label>
              <Input id="mainUse" name="mainUse" value={formData.mainUse || ''} onChange={handleChange} className="bg-white border-gray-300 text-gray-900" />
            </div>

            <div className="col-span-1 md:col-span-2 space-y-2">
              <Label htmlFor="remarks" className="text-gray-700">비고</Label>
              <Textarea id="remarks" name="remarks" value={formData.remarks || ''} onChange={handleChange} className="bg-white border-gray-300 text-gray-900" />
            </div>

          </div>
        </form>
        <AlertDialogFooter className="mt-6">
          <AlertDialogCancel asChild>
            <Button type="button" variant="ghost" onClick={onClose}>취소</Button>
          </AlertDialogCancel>
          <Button type="submit" form="facility-form" className="bg-indigo-600 hover:bg-indigo-700 text-white">저장</Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default FacilityDetailModal;
