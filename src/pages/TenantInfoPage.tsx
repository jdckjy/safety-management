
import React, { useState } from 'react';
import { useProjectData } from '@/providers/ProjectDataProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TenantInfo } from '@/types';
import { TenantInfoDataTable } from '@/components/TenantInfoDataTable';
import { AddTenantInfoModal } from '@/components/AddTenantInfoModal';
import { EditTenantInfoModal } from '@/components/EditTenantInfoModal';

const TenantInfoPage: React.FC = () => {
  const { tenantInfo, setTenantInfo } = useProjectData();
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<TenantInfo | null>(null);

  const handleAddTenant = (newTenant: Omit<TenantInfo, 'id'>) => {
    const newTenantInfo = [
      ...tenantInfo,
      { ...newTenant, id: newTenant.businessRegistrationNumber },
    ];
    setTenantInfo(newTenantInfo);
  };

  const handleEditTenant = (updatedTenant: TenantInfo) => {
    const newTenantInfo = tenantInfo.map((tenant) =>
      tenant.id === updatedTenant.id ? updatedTenant : tenant
    );
    setTenantInfo(newTenantInfo);
    setSelectedTenant(null);
  };

  const handleDeleteTenant = (tenantId: string) => {
    const newTenantInfo = tenantInfo.filter((tenant) => tenant.id !== tenantId);
    setTenantInfo(newTenantInfo);
  };

  const openEditModal = (tenant: TenantInfo) => {
    setSelectedTenant(tenant);
    setEditModalOpen(true);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>임차인 정보</CardTitle>
        <Button onClick={() => setAddModalOpen(true)}>임차인 추가</Button>
      </CardHeader>
      <CardContent>
        <TenantInfoDataTable
          tenantInfo={tenantInfo}
          onEdit={openEditModal}
          onDelete={handleDeleteTenant}
        />
      </CardContent>
      <AddTenantInfoModal
        isOpen={isAddModalOpen}
        onClose={() => setAddModalOpen(false)}
        onAdd={handleAddTenant}
      />
      {selectedTenant && (
        <EditTenantInfoModal
          isOpen={isEditModalOpen}
          onClose={() => setEditModalOpen(false)}
          tenant={selectedTenant}
          onEdit={handleEditTenant}
        />
      )}
    </Card>
  );
};

export default TenantInfoPage;
