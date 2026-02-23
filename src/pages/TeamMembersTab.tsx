
import React, { useState } from 'react';
import { useAppData } from '../providers/AppDataContext';
import { TeamMember } from '../types';
import { Button } from '../components/ui/button';
import { MemberActionModal } from '../components/MemberActionModal';
import { Plus, MoreVertical, Edit, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog";
import { Card, CardContent } from "../components/ui/card";

export const TeamMembersTab: React.FC = () => {
  const { teamMembers, addTeamMember, updateTeamMember, deleteTeamMember } = useAppData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<string | null>(null);

  const handleAdd = () => {
    setSelectedMember(null);
    setIsModalOpen(true);
  };

  const handleEdit = (member: TeamMember) => {
    setSelectedMember(member);
    setIsModalOpen(true);
  };

  const confirmDelete = (memberId: string) => {
    setMemberToDelete(memberId);
    setIsAlertOpen(true);
  };

  const handleDelete = () => {
    if (memberToDelete) {
      deleteTeamMember(memberToDelete);
      setIsAlertOpen(false);
      setMemberToDelete(null);
    }
  };

  const handleSave = (member: Omit<TeamMember, 'id'> | TeamMember) => {
    if ('id' in member) {
      updateTeamMember(member);
    } else {
      addTeamMember(member);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="p-2 sm:p-4 md:p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
            <h1 className="text-2xl font-bold tracking-tight">팀원 관리</h1>
            <p className="text-gray-500">프로젝트에 참여하는 팀원의 목록입니다.</p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          팀원 추가
        </Button>
      </div>
      
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {teamMembers.map((member) => (
          <Card key={member.id} className="relative overflow-hidden transition-shadow duration-300 hover:shadow-lg">
            <CardContent className="p-4 flex flex-col items-center text-center">
              <div className="relative w-24 h-24 mb-4">
                <img src={member.photo || 'https://via.placeholder.com/150'} alt={member.name} className="rounded-full w-full h-full object-cover" />
              </div>
              <h3 className="font-semibold text-lg">{member.name}</h3>
              <p className="text-sm text-gray-600">{member.position}</p>
              <p className="text-sm text-gray-500 mt-1">{member.phone}</p>
              <div className="absolute top-2 right-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleEdit(member)}>
                      <Edit className="mr-2 h-4 w-4" />
                      <span>수정</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => confirmDelete(member.id)} className="text-red-600">
                      <Trash2 className="mr-2 h-4 w-4" />
                      <span>삭제</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {isModalOpen && (
        <MemberActionModal
          member={selectedMember}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
        />
      )}

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>정말로 삭제하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              이 작업은 되돌릴 수 없습니다. 팀원 정보가 영구적으로 삭제됩니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
