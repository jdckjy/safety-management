
import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Textarea } from '../../components/ui/textarea';
import { TenantInfo, CompanySize, BusinessCategory, AcquisitionChannel } from '../../types';

interface EditTenantDialogProps {
  isOpen: boolean;
  onClose: () => void;
  tenant: TenantInfo;
  onUpdateTenant: (updatedTenant: TenantInfo) => void;
}

const EditTenantDialog: React.FC<EditTenantDialogProps> = ({ isOpen, onClose, tenant, onUpdateTenant }) => {
  const [companyName, setCompanyName] = useState(tenant.companyName);
  const [representativeName, setRepresentativeName] = useState(tenant.representativeName);
  const [contact, setContact] = useState(tenant.contact);
  const [businessCategory, setBusinessCategory] = useState<BusinessCategory>(tenant.businessCategory);
  const [companySize, setCompanySize] = useState<CompanySize>(tenant.companySize);
  const [businessDescription, setBusinessDescription] = useState(tenant.businessDescription || '');
  const [acquisitionChannel, setAcquisitionChannel] = useState<AcquisitionChannel>(tenant.acquisitionChannel || '기타');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    setCompanyName(tenant.companyName);
    setRepresentativeName(tenant.representativeName);
    setContact(tenant.contact);
    setBusinessCategory(tenant.businessCategory);
    setCompanySize(tenant.companySize);
    setBusinessDescription(tenant.businessDescription || '');
    setAcquisitionChannel(tenant.acquisitionChannel || '기타');
  }, [tenant]);

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!companyName) newErrors.companyName = '업체명은 필수입니다.';
    if (!representativeName) newErrors.representativeName = '대표자명은 필수입니다.';
    if (!contact) newErrors.contact = '연락처는 필수입니다.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    const updatedTenant: TenantInfo = {
      ...tenant,
      companyName,
      representativeName,
      contact,
      businessCategory,
      companySize,
      businessDescription,
      acquisitionChannel,
    };
    
    onUpdateTenant(updatedTenant);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[625px] bg-white p-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">임차인 정보 수정</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-x-6 gap-y-4 py-6">
          <div className="space-y-2">
            <Label>사업자등록번호</Label>
            <p className="font-mono bg-gray-100 px-3 py-2 rounded-md text-sm">{tenant.businessRegistrationNumber}</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="companyName">업체(기관)명</Label>
            <Input id="companyName" value={companyName} onChange={(e) => setCompanyName(e.target.value)} required className="bg-gray-50" />
            {errors.companyName && <p className="text-red-500 text-xs pt-1">{errors.companyName}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="representativeName">대표자명</Label>
            <Input id="representativeName" value={representativeName} onChange={(e) => setRepresentativeName(e.target.value)} required className="bg-gray-50" />
            {errors.representativeName && <p className="text-red-500 text-xs pt-1">{errors.representativeName}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="contact">연락처</Label>
            <Input id="contact" value={contact} onChange={(e) => setContact(e.target.value)} required className="bg-gray-50" />
            {errors.contact && <p className="text-red-500 text-xs pt-1">{errors.contact}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="companySize">기업 규모</Label>
            <Select onValueChange={(value) => setCompanySize(value as CompanySize)} value={companySize}>
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
          <div className="space-y-2">
            <Label htmlFor="businessCategory">업종</Label>
            <Select onValueChange={(value) => setBusinessCategory(value as BusinessCategory)} value={businessCategory}>
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
          <div className="col-span-2 space-y-2">
            <Label htmlFor="businessDescription">주요 사업 내용</Label>
            <Textarea id="businessDescription" value={businessDescription} onChange={(e) => setBusinessDescription(e.target.value)} className="bg-gray-50" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="acquisitionChannel">유치 경로</Label>
            <Select onValueChange={(value) => setAcquisitionChannel(value as AcquisitionChannel)} value={acquisitionChannel}>
                <SelectTrigger className="bg-gray-50">
                    <SelectValue placeholder="유치 경로 선택" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="직접 유치">직접 유치</SelectItem>
                    <SelectItem value="유관기관 소개">유관기관 소개</SelectItem>
                    <SelectItem value="온라인">온라인</SelectItem>
                    <SelectItem value="기타">기타</SelectItem>
                </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter className="gap-x-2">
          <DialogClose asChild>
            <Button type="button" variant="outline" size="lg">취소</Button>
          </DialogClose>
          <Button type="button" size="lg" onClick={handleSubmit}>저장</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditTenantDialog;
