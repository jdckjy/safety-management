
import React, { useState, useEffect } from 'react';
import { TenantInfo, CompanySize, BusinessCategory, AcquisitionChannel } from '../../types';
import { useProjectData } from '../../providers/ProjectDataProvider';
import Modal from '../../components/ui/Modal';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Textarea } from '../../components/ui/textarea';
import { X } from 'lucide-react';

interface TenantInfoEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenantId: string | null;
}

const companySizeOptions: CompanySize[] = ['대기업', '중견', '중소', '스타트업'];
const businessCategoryOptions: BusinessCategory[] = ['의료', '교육', '연구', '근생', '기타'];
const acquisitionChannelOptions: AcquisitionChannel[] = ['직접 유치', '유관기관 소개', '온라인', '기타'];

const TenantInfoEditModal: React.FC<TenantInfoEditModalProps> = ({ isOpen, onClose, tenantId }) => {
  const { tenantInfo, updateTenantInfo } = useProjectData();
  const [formData, setFormData] = useState<Partial<TenantInfo>>({});

  useEffect(() => {
    if (isOpen && tenantId) {
      const currentTenant = tenantInfo.find(t => t.id === tenantId);
      if (currentTenant) {
        setFormData({
          ...currentTenant,
          residentEmployees: currentTenant.residentEmployees || { male: 0, female: 0 },
        });
      } 
    } else {
      // Reset form data when modal is closed or no tenant is selected
      setFormData({});
    }
  }, [isOpen, tenantId, tenantInfo]);

  const handleSave = () => {
    if (formData.id) {
      updateTenantInfo(formData as TenantInfo);
    }
    onClose();
  };

  const handleChange = (field: keyof TenantInfo, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleEmployeeChange = (gender: 'male' | 'female', value: string) => {
    const count = parseInt(value, 10) || 0;
    setFormData(prev => ({
      ...prev,
      residentEmployees: {
        ...(prev.residentEmployees || { male: 0, female: 0 }),
        [gender]: count,
      },
    }));
  };

  if (!isOpen || !tenantId) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl"> {/* <--- 3xl를 2xl로 수정 */}
        <div className="p-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">임차인 정보 수정</h2>
                <Button variant="ghost" size="icon" onClick={onClose}>
                    <X className="h-5 w-5" />
                </Button>
            </div>
        </div>

        <div className="p-6 pt-0 grid gap-6">
            {/* 기본 정보 */}
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

            {/* 성과 및 행정 정보 */}
             <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label>상주 인원</Label>
                    <div className="flex gap-2 items-center">
                        <Label htmlFor="male-employees" className="text-sm font-normal">남</Label>
                        <Input id="male-employees" type="number" className="w-20" value={formData.residentEmployees?.male || 0} onChange={(e) => handleEmployeeChange('male', e.target.value)} />
                        <Label htmlFor="female-employees" className="text-sm font-normal">여</Label>
                        <Input id="female-employees" type="number" className="w-20" value={formData.residentEmployees?.female || 0} onChange={(e) => handleEmployeeChange('female', e.target.value)} />
                    </div>
                </div>
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
            
            <div className="grid gap-2">
                <Label htmlFor="businessDescription">주요 사업 내용</Label>
                <Textarea id="businessDescription" value={formData.businessDescription || ''} onChange={(e) => handleChange('businessDescription', e.target.value)} placeholder="주요 사업 내용 및 비즈니스 모델 요약" />
            </div>

             {/* TODO: 첨부 파일 UI */}

        </div>

        <div className="p-6 flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>취소</Button>
            <Button onClick={handleSave}>저장</Button>
        </div>
    </Modal>
  );
};

export default TenantInfoEditModal;
