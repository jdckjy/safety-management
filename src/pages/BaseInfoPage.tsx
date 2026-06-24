
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import ComplexFacilitiesTab from './ComplexFacilitiesTab';
import { TeamMembersTab } from './TeamMembersTab';
import VisitorStatusDashboard from '../components/dashboard/VisitorStatusDashboard'; // Import the new dashboard
import { Plus } from 'lucide-react';

interface Tab {
  id: string;
  title: string;
  isRemovable: boolean;
}

const BaseInfoPage: React.FC = () => {
  const [tabs, setTabs] = useState<Tab[]>([
    { id: 'complex-info', title: '단지정보', isRemovable: false },
    { id: 'team-members', title: '팀원정보', isRemovable: false },
    { id: 'visitor-status', title: '이용객 현황', isRemovable: false }, // Add the new permanent tab
  ]);

  const [activeTab, setActiveTab] = useState<string>('visitor-status'); // Set new tab as active by default
  const [nextTabId, setNextTabId] = useState(1);

  const addTab = () => {
    const newTabId = `new-tab-${nextTabId}`;
    const newTabs = [...tabs, { id: newTabId, title: `새 탭 ${nextTabId}`, isRemovable: true }];
    setTabs(newTabs);
    setNextTabId(nextTabId + 1);
    setActiveTab(newTabId);
  };

  return (
    <div>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex items-center border-b">
          <TabsList className="-mb-px bg-transparent border-0 p-0">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="data-[state=active]:shadow-none data-[state=active]:border-b-black rounded-none border-b-2 border-transparent pb-3 pt-2 text-sm"
              >
                {tab.title}
              </TabsTrigger>
            ))}
          </TabsList>
          <button
            onClick={addTab}
            className="ml-4 p-2 text-gray-500 hover:text-black"
            aria-label="새 탭 추가"
          >
            <Plus size={16} />
          </button>
        </div>

        <TabsContent value="complex-info" className="pt-6">
          <ComplexFacilitiesTab />
        </TabsContent>
        <TabsContent value="team-members" className="pt-6">
          <TeamMembersTab />
        </TabsContent>
        
        {/* Add the content for the new tab */}
        <TabsContent value="visitor-status" className="pt-6">
          <VisitorStatusDashboard />
        </TabsContent>

        {tabs.filter(t => t.isRemovable).map((tab) => (
          <TabsContent key={tab.id} value={tab.id} className="pt-6">
            <p>이것은 동적으로 생성된 탭입니다.</p>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default BaseInfoPage;
