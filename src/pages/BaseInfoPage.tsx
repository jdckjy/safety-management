
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import ComplexFacilitiesTab from './ComplexFacilitiesTab';
import { Plus } from 'lucide-react';

// 탭의 구조를 정의하는 인터페이스입니다.
interface Tab {
  id: string;
  title: string;
}

const BaseInfoPage: React.FC = () => {
  // [핵심 구현] 동적인 탭 목록을 관리하기 위한 상태입니다.
  // 당신의 요구대로, '단지정보' 탭을 기본값으로 설정합니다.
  const [tabs, setTabs] = useState<Tab[]>([
    { id: 'complex-info-1', title: '단지정보' },
  ]);

  // 현재 활성화된 탭의 ID를 관리하는 상태입니다.
  const [activeTab, setActiveTab] = useState<string>('complex-info-1');

  // 새로운 탭을 추가할 때 고유한 ID를 부여하기 위한 카운터입니다.
  const [nextTabId, setNextTabId] = useState(2);

  // '탭 추가' 버튼을 클릭했을 때 실행되는 함수입니다.
  const addTab = () => {
    const newTabId = `new-tab-${nextTabId}`;
    const newTabs = [...tabs, { id: newTabId, title: `새 탭 ${nextTabId - 1}` }];
    setTabs(newTabs);
    setNextTabId(nextTabId + 1);
    setActiveTab(newTabId); // 새로 추가된 탭을 즉시 활성화합니다.
  };

  return (
    // [수정] 불필요한 제목과 여백을 제거하고, 탭 UI가 화면을 채우도록 합니다.
    <div>
      {/* ================================================================================= */}
      {/* [핵심 구현] 당신이 요청한 동적 탭 시스템입니다.                                 */}
      {/* ================================================================================= */}
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

        {/* 각 탭에 대한 내용을 동적으로 렌더링합니다. */}
        {tabs.map((tab) => (
          <TabsContent key={tab.id} value={tab.id} className="pt-6">
            <ComplexFacilitiesTab />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default BaseInfoPage;
