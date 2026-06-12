
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Badge } from "./ui/badge";
import { TenantUnit } from "../pages/LeaseTenantPage";
import { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';

interface TenantDetailModalProps {
  unit: TenantUnit | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedUnit: TenantUnit) => void;
}

export const TenantDetailModal = ({ unit, isOpen, onClose, onSave }: TenantDetailModalProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editableUnit, setEditableUnit] = useState<TenantUnit | null>(null);

  useEffect(() => {
    if (unit) {
      setEditableUnit(JSON.parse(JSON.stringify(unit)));
    } else {
      setEditableUnit(null);
    }
    setIsEditing(false); // Reset editing state when unit changes or modal opens
  }, [unit, isOpen]);

  const handleUnitInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editableUnit) return;
    const { name, value } = e.target;
    setEditableUnit({ ...editableUnit, [name]: name === 'rent' || name === 'area_sqm' ? Number(value) : value });
  };

  const handleTenantInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editableUnit || !editableUnit.tenantInfo) return;
    const { name, value } = e.target;
    const updatedTenantInfo = { ...editableUnit.tenantInfo, [name]: value };
    setEditableUnit({ ...editableUnit, tenantInfo: updatedTenantInfo });
  };

  const handleSave = () => {
    if (editableUnit) {
      onSave(editableUnit);
      setIsEditing(false);
    }
  };

  if (!isOpen || !editableUnit) {
    return null;
  }

  const formatCurrency = (amount: number | null | undefined) => {
    if (typeof amount !== 'number') return '-';
    return new Intl.NumberFormat('ko-KR').format(amount) + '원';
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return '-';
    try {
      return format(parseISO(dateString), 'yyyy-MM-dd');
    } catch (error) {
      return dateString; // Return original if parsing fails
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full">
        <DialogHeader>
          <DialogTitle>세대 상세 정보: {unit?.name}</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="basicInfo" className="w-full">
          <TabsList>
            <TabsTrigger value="basicInfo">기본 정보</TabsTrigger>
            <TabsTrigger value="contractInfo">계약 현황</TabsTrigger>
            <TabsTrigger value="documents">서류 관리</TabsTrigger>
          </TabsList>

          <TabsContent value="basicInfo" className="space-y-6 pt-6">
            <div className="flex items-center justify-between">
                <h4 className="font-semibold text-slate-800">기본 정보</h4>
                <Button variant="outline" size="sm" onClick={() => setIsEditing(!isEditing)} disabled={!editableUnit.tenantInfo}>
                    {isEditing ? '수정 취소' : '수정'}
                </Button>
            </div>
            {editableUnit.tenantInfo ? (
                <div className="grid grid-cols-2 gap-x-6 gap-y-5 text-sm">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-slate-500 font-medium">업체(기관)명</label>
                        {isEditing ? (
                            <Input name="businessName" value={editableUnit.tenantInfo.businessName || ''} onChange={handleTenantInfoChange} />
                        ) : (
                            <span className="font-semibold text-slate-900 h-9 flex items-center">{editableUnit.tenantInfo.businessName || '-'}</span>
                        )}
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-slate-500 font-medium">대표자명</label>
                        {isEditing ? (
                            <Input name="representativeName" value={editableUnit.tenantInfo.representativeName || ''} onChange={handleTenantInfoChange} />
                        ) : (
                            <span className="font-semibold text-slate-900 h-9 flex items-center">{editableUnit.tenantInfo.representativeName || '-'}</span>
                        )}
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-slate-500 font-medium">담당자 연락처</label>
                        {isEditing ? (
                            <Input name="contact" value={editableUnit.tenantInfo.contact || ''} onChange={handleTenantInfoChange} />
                        ) : (
                            <span className="font-semibold text-slate-900 h-9 flex items-center">{editableUnit.tenantInfo.contact || '-'}</span>
                        )}
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-slate-500 font-medium">업종 카테고리</label>
                        {isEditing ? (
                            <Input name="businessCategory" value={editableUnit.tenantInfo.businessCategory || ''} onChange={handleTenantInfoChange} />
                        ) : (
                            <span className="font-semibold text-slate-900 h-9 flex items-center">{editableUnit.tenantInfo.businessCategory || '-'}</span>
                        )}
                    </div>
                </div>
            ) : (
                <div className="flex items-center justify-center h-24 bg-slate-50 rounded-md">
                    <p className="text-slate-500">현재 계약된 임차인 정보가 없습니다.</p>
                </div>
            )}
          </TabsContent>

          <TabsContent value="contractInfo" className="pt-6">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>상태</TableHead>
                        <TableHead>계약 시작일</TableHead>
                        <TableHead>계약 종료일</TableHead>
                        <TableHead className="text-right">월 임대료</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {editableUnit.contract ? (
                        <TableRow>
                            <TableCell><Badge variant={editableUnit.status === '임대중' ? 'default' : 'secondary'}>{editableUnit.status}</Badge></TableCell>
                            <TableCell>{formatDate(editableUnit.contract.startDate)}</TableCell>
                            <TableCell>{formatDate(editableUnit.contract.endDate)}</TableCell>
                            <TableCell className="text-right font-semibold">{formatCurrency(editableUnit.contract.rent)}</TableCell>
                        </TableRow>
                    ) : (
                        <TableRow>
                            <TableCell colSpan={4} className="h-24 text-center">계약 정보가 없습니다.</TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
          </TabsContent>

          <TabsContent value="documents" className="pt-6">
              <div className="flex items-center justify-center h-40 border-2 border-dashed border-slate-200 rounded-lg">
                  <p className="text-sm text-slate-500">서류 관리 기능은 현재 준비 중입니다.</p>
              </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="pt-4">
          <Button variant="outline" onClick={onClose}>취소</Button>
          <Button onClick={handleSave} disabled={!isEditing}>변경사항 저장</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
