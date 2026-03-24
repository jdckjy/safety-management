import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Badge } from "./ui/badge";
import { TenantUnit, LeaseRecord } from "../types";
import { useState, useEffect } from 'react';

interface TenantDetailModalProps {
  unit: TenantUnit | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedUnit: TenantUnit) => void;
}

export const TenantDetailModal = ({ unit, isOpen, onClose, onSave }: TenantDetailModalProps) => {
  const [activeTab, setActiveTab] = useState("currentLease");
  const [editableUnit, setEditableUnit] = useState<TenantUnit | null>(null);

  useEffect(() => {
    if (unit) {
      setEditableUnit(JSON.parse(JSON.stringify(unit)));
    } else {
      setEditableUnit(null);
    }
  }, [unit]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editableUnit) return;
    const { name, value } = e.target;
    setEditableUnit({ ...editableUnit, [name]: name === 'rent' || name === 'area' ? Number(value) : value });
  };

  const handleStatusChange = (value: TenantUnit['status']) => {
    if (!editableUnit) return;
    setEditableUnit({ ...editableUnit, status: value });
  };

  const handleSave = () => {
    if (editableUnit) {
      onSave(editableUnit);
    }
  };

  if (!isOpen || !editableUnit) {
    return null;
  }

  const formatCurrency = (amount: number | undefined) => {
    if (typeof amount !== 'number') return '-';
    return new Intl.NumberFormat('ko-KR').format(amount) + '원';
  };
  
  // 이력 데이터를 시간순으로 정렬 (최신이 위로)
  const sortedHistory = editableUnit.leaseHistory?.sort((a, b) => 
    new Date(b.leaseEndDate).getTime() - new Date(a.leaseEndDate).getTime()
  ) || [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>세대 상세 정보: {unit?.name}</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="currentLease" className="w-full">
          <TabsList>
            <TabsTrigger value="currentLease">기본 정보 및 현재 계약</TabsTrigger>
            <TabsTrigger value="leaseHistory">임대 이력</TabsTrigger>
          </TabsList>

          {/* 기본 정보 및 현재 계약 탭 */}
          <TabsContent value="currentLease" className="space-y-4 pt-4">
            {/* ... 기존 기본 정보 폼 ... */}
          </TabsContent>

          {/* 임대 이력 탭 */}
          <TabsContent value="leaseHistory" className="pt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>이전 임차인</TableHead>
                  <TableHead>계약 시작</TableHead>
                  <TableHead>계약 종료</TableHead>
                  <TableHead className="text-right">월 임대료</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedHistory.length > 0 ? (
                  sortedHistory.map((record, index) => (
                    <TableRow key={index}>
                      <TableCell>{record.tenantName}</TableCell>
                      <TableCell>{record.leaseStartDate}</TableCell>
                      <TableCell>{record.leaseEndDate}</TableCell>
                      <TableCell className="text-right">{formatCurrency(record.rent)}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">기록된 임대 이력이 없습니다.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>취소</Button>
          <Button onClick={handleSave}>저장</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
