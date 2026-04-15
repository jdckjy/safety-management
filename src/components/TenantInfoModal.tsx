
import React from 'react';
import { Tenant } from '@/pages/TenantInfoPage';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

interface TenantInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (tenant: Tenant) => void;
  tenant: Tenant | null;
}

const TenantInfoModal: React.FC<TenantInfoModalProps> = ({ isOpen, onClose, onSubmit, tenant }) => {
  const [formData, setFormData] = React.useState<Omit<Tenant, 'id'> | Tenant>(() => {
    return tenant || {
      companyName: '',
      businessRegistrationNumber: '',
      representativeName: '',
      contactPerson: '',
      industryCategory: '의료',
      companySize: '스타트업',
    };
  });

  React.useEffect(() => {
    if (isOpen) {
        setFormData(tenant || {
          companyName: '',
          businessRegistrationNumber: '',
          representativeName: '',
          contactPerson: '',
          industryCategory: '의료',
          companySize: '스타트업',
        });
    }
  }, [isOpen, tenant]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleToggleGroupChange = (name: string, value: string) => {
    if (value) { 
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ ...formData, id: tenant?.id || new Date().toISOString() });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[650px] p-0">
        <DialogHeader className="bg-primary text-primary-foreground px-6 py-4 rounded-t-lg">
          <DialogTitle>{tenant ? '임차인 정보 수정' : '신규 임차인 등록'}</DialogTitle>
          <DialogDescription className="text-primary-foreground/80">
            {tenant ? '임차인의 정보를 수정합니다.' : '새로운 임차인의 기본 정보를 등록합니다.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="px-6 py-8 space-y-6">
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="companyName" className="text-right text-sm text-muted-foreground">업체(기관)명</Label>
              <Input id="companyName" name="companyName" value={formData.companyName} onChange={handleChange} placeholder="예: 스마트헬스케어" className="col-span-2" />
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="businessRegistrationNumber" className="text-right text-sm text-muted-foreground">사업자등록번호</Label>
              <Input id="businessRegistrationNumber" name="businessRegistrationNumber" value={formData.businessRegistrationNumber} onChange={handleChange} placeholder="예: 123-45-67890" className="col-span-2" />
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
                <Label htmlFor="representativeName" className="text-right text-sm text-muted-foreground">대표자명</Label>
                <Input id="representativeName" name="representativeName" value={formData.representativeName} onChange={handleChange} placeholder="예: 김대표" className="col-span-2" />
            </div>
             <div className="grid grid-cols-3 items-center gap-4">
                <Label htmlFor="contactPerson" className="text-right text-sm text-muted-foreground">담당자 연락처</Label>
                <Input id="contactPerson" name="contactPerson" value={formData.contactPerson} onChange={handleChange} placeholder="예: 박담당 (010-1234-5678)" className="col-span-2" />
            </div>

            <div className="grid grid-cols-3 items-center gap-4">
              <Label className="text-right text-sm text-muted-foreground">업종 카테고리</Label>
              <ToggleGroup
                type="single"
                value={formData.industryCategory}
                onValueChange={(value) => handleToggleGroupChange('industryCategory', value)}
                className="col-span-2 flex-wrap justify-start"
              >
                <ToggleGroupItem value="의료">의료</ToggleGroupItem>
                <ToggleGroupItem value="교육">교육</ToggleGroupItem>
                <ToggleGroupItem value="연구">연구</ToggleGroupItem>
                <ToggleGroupItem value="근생">근생</ToggleGroupItem>
                <ToggleGroupItem value="기타">기타</ToggleGroupItem>
              </ToggleGroup>
            </div>

            <div className="grid grid-cols-3 items-center gap-4">
              <Label className="text-right text-sm text-muted-foreground">기업 규모</Label>
              <ToggleGroup
                type="single"
                value={formData.companySize}
                onValueChange={(value) => handleToggleGroupChange('companySize', value)}
                className="col-span-2 flex-wrap justify-start"
              >
                <ToggleGroupItem value="대기업">대기업</ToggleGroupItem>
                <ToggleGroupItem value="중견">중견</ToggleGroupItem>
                <ToggleGroupItem value="중소">중소</ToggleGroupItem>
                <ToggleGroupItem value="스타트업">스타트업</ToggleGroupItem>
              </ToggleGroup>
            </div>
          </div>
          <DialogFooter className="bg-muted/40 px-6 py-4 rounded-b-lg">
            <Button type="button" variant="ghost" onClick={onClose}>취소</Button>
            <Button type="submit">{tenant ? '수정하기' : '저장하기'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TenantInfoModal;
