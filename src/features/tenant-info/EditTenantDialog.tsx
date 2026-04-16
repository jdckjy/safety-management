
import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { TenantInfo, CompanySize, BusinessCategory } from '../../types';

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
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // When the tenant prop changes (e.g., user opens dialog for a different tenant),
  // update the state.
  useEffect(() => {
    setCompanyName(tenant.companyName);
    setRepresentativeName(tenant.representativeName);
    setContact(tenant.contact);
    setBusinessCategory(tenant.businessCategory);
    setCompanySize(tenant.companySize);
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
    };
    
    onUpdateTenant(updatedTenant);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>임차인 정보 수정</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right">사업자등록번호</label>
                <p className="col-span-3 font-mono bg-gray-100 px-3 py-2 rounded-md text-sm">{tenant.businessRegistrationNumber}</p>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="companyName" className="text-right">업체명</label>
                <Input id="companyName" value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="col-span-3" />
                {errors.companyName && <p className="col-start-2 col-span-3 text-red-500 text-xs">{errors.companyName}</p>}
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="repName" className="text-right">대표자명</label>
                <Input id="repName" value={representativeName} onChange={(e) => setRepresentativeName(e.target.value)} className="col-span-3" />
                {errors.representativeName && <p className="col-start-2 col-span-3 text-red-500 text-xs">{errors.representativeName}</p>}
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="contact" className="text-right">연락처</label>
                <Input id="contact" value={contact} onChange={(e) => setContact(e.target.value)} className="col-span-3" />
                {errors.contact && <p className="col-start-2 col-span-3 text-red-500 text-xs">{errors.contact}</p>}
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="companySize" className="text-right">기업 규모</label>
                 <Select onValueChange={(value) => setCompanySize(value as CompanySize)} value={companySize}>
                    <SelectTrigger className="col-span-3">
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
            <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="businessCategory" className="text-right">업종</label>
                <Select onValueChange={(value) => setBusinessCategory(value as BusinessCategory)} value={businessCategory}>
                    <SelectTrigger className="col-span-3">
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
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary">취소</Button>
          </DialogClose>
          <Button type="button" onClick={handleSubmit}>저장</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditTenantDialog;
