
import React from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { X } from 'lucide-react';

// These types would typically be imported from a central types file
interface VisitorData {
    id: string;
    tenantId: string;
    year: number;
    month: number;
    visitorCount: number;
    remarks: string;
    createdAt: any;
}

interface EnrichedVisitorData extends VisitorData {
    tenantName: string;
}

interface VisitorListSlideOverProps {
  isOpen: boolean;
  onClose: () => void;
  visitors: EnrichedVisitorData[];
  onEdit: (visitor: VisitorData) => void;
  onDelete: (id: string) => void;
}

const VisitorListSlideOver: React.FC<VisitorListSlideOverProps> = ({ isOpen, onClose, visitors, onEdit, onDelete }) => {
  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      {/* Slide-over Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-[50%] bg-white shadow-2xl z-50 p-6 flex flex-col transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h2 className="text-2xl font-bold text-gray-800">이용객 현황 전체보기</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-6 w-6" />
          </Button>
        </div>
        
        <div className="flex-grow overflow-y-auto -mx-6 px-6">
          <Table>
            <TableHeader className="sticky top-0 bg-white z-10">
              <TableRow>
                <TableHead>기관명</TableHead>
                <TableHead>기준연월</TableHead>
                <TableHead>이용객수</TableHead>
                <TableHead>등록일</TableHead>
                <TableHead className="text-right">관리</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visitors.map(d => (
                <TableRow key={d.id}>
                  <TableCell className="font-medium">{d.tenantName}</TableCell>
                  <TableCell>{d.year}-{String(d.month).padStart(2, '0')}</TableCell>
                  <TableCell>{d.visitorCount.toLocaleString()}</TableCell>
                  <TableCell>{d.createdAt?.toDate().toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="link" size="sm" onClick={() => onEdit(d)}>수정</Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="link" size="sm" className="text-red-500">삭제</Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>정말로 삭제하시겠습니까?</AlertDialogTitle>
                          <AlertDialogDescription>
                            이 작업은 되돌릴 수 없습니다. 데이터가 영구적으로 삭제됩니다.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>취소</AlertDialogCancel>
                          <AlertDialogAction onClick={() => onDelete(d.id)}>삭제</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  );
};

export default VisitorListSlideOver;
