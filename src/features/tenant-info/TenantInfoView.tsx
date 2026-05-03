
import React, { useState } from 'react';
import { useProjectData } from '../../providers/ProjectDataProvider';
import TenantInfoList from './TenantInfoList';
import TenantDetail from './TenantDetail';
import { Button } from '../../components/ui/button';
import { PlusCircle } from 'lucide-react';
import AddTenantDialog from './AddTenantDialog'; 
import { TenantInfo } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { AnimatePresence, motion } from 'framer-motion';

const TenantInfoView: React.FC = () => {
  const { tenantInfo, isDataLoaded, addTenant } = useProjectData();
  const [selectedTenantId, setSelectedTenantId] = useState<string | null>(null);
  const [isAddTenantDialogOpen, setIsAddTenantDialogOpen] = useState(false);

  const handleAddTenant = (newTenant: TenantInfo) => {
    addTenant(newTenant);
    setIsAddTenantDialogOpen(false);
    // Add a small delay to allow the dialog to close before switching views
    setTimeout(() => {
        setSelectedTenantId(newTenant.id);
    }, 100);
  };

  const handleBackToList = () => {
    setSelectedTenantId(null);
  }

  if (!isDataLoaded) {
    return <div className="flex items-center justify-center h-full"><p>데이터 로딩 중...</p></div>;
  }
  
  const slideAnimation = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
    transition: { duration: 0.2 }
  };

  return (
    <div className="h-full relative overflow-hidden">
        <AnimatePresence mode="wait">
            {selectedTenantId ? (
                <motion.div
                    key="detail"
                    className="h-full"
                    {...slideAnimation}
                >
                    <TenantDetail 
                        tenantId={selectedTenantId} 
                        onBackToList={handleBackToList}
                    />
                </motion.div>
            ) : (
                <motion.div
                    key="list"
                    className="h-full"
                    {...slideAnimation}
                >
                    {(!tenantInfo || tenantInfo.length === 0) ? (
                         <div className="flex flex-col items-center justify-center h-full text-center p-8">
                            <h3 className="text-xl font-semibold mb-2">등록된 임차인이 없습니다.</h3>
                            <p className="text-gray-500 mb-4">새로운 임차인을 등록하여 관리를 시작하세요.</p>
                            <Button onClick={() => setIsAddTenantDialogOpen(true)}>
                                <PlusCircle className="mr-2 h-4 w-4" />
                                신규 임차인 등록
                            </Button>
                        </div>
                    ) : (
                        <Card className="h-full flex flex-col">
                            <CardHeader className="flex flex-row items-center justify-between p-4">
                                <CardTitle>임차인 목록</CardTitle>
                                <Button variant="outline" size="sm" onClick={() => setIsAddTenantDialogOpen(true)}>
                                    <PlusCircle className="h-4 w-4 mr-2" />
                                    신규 임차인 등록
                                </Button>
                            </CardHeader>
                            <CardContent className="p-0 flex-grow">
                                <TenantInfoList 
                                tenants={tenantInfo}
                                onTenantSelect={setSelectedTenantId} 
                                />
                            </CardContent>
                        </Card>
                    )}
                </motion.div>
            )}
        </AnimatePresence>

        <AddTenantDialog 
            isOpen={isAddTenantDialogOpen}
            onClose={() => setIsAddTenantDialogOpen(false)}
            onAddTenant={handleAddTenant}
        />
    </div>
  );
};

export default TenantInfoView;
