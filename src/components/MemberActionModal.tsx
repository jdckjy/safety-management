
import React, { useState, useEffect, useRef } from 'react';
import { TeamMember } from '../types';
import { Button } from './ui/button';
import Modal from './ui/Modal';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Loader2, User } from 'lucide-react';

interface MemberActionModalProps {
  member: TeamMember | null;
  onClose: () => void;
  onSave: (member: Omit<TeamMember, 'id'> | TeamMember) => void;
}

// Helper function to resize and convert image to Base64
const resizeAndEncodeImage = (file: File): Promise<string> => {
  const MAX_WIDTH = 500;
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const scaleSize = MAX_WIDTH / img.width;
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scaleSize;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return reject(new Error('Failed to get canvas context'));
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        const dataUrl = canvas.toDataURL(file.type);
        resolve(dataUrl);
      };
      img.onerror = reject;
      img.src = event.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const MemberActionModal: React.FC<MemberActionModalProps> = ({ member, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [position, setPosition] = useState('');
  const [phone, setPhone] = useState('');
  const [photo, setPhoto] = useState('https://via.placeholder.com/150');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (member) {
      setName(member.name);
      setPosition(member.position);
      setPhone(member.phone);
      setPhoto(member.photo);
    } else {
      setName('');
      setPosition('');
      setPhone('');
      setPhoto('');
    }
  }, [member]);

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      console.log("[TRACE] Starting Base64 conversion and resize...");
      const base64Photo = await resizeAndEncodeImage(file);
      setPhoto(base64Photo);
      console.log("[TRACE] Conversion successful!");
    } catch (error) {
      console.error("Error processing image:", error);
      // Optionally, show an error message to the user
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = () => {
    const memberData = { name, position, phone, photo: photo || '' };
    if (member) {
      onSave({ ...member, ...memberData });
    } else {
      onSave(memberData);
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose} size="md">
      <div className="flex flex-col h-full">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold">{member ? '팀원 정보 수정' : '새 팀원 추가'}</h2>
          <p className="text-sm text-gray-500">팀원의 정보를 입력하거나 수정합니다.</p>
        </div>
        <div className="p-6 flex-grow overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1 flex flex-col items-center space-y-4">
              <div className="relative w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center">
                {isUploading ? (
                  <Loader2 className="animate-spin text-gray-500" size={48} />
                ) : photo ? (
                  <img src={photo} alt={name} className="w-full h-full rounded-full object-cover" />
                ) : (
                  <User className="text-gray-400" size={48} />
                )}
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handlePhotoUpload}
                className="hidden"
                accept="image/*"
              />
              <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                사진 바꾸기
              </Button>
            </div>
            <div className="md:col-span-2 space-y-4">
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="name">성명</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="홍길동" />
              </div>
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="position">직급</Label>
                <Input id="position" value={position} onChange={(e) => setPosition(e.target.value)} placeholder="예: 대리, 과장" />
              </div>
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="phone">연락처</Label>
                <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="010-1234-5678" />
              </div>
            </div>
          </div>
        </div>
        <div className="p-6 flex justify-end space-x-2 bg-gray-50 border-t rounded-b-3xl">
          <Button variant="ghost" onClick={onClose}>취소</Button>
          <Button onClick={handleSubmit} disabled={isUploading}>
            {isUploading ? '처리 중...' : '저장'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
