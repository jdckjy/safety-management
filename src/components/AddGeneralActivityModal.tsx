
import React, { useState } from 'react';
import { useProjectData } from '../providers/ProjectDataProvider';
import { GeneralActivity } from '../types';
import Modal from './ui/Modal';
// 1. 프로젝트의 고품질 UI 컴포넌트를 대거 임포트합니다.
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';

interface AddGeneralActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: string; 
}

const AddGeneralActivityModal: React.FC<AddGeneralActivityModalProps> = ({ isOpen, onClose, selectedDate }) => {
  const { addGeneralActivity } = useProjectData();
  const [name, setName] = useState('');
  const [category, setCategory] = useState<'일반' | '회의' | '마감일' | '개인'>('일반');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('활동 이름을 입력해주세요.');
      return;
    }
    addGeneralActivity({ name: name.trim(), date: selectedDate, category, description: description.trim() });
    handleClose();
  };

  const handleClose = () => {
    setName('');
    setCategory('일반');
    setDescription('');
    onClose();
  };

  // Select 컴포넌트의 값 변경을 처리하는 핸들러입니다.
  const handleCategoryChange = (value: '일반' | '회의' | '마감일' | '개인') => {
    setCategory(value);
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <div className="p-1"> {/* 전체적인 여백을 추가합니다 */}
        <h2 className="text-lg font-semibold text-gray-900 mb-5">새 활동 추가</h2>
        {/* 2. form 태그 대신 div로 구조를 잡고, submit 핸들러는 저장 버튼으로 옮깁니다. */}
        <div className="space-y-4">
          {/* 3. Label, Input 등 프로젝트 UI 컴포넌트를 사용하여 입력 필드를 재구성합니다. */}
          <div className="space-y-2">
            <Label htmlFor="activity-name">활동 이름</Label>
            <Input
              id="activity-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="예: 주간 팀 회의"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="activity-date">날짜</Label>
            <Input
              id="activity-date"
              value={selectedDate}
              readOnly
              className="bg-gray-100 dark:bg-gray-700" // 읽기 전용 필드 스타일을 명확히 합니다.
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="activity-category">카테고리</Label>
            <Select onValueChange={handleCategoryChange} value={category}>
              <SelectTrigger id="activity-category">
                <SelectValue placeholder="카테고리를 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="일반">일반</SelectItem>
                <SelectItem value="회의">회의</SelectItem>
                <SelectItem value="마감일">마감일</SelectItem>
                <SelectItem value="개인">개인</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="activity-description">설명 (선택)</Label>
            <Textarea
              id="activity-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="활동에 대한 상세 설명을 입력하세요."
              rows={3}
            />
          </div>
          {/* 4. Button 컴포넌트를 사용하여 하단 버튼 영역을 다른 모달과 통일합니다. */}
          <div className="flex justify-end space-x-2 pt-5">
            <Button type="button" variant="outline" onClick={handleClose}>취소</Button>
            <Button type="button" onClick={handleSubmit}>저장</Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default AddGeneralActivityModal;
