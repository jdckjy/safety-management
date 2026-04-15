
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { TenantInfo } from '@/types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  tenant: TenantInfo;
  onEdit: (updatedTenant: TenantInfo) => void;
}

export const EditTenantInfoModal: React.FC<Props> = ({ isOpen, onClose, tenant, onEdit }) => {
  const [formData, setFormData] = useState<TenantInfo>(tenant);

  useEffect(() => {
    setFormData(tenant);
  }, [tenant, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value as any }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onEdit(formData);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[625px] bg-white p-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">임차인 정보 수정</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-x-6 gap-y-4 py-6">
            <div className="space-y-2">
              <Label htmlFor="companyName">업체(기관)명</Label>
              <Input id="companyName" name="companyName" value={formData.companyName} onChange={handleChange} required className="bg-gray-50" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="businessRegistrationNumber">사업자등록번호</Label>
              <Input id="businessRegistrationNumber" name="businessRegistrationNumber" value={formData.businessRegistrationNumber} onChange={handleChange} required className="bg-gray-50" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="representativeName">대표자명</Label>
              <Input id="representativeName" name="representativeName" value={formData.representativeName} onChange={handleChange} required className="bg-gray-50" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact">연락처</Label>
              <Input id="contact" name="contact" value={formData.contact} onChange={handleChange} required className="bg-gray-50" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="businessCategory">업종</Label>
              <Select onValueChange={(value) => handleSelectChange('businessCategory', value)} value={formData.businessCategory}>
                <SelectTrigger className="bg-gray-50">
                  <SelectValue placeholder="업종 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="의료">의료</SelectItem>
                  <SelectItem value="교육">교육</SelectItem>
                  <SelectItem value="연구">연구</SelectItem>
                  <SelectItem value="근생">근생</SelectItem>
                  <SelectItem value="기타">기타</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="companySize">기업 규모</Label>
              <Select onValueChange={(value) => handleSelectChange('companySize', value)} value={formData.companySize}>
                <SelectTrigger className="bg-gray-50">
                  <SelectValue placeholder="기업 규모 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="대기업">대기업</SelectItem>
                  <SelectItem value="중견">중견</SelectItem>
                  <SelectItem value="중소">중소</SelectItem>
                  <SelectItem value="스타트업">스타트업</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="gap-x-2">
            <DialogClose asChild>
              <Button type="button" variant="outline" size="lg">취소</Button>
            </DialogClose>
            <Button type="submit" size="lg">저장</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
