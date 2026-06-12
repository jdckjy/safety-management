
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Textarea } from '../../components/ui/textarea';
import { TenantInfo, CompanySize, BusinessCategory, AcquisitionChannel } from '../../types';

interface EditTenantDialogProps {
  tenant: TenantInfo | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedTenant: TenantInfo) => void;
}

const companySizeOptions: CompanySize[] = ['대기업', '중견', '중소', '스타트업'];
const businessCategoryOptions: BusinessCategory[] = ['의료', '교육', '연구', '근생', '기타'];
const acquisitionChannelOptions: AcquisitionChannel[] = ['직접 유치', '유관기관 소개', '온라인', '기타'];

const EditTenantDialog: React.FC<EditTenantDialogProps> = ({ tenant, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState<Partial<TenantInfo>>({});

  useEffect(() => {
    if (tenant) {
      setFormData(tenant);
    }
  }, [tenant]);

  const handleChange = (field: keyof TenantInfo, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (tenant) {
      onSave({ ...tenant, ...formData });
    }
    onClose();
  };

  if (!isOpen || !tenant) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>임차인 정보 수정</DialogTitle>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="companyName">업체(기관)명</Label>
              <Input id="companyName" value={formData.companyName || ''} onChange={(e) => handleChange('companyName', e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="businessRegistrationNumber">사업자등록번호</Label>
              <Input id="businessRegistrationNumber" value={formData.businessRegistrationNumber || ''} onChange={(e) => handleChange('businessRegistrationNumber', e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="representativeName">대표자명</Label>
              <Input id="representativeName" value={formData.representativeName || ''} onChange={(e) => handleChange('representativeName', e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="contact">연락처</Label>
              <Input id="contact" value={formData.contact || ''} onChange={(e) => handleChange('contact', e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="companySize">기업 규모</Label>
              <Select value={formData.companySize || ''} onValueChange={(value) => handleChange('companySize', value as CompanySize)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                      {companySizeOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                  </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
                <Label htmlFor="businessCategory">업종</Label>
                <Select value={formData.businessCategory || ''} onValueChange={(value) => handleChange('businessCategory', value as BusinessCategory)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                        {businessCategoryOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="address">주소</Label>
            <Input id="address" value={formData.address || ''} onChange={(e) => handleChange('address', e.target.value)} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="businessDescription">주요 사업 내용</Label>
            <Textarea id="businessDescription" value={formData.businessDescription || ''} onChange={(e) => handleChange('businessDescription', e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="acquisitionChannel">유치 경로</Label>
              <Select value={formData.acquisitionChannel || ''} onValueChange={(value) => handleChange('acquisitionChannel', value as AcquisitionChannel)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                      {acquisitionChannelOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                  </SelectContent>
              </Select>
            </div>
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
