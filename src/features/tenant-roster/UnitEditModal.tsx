
import React, { useState, useEffect, useMemo } from 'react';
import { Unit, Contract, TenantInfo } from '../../types';
import { useProjectData } from '../../providers/ProjectDataProvider';
import Modal from '../../components/ui/Modal';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Textarea } from '../../components/ui/textarea';
import { X } from 'lucide-react';

interface UnitEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (unit: Partial<Unit>, contract?: Partial<Contract>) => void;
  unit: Partial<Unit> | null;
  floor: string;
  tenantInfo: TenantInfo[];
}

const NO_TENANT_VALUE = '__NONE__';

const UnitEditModal: React.FC<UnitEditModalProps> = ({ isOpen, onClose, onSave, unit, floor, tenantInfo }) => {
  const [unitData, setUnitData] = useState<Partial<Unit>>({});
  const [contractData, setContractData] = useState<Partial<Contract>>({});
  const [selectedTenantId, setSelectedTenantId] = useState<string>(NO_TENANT_VALUE);

  useEffect(() => {
    if (isOpen) {
      if (unit) {
        setUnitData(unit);
        // Note: This modal doesn't directly edit contracts, but prepares data.
        // We could fetch the existing contract if needed, but for now, we'll start fresh
        // or assume the parent component handles merging.
        setContractData({ unitId: unit.id }); 
        setSelectedTenantId(NO_TENANT_VALUE);
      } else {
        // For new units
        setUnitData({ floor: floor, name: '', area_sqm: 0 });
        setContractData({});
        setSelectedTenantId(NO_TENANT_VALUE);
      }
    } else {
      // Reset on close
      setUnitData({});
      setContractData({});
      setSelectedTenantId(NO_TENANT_VALUE);
    }
  }, [isOpen, unit, floor]);

  const handleUnitChange = (field: keyof Unit, value: any) => {
    setUnitData(prev => ({ ...prev, [field]: value }));
  };

  const handleContractChange = (field: keyof Contract, value: any) => {
    setContractData(prev => ({ ...prev, [field]: value }));
  };

  const handleTenantChange = (tenantId: string) => {
    setSelectedTenantId(tenantId);
    if (tenantId === NO_TENANT_VALUE) {
      setContractData(prev => ({ ...prev, tenantId: undefined }));
    } else {
      setContractData(prev => ({ ...prev, tenantId }));
    }
  };

  const isSaveDisabled = useMemo(() => {
    return !unitData.name || unitData.name.trim() === '';
  }, [unitData.name]);

  const handleSave = () => {
    // Only include contract data if a tenant is selected
    const contractToSave = selectedTenantId !== NO_TENANT_VALUE ? contractData : undefined;
    onSave(unitData, contractToSave);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl">
      <div className="p-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">{unit ? "호실 정보 수정" : "신규 호실 추가"}</h2>
          <Button variant="ghost" size="icon" onClick={onClose}><X className="h-5 w-5" /></Button>
        </div>
      </div>

      <div className="p-6 pt-0 grid gap-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="name">호실명</Label>
            <Input id="name" value={unitData.name || ''} onChange={(e) => handleUnitChange('name', e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="area">면적(m²)</Label>
            <Input id="area" type="number" value={unitData.area_sqm || 0} onChange={(e) => handleUnitChange('area_sqm', parseFloat(e.target.value))} />
          </div>
        </div>
        
        <div className="grid gap-2">
          <Label>임차인 (선택)</Label>
          <Select value={selectedTenantId} onValueChange={handleTenantChange}>
            <SelectTrigger><SelectValue placeholder="임차인을 선택하세요" /></SelectTrigger>
            <SelectContent>
              <SelectItem value={NO_TENANT_VALUE}>없음 (공실)</SelectItem>
              {tenantInfo.map((info) => (
                <SelectItem key={info.id} value={info.id}>
                  {info.companyName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedTenantId !== NO_TENANT_VALUE && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="rent">월임대료</Label>
                <Input id="rent" type="number" value={contractData.monthlyRent || 0} onChange={(e) => handleContractChange('monthlyRent', parseInt(e.target.value, 10) || 0)} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="deposit">보증금</Label>
                <Input id="deposit" type="number" value={contractData.deposit || 0} onChange={(e) => handleContractChange('deposit', parseInt(e.target.value, 10) || 0)} />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="contractDate">계약일</Label>
                <Input id="contractDate" type="date" value={contractData.startDate || ''} onChange={(e) => handleContractChange('startDate', e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="moveInDate">입주일</Label>
                <Input id="moveInDate" type="date" value={contractData.moveInDate || ''} onChange={(e) => handleContractChange('moveInDate', e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="moveOutDate">만기일</Label>
                <Input id="moveOutDate" type="date" value={contractData.endDate || ''} onChange={(e) => handleContractChange('endDate', e.target.value)} />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="remarks">비고</Label>
              <Textarea 
                  id="remarks"
                  value={contractData.remarks || ''}
                  onChange={(e) => handleContractChange('remarks', e.target.value)}
                  placeholder="특약 사항이나 민원 이력 등 정형화하기 어려운 내용을 입력하세요."
              />
            </div>
          </>
        )}
      </div>

      <div className="p-6 flex justify-end gap-2">
        <Button variant="outline" onClick={onClose}>취소</Button>
        <Button onClick={handleSave} disabled={isSaveDisabled}>저장</Button>
      </div>
    </Modal>
  );
};

export default UnitEditModal;
