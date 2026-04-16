
import React, { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Textarea } from '../../components/ui/textarea';
import { useProjectData } from '../../providers/ProjectDataProvider';
import { TenantInfo, CompanySize, BusinessCategory, AcquisitionChannel } from '../../types';

interface AddTenantDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTenant: (newTenant: TenantInfo) => void;
}

const AddTenantDialog: React.FC<AddTenantDialogProps> = ({ isOpen, onClose, onAddTenant }) => {
  const [companyName, setCompanyName] = useState('');
  const [businessRegistrationNumber, setBusinessRegistrationNumber] = useState('');
  const [representativeName, setRepresentativeName] = useState('');
  const [contact, setContact] = useState('');
  const [businessCategory, setBusinessCategory] = useState<BusinessCategory>('기타');
  const [companySize, setCompanySize] = useState<CompanySize>('중소');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const { tenantInfo } = useProjectData();

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!companyName) newErrors.companyName = '업체명은 필수입니다.';
    if (!businessRegistrationNumber) {
      newErrors.businessRegistrationNumber = '사업자등록번호는 필수입니다.';
    } else if (!/^\d{3}-\d{2}-\d{5}$/.test(businessRegistrationNumber)) {
        newErrors.businessRegistrationNumber = '사업자등록번호 형식이 올바르지 않습니다. (예: 123-45-67890)';
    } else if (tenantInfo.some(t => t.businessRegistrationNumber === businessRegistrationNumber)) {
        newErrors.businessRegistrationNumber = '이미 등록된 사업자등록번호입니다.';
    }
    if (!representativeName) newErrors.representativeName = '대표자명은 필수입니다.';
    if (!contact) newErrors.contact = '연락처는 필수입니다.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    const newTenant: TenantInfo = {
      id: businessRegistrationNumber, // 사업자등록번호를 ID로 사용
      companyName,
      businessRegistrationNumber,
      representativeName,
      contact,
      businessCategory,
      companySize,
    };
    
    onAddTenant(newTenant);
    onClose(); // 성공 시 폼 닫기
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>신규 임차인 등록</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="companyName" className="text-right">업체명</label>
                <Input id="companyName" value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="col-span-3" />
                {errors.companyName && <p className="col-start-2 col-span-3 text-red-500 text-xs">{errors.companyName}</p>}
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="brn" className="text-right">사업자등록번호</label>
                <Input id="brn" value={businessRegistrationNumber} onChange={(e) => setBusinessRegistrationNumber(e.target.value)} placeholder="123-45-67890" className="col-span-3" />
                {errors.businessRegistrationNumber && <p className="col-start-2 col-span-3 text-red-500 text-xs">{errors.businessRegistrationNumber}</p>}
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
                 <Select onValueChange={(value) => setCompanySize(value as CompanySize)} defaultValue={companySize}>
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
                <Select onValueChange={(value) => setBusinessCategory(value as BusinessCategory)} defaultValue={businessCategory}>
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

export default AddTenantDialog;
