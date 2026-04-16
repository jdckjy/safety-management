
import React from 'react';
import { Button } from '../../components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '../../components/ui/dialog';

interface DeleteTenantDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  tenantName: string;
}

const DeleteTenantDialog: React.FC<DeleteTenantDialogProps> = ({ isOpen, onClose, onConfirm, tenantName }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>임차인 삭제 확인</DialogTitle>
          <DialogDescription className="pt-2">
            정말로 '<strong>{tenantName}</strong>' 임차인 정보를 삭제하시겠습니까? 이 작업은 되돌릴 수 없으며, 관련된 모든 계약 및 서류 정보도 함께 삭제됩니다.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary">취소</Button>
          </DialogClose>
          <Button variant="destructive" onClick={onConfirm}>삭제</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteTenantDialog;
