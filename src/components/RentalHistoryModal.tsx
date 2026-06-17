
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RentalHistory } from '@/types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<RentalHistory, 'id' | 'created_at' | 'occupancy_rate'>) => void;
  initialData?: RentalHistory | null;
}

const RentalHistoryModal: React.FC<Props> = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [year, setYear] = useState(new Date().getFullYear());
  const [rentableArea, setRentableArea] = useState(0);
  const [leasedArea, setLeasedArea] = useState(0);

  useEffect(() => {
    if (initialData) {
      setYear(initialData.year);
      setRentableArea(initialData.rentable_area);
      setLeasedArea(initialData.leased_area);
    } else {
      setYear(new Date().getFullYear());
      setRentableArea(0);
      setLeasedArea(0);
    }
  }, [initialData, isOpen]);

  const handleSubmit = () => {
    if (year > 0 && rentableArea > 0 && leasedArea >= 0) {
        onSubmit({
            year,
            rentable_area: rentableArea,
            leased_area: leasedArea,
        });
        onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initialData ? '실적 수정' : '신규 실적 추가'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <label htmlFor="year">연도</label>
            <Input id="year" type="number" value={year} onChange={(e) => setYear(parseInt(e.target.value, 10))} />
          </div>
          <div>
            <label htmlFor="rentableArea">임대가능면적 (㎡)</label>
            <Input id="rentableArea" type="number" value={rentableArea} onChange={(e) => setRentableArea(parseFloat(e.target.value))} />
          </div>
          <div>
            <label htmlFor="leasedArea">임대계약면적 (㎡)</label>
            <Input id="leasedArea" type="number" value={leasedArea} onChange={(e) => setLeasedArea(parseFloat(e.target.value))} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>취소</Button>
          <Button onClick={handleSubmit}>저장</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RentalHistoryModal;
