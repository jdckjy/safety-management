
import React, { useState, useEffect } from 'react';
import { TenantUnit, TenantUnitStatus } from '../../types';
import { useProjectData } from '../../providers/ProjectDataProvider';
import Modal from '../../components/ui/Modal'; 
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { X } from 'lucide-react';
import { UNIT_STATUS } from '../../constants';

interface UnitEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  unit: Partial<TenantUnit> | null;
  floor: string;
}

const statusMapping: Record<TenantUnitStatus, string> = {
    [UNIT_STATUS.OCCUPIED]: '입주',
    [UNIT_STATUS.VACANT]: '공실',
    [UNIT_STATUS.IN_DISCUSSION]: '협의중',
    [UNIT_STATUS.NON_RENTABLE]: '비임대',
};

const statusOptions: TenantUnitStatus[] = Object.values(UNIT_STATUS);

const UnitEditModal: React.FC<UnitEditModalProps> = ({ isOpen, onClose, unit, floor }) => {
  const { addTenantUnit, updateTenantUnit } = useProjectData();
  const [formData, setFormData] = useState<Partial<TenantUnit>>({});

  useEffect(() => {
    if (isOpen) {
        if (unit) {
            setFormData(unit);
        } else {
            setFormData({
                floor: floor,
                name: '',
                area: 0,
                status: UNIT_STATUS.VACANT,
                tenant: '',
                rent: 0,
                deposit: 0,
                contractDate: '',
                moveInDate: '',
                moveOutDate: '',
            });
        }
    }
  }, [isOpen, unit, floor]);

  const handleSave = () => {
    if (formData.id) {
        updateTenantUnit(formData as TenantUnit);
    } else {
        addTenantUnit(formData as Omit<TenantUnit, 'id'>);
    }
    onClose();
  };

  const handleChange = (field: keyof TenantUnit, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
        <div className="bg-white rounded-lg shadow-xl">
            <div className="p-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold">{unit ? "호실 정보 수정" : "신규 호실 추가"}</h2>
                    <Button variant="ghost" size="icon" onClick={onClose}>
                        <X className="h-5 w-5" />
                    </Button>
                </div>
            </div>

            <div className="p-6 pt-0 grid gap-6">
                <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">호실명</Label>
                        <Input id="name" value={formData.name || ''} onChange={(e) => handleChange('name', e.target.value)} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="area">면적(m²)</Label>
                        <Input id="area" type="number" value={formData.area || 0} onChange={(e) => handleChange('area', parseFloat(e.target.value))} />
                    </div>
                </div>

                <div className="grid gap-2">
                    <Label>상태</Label>
                    <div className="flex gap-2">
                        {statusOptions.map(option => (
                            <Button 
                                key={option} 
                                variant={formData.status === option ? 'default' : 'outline'}
                                onClick={() => handleChange('status', option)} >
                                {statusMapping[option]}
                            </Button>
                        ))}
                    </div>
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="tenant">임차인</Label>
                    <Input id="tenant" value={formData.tenant || ''} onChange={(e) => handleChange('tenant', e.target.value)} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                     <div className="grid gap-2">
                        <Label htmlFor="rent">월임대료</Label>
                        <Input id="rent" type="number" value={formData.rent || 0} onChange={(e) => handleChange('rent', parseInt(e.target.value, 10) || 0)} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="deposit">보증금</Label>
                        <Input id="deposit" type="number" value={formData.deposit || 0} onChange={(e) => handleChange('deposit', parseInt(e.target.value, 10) || 0)} />
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="contractDate">계약일</Label>
                        <Input id="contractDate" type="date" value={formData.contractDate || ''} onChange={(e) => handleChange('contractDate', e.target.value)} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="moveInDate">입주일</Label>
                        <Input id="moveInDate" type="date" value={formData.moveInDate || ''} onChange={(e) => handleChange('moveInDate', e.target.value)} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="moveOutDate">만기일</Label>
                        <Input id="moveOutDate" type="date" value={formData.moveOutDate || ''} onChange={(e) => handleChange('moveOutDate', e.target.value)} />
                    </div>
                </div>
            </div>

            <div className="p-6 flex justify-end gap-2">
                <Button variant="outline" onClick={onClose}>취소</Button>
                <Button onClick={handleSave}>저장</Button>
            </div>
        </div>
    </Modal>
  );
};

export default UnitEditModal;
