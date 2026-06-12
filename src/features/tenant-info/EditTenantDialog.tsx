
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { TenantInfo } from '../../types';

interface EditTenantDialogProps {
  tenant: TenantInfo | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedTenant: TenantInfo) => void;
}

const EditTenantDialog: React.FC<EditTenantDialogProps> = ({
  tenant,
  isOpen,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<Partial<TenantInfo>>({});

  useEffect(() => {
    if (tenant) {
      setFormData(tenant);
    }
  }, [tenant]);

  if (!tenant) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    onSave({ ...tenant, ...formData });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>임차인 정보 수정</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="companyName" className="text-right">업체(기관)명</label>
            <Input id="companyName" name="companyName" value={formData.companyName || ''} onChange={handleChange} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="representativeName" className="text-right">대표자명</label>
            <Input id="representativeName" name="representativeName" value={formData.representativeName || ''} onChange={handleChange} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="contact" className="text-right">담당자 연락처</label>
            <Input id="contact" name="contact" value={formData.contact || ''} onChange={handleChange} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="businessCategory" className="text-right">업종 카테고리</label>
            <Input id="businessCategory" name="businessCategory" value={formData.businessCategory || ''} onChange={handleChange} className="col-span-3" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>취소</Button>
          <Button onClick={handleSave}>저장</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditTenantDialog;
