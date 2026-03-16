
import React, { useState, useEffect } from 'react';
import { ComplexFacility } from '@/types';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (facilityData: ComplexFacility | Omit<ComplexFacility, 'id'>) => void;
  facility: ComplexFacility | null; // null이면 '추가' 모드
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData as ComplexFacility);
  };

  if (!isOpen) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="sm:max-w-[600px]">
        <AlertDialogHeader>
          <AlertDialogTitle>{facility ? '시설 정보 수정' : '신규 시설 추가'}</AlertDialogTitle>
        </AlertDialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          {
            Object.keys(formData).filter(k => k !== 'id').map(key => (
              <div key={key} className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor={key} className="text-right">
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </Label>
                {['remarks', 'mainUse'].includes(key) ? (
                  <Textarea id={key} name={key} value={(formData as any)[key] || ''} onChange={handleChange} className="col-span-3" />
                ) : (
                  <Input id={key} name={key} type={typeof (formData as any)[key] === 'number' ? 'number' : 'text'} value={(formData as any)[key] || ''} onChange={handleChange} className="col-span-3" />
                )}
              </div>
            ))
          }
          <AlertDialogFooter>
            <AlertDialogCancel asChild>
              <Button type="button" variant="outline" onClick={onClose}>취소</Button>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button type="submit">저장</Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default FacilityDetailModal;
