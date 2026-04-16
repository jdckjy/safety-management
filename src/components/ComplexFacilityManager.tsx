
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ComplexFacility } from '@/types';

interface ComplexFacilityManagerProps {
  facilities: ComplexFacility[];
  onAddFacility: (facility: Omit<ComplexFacility, 'id'>) => void;
}

const ComplexFacilityManager: React.FC<ComplexFacilityManagerProps> = ({ facilities, onAddFacility }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newFacility, setNewFacility] = useState<Partial<Omit<ComplexFacility, 'id'>>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewFacility(prev => ({ ...prev, [name]: value }));
  };

  const handleNumberInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const parsedValue = parseFloat(value);
    if (!isNaN(parsedValue)) {
      setNewFacility(prev => ({ ...prev, [name]: parsedValue }));
    }
  };

  const handleSelectChange = (value: string) => {
    setNewFacility(prev => ({ ...prev, category: value as ComplexFacility['category'] }));
  };

  const handleAddClick = () => {
    setIsModalOpen(true);
    setNewFacility({
      floor: 0,
      name: '',
      area: 0,
      category: 'public',
      buildingArea: 0,
      buildingCoverageRatio: 0,
      grossFloorArea: 0,
      floorAreaRatio: 0,
      mainUse: '',
      height: 0,
      remarks: '',
    });
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleSave = () => {
    // Ensure all required fields are present before saving
    if (newFacility.name && newFacility.category && newFacility.floor !== undefined && newFacility.area !== undefined) {
        onAddFacility(newFacility as Omit<ComplexFacility, 'id'>);
        setIsModalOpen(false);
    } else {
        // Optionally, show an error message to the user
        console.error("Required fields are missing");
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">단지 정보</h2>
        <Button onClick={handleAddClick}>+ 신규 시설 추가</Button>
      </div>
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="grid grid-cols-5 gap-4 font-semibold text-gray-600 pb-2 border-b">
          <div>시설구분</div>
          <div>세부시설명</div>
          <div>시설면적(㎡)</div>
          <div>높이(m)</div>
          <div>비고</div>
        </div>
        {
          facilities.map((facility) => (
            <div key={facility.id} className="grid grid-cols-5 gap-4 py-3 border-b text-sm">
              <div>{facility.category}</div>
              <div>{facility.name}</div>
              <div>{facility.area.toLocaleString()}</div>
              <div>{facility.height ?? '-'}</div>
              <div>{facility.remarks ?? '-'}</div>
            </div>
          ))
        }
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl bg-white">
          <DialogHeader>
            <DialogTitle>신규 시설 추가</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-6 py-6">
            <div className="space-y-4">
              <div>
                <Label>시설 구분</Label>
                <Select value={newFacility.category} onValueChange={handleSelectChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="시설 구분 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">공공편익시설</SelectItem>
                    <SelectItem value="commercial">상업시설</SelectItem>
                    <SelectItem value="office">업무시설</SelectItem>
                    <SelectItem value="residential">주거시설</SelectItem>
                    <SelectItem value="special">특수시설</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>시설면적(㎡)</Label>
                  <Input type="number" name="area" value={newFacility.area ?? ''} onChange={handleNumberInputChange} />
                </div>
                <div>
                  <Label>건축면적(㎡)</Label>
                  <Input type="number" name="buildingArea" value={newFacility.buildingArea ?? ''} onChange={handleNumberInputChange} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>연면적(㎡)</Label>
                  <Input type="number" name="grossFloorArea" value={newFacility.grossFloorArea ?? ''} onChange={handleNumberInputChange} />
                </div>
                 <div>
                  <Label>건폐율(%)</Label>
                  <Input type="number" name="buildingCoverageRatio" value={newFacility.buildingCoverageRatio ?? ''} onChange={handleNumberInputChange} />
                </div>
              </div>
               <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>용적률(%)</Label>
                  <Input type="number" name="floorAreaRatio" value={newFacility.floorAreaRatio ?? ''} onChange={handleNumberInputChange} />
                </div>
                 <div>
                  <Label>높이(m)</Label>
                  <Input type="number" name="height" value={newFacility.height ?? ''} onChange={handleNumberInputChange} />
                </div>
              </div>
               <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>주용도</Label>
                  <Input name="mainUse" value={newFacility.mainUse ?? ''} onChange={handleInputChange} />
                </div>
                <div>
                    <Label>층</Label>
                    <Input type="number" name="floor" value={newFacility.floor ?? ''} onChange={handleNumberInputChange} />
                </div>
              </div>
            </div>
            <div className="space-y-4 flex flex-col">
               <div>
                <Label>세부시설명</Label>
                <Input name="name" value={newFacility.name ?? ''} onChange={handleInputChange} />
              </div>
              <div className="flex-grow">
                <Label>비고</Label>
                <Textarea name="remarks" value={newFacility.remarks ?? ''} onChange={handleInputChange} className="h-full" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" onClick={handleModalClose}>취소</Button>
            </DialogClose>
            <Button onClick={handleSave}>저장</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ComplexFacilityManager;
