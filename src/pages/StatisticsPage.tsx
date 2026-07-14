
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Plus } from 'lucide-react';
import PopulationInfoTab from './PopulationInfoTab';
import SmartAttractionTab from './SmartAttractionTab'; // 새로 추가

interface Tab {
  id: string;
  title: string;
  isRemovable: boolean;
}

const StatisticsPage: React.FC = () => {
  const [tabs, setTabs] = useState<Tab[]>([
    { id: 'population-info', title: '인구정보', isRemovable: false },
  ]);

  const [activeTab, setActiveTab] = useState<string>('population-info');

  const addTab = () => {
    const newTabId = `smart-attraction-tab`;
    if (tabs.find(tab => tab.id === newTabId)) {
      setActiveTab(newTabId);
      return;
    }

    const newTabs = [...tabs, { id: newTabId, title: `스마트 유치`, isRemovable: true }];
    setTabs(newTabs);
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

        <TabsContent value="population-info" className="pt-6">
          <PopulationInfoTab />
        </TabsContent>

        <TabsContent value="smart-attraction-tab" className="pt-6">
          <SmartAttractionTab />
        </TabsContent>
        
      </Tabs>
    </div>
  );
};

export default StatisticsPage;
