
import React, { useState, useMemo } from 'react';
import { useProjectData } from '../providers/ProjectDataProvider';
import { TenantInfo } from '../types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import TenantInfoModal from '@/components/TenantInfoModal';

const TenantManagementPage: React.FC = () => {
  const { tenantInfo, contracts, addTenant } = useProjectData(); // updateTenant 제거, contracts 추가
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<TenantInfo | null>(null);

  const filteredTenants = useMemo(() => {
    if (!Array.isArray(tenantInfo)) return [];
    const lowercasedSearchTerm = searchTerm.toLowerCase();
    return searchTerm
      ? tenantInfo.filter(tenant =>
          tenant && (
            (tenant.businessName || '').toLowerCase().includes(lowercasedSearchTerm) ||
            (tenant.ownerName || '').toLowerCase().includes(lowercasedSearchTerm) // representativeName -> ownerName
          )
        )
      : tenantInfo;
  }, [tenantInfo, searchTerm]);

  const tenantsWithContracts = useMemo(() => {
    const contractTenantIds = new Set<string>();
    if (Array.isArray(contracts)) {
      contracts.forEach(contract => {
        if (contract && contract.tenantId) {
            contractTenantIds.add(contract.tenantId);
        }
      });
    }
    return contractTenantIds;
  }, [contracts]);

  const handleOpenModalForEdit = (tenant: TenantInfo) => {
    setSelectedTenant(tenant);
    setIsModalOpen(true);
  };

  const handleOpenModalForCreate = () => {
    setSelectedTenant(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTenant(null);
  };

  const handleSubmit = (submittedTenant: TenantInfo) => {
    // if (submittedTenant.id && selectedTenant) {
    //   updateTenant(submittedTenant);
    // } else {
      addTenant(submittedTenant);
    // }
    handleCloseModal();
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
      <div className="md:col-span-1 flex flex-col space-y-4">
        <Input
          placeholder="임차인 검색..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Card className="flex-grow">
          <CardHeader>
            <CardTitle>임차인 목록</CardTitle>
          </CardHeader>
          <CardContent className="overflow-y-auto">
            <nav className="flex flex-col space-y-2">
              {(filteredTenants || []).map(tenant => (
                tenant && (
                  <Button
                    key={tenant.id}
                    variant={selectedTenant?.id === tenant.id && isModalOpen ? "secondary" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => handleOpenModalForEdit(tenant)}
                  >
                    <div>
                      <p>{tenant.businessName}</p>
                      <p className={`text-xs ${tenantsWithContracts.has(tenant.id) ? "text-green-500" : "text-gray-400"}`}>
                        {tenantsWithContracts.has(tenant.id) ? "계약 있음" : "계약 없음"}
                      </p>
                    </div>
                  </Button>
                )
              ))}
            </nav>
          </CardContent>
        </Card>
        <Button onClick={handleOpenModalForCreate}>신규 임차인 추가</Button>
      </div>

      <div className="md:col-span-2">
        <TenantInfoModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSubmit={handleSubmit}
          tenant={selectedTenant}
        />
        {!isModalOpen && (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">목록에서 임차인을 선택하거나 새 임차인을 추가하세요.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TenantManagementPage;
