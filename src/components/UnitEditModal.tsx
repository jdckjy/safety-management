
// src/components/UnitEditModal.tsx
import React, { useState, useEffect } from 'react';
import { TenantUnit, TenantInfo } from '../types';
import { UNIT_STATUS } from '../constants';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2 } from 'lucide-react';

interface UnitEditModalProps {
  unit: Partial<TenantUnit> | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedUnit: Partial<TenantUnit>) => void;
  onDelete: (unitId: string) => void;
  isCreating: boolean;
  tenants: TenantInfo[];
}

const VACANT_OPTION_VALUE = '__VACANT__';

const UNIT_STATUS_DISPLAY_NAMES: { [key: string]: string } = {
    [UNIT_STATUS.OCCUPIED]: '임대중',
    [UNIT_STATUS.VACANT]: '공실',
    [UNIT_STATUS.IN_DISCUSSION]: '협의중',
    [UNIT_STATUS.NON_RENTABLE]: '임대불가',
};

export const UnitEditModal: React.FC<UnitEditModalProps> = ({ unit, isOpen, onClose, onSave, onDelete, isCreating, tenants }) => {
  const [formData, setFormData] = useState<Partial<TenantUnit>>({});

  useEffect(() => {
    if (isOpen) {
      if (unit) {
        setFormData({
          ...unit,
          status: unit.status || UNIT_STATUS.VACANT,
        });
      } else {
        setFormData({
          id: '',
          name: '',
          area: 0,
          status: UNIT_STATUS.VACANT,
          tenant: undefined,
        });
      }
    }
  }, [unit, isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const isNumeric = e.target.type === 'number';
    setFormData(prev => ({ ...prev, [name]: isNumeric ? Number(value) : value }));
  };

  const handleSelectChange = (name: keyof TenantUnit, value: string) => {
    if (value) { 
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleTenantChange = (value: string) => {
    if (value === VACANT_OPTION_VALUE) {
      setFormData(prev => ({ ...prev, tenant: undefined, status: UNIT_STATUS.VACANT }));
    } else if (value) {
      setFormData(prev => ({ ...prev, tenant: value, status: UNIT_STATUS.OCCUPIED }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const handleDeleteClick = () => {
    if (unit?.id && window.confirm(`'${unit.id}' 호실을 정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`)) {
      onDelete(unit.id);
      onClose();
    }
  };

  const modalTitle = isCreating ? '신규 호실 생성' : `호실 정보 수정 (${unit?.id})`;
  const tenantSelectValue = formData.tenant || VACANT_OPTION_VALUE;
  const safeTenants = (tenants || []).filter(t => t && t.id);

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg bg-white p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{modalTitle}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-x-6 gap-y-4 py-6">
            <div className="space-y-2">
              <Label htmlFor="id">호실 번호</Label>
              <Input id="id" name="id" value={formData.id || ''} onChange={handleInputChange} required disabled={!isCreating} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="area">면적 (㎡)</Label>
              <Input id="area" name="area" type="number" value={formData.area || 0} onChange={handleInputChange} required />
            </div>
            <div className="space-y-2 col-span-2">
               <Label htmlFor="name">호실 이름/위치</Label>
               <Input id="name" name="name" value={formData.name || ''} onChange={handleInputChange} />
            </div>
             <div className="space-y-2">
              <Label htmlFor="status">상태</Label>
              <Select
                name="status"
                value={formData.status || undefined}
                onValueChange={(value) => handleSelectChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="상태 선택" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(UNIT_STATUS_DISPLAY_NAMES).map(([key, name]) => (
                     // Ultimate Guard for Status dropdown
                    key && <SelectItem key={key} value={key}>{name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tenant">임차인</Label>
              <Select
                name="tenant"
                value={tenantSelectValue}
                onValueChange={handleTenantChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="임차인 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={VACANT_OPTION_VALUE}>
                    <span className="text-gray-500">임차인 없음 (공실)</span>
                  </SelectItem>
                  {safeTenants.map(t => (
                    // Ultimate Guard for Tenant dropdown
                    t.id && <SelectItem key={t.id} value={t.id}>{t.companyName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="mt-6 flex justify-between items-center">
            {!isCreating ? (
               <Button type="button" variant="destructive" onClick={handleDeleteClick} className="flex items-center gap-2">
                <Trash2 size={16} />
                삭제
              </Button>
            ) : ( <div /> )}
             <div className="flex-grow flex justify-end gap-2">
                <DialogClose asChild>
                  <Button type="button" variant="outline">취소</Button>
                </DialogClose>
                <Button type="submit">저장</Button>
              </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
