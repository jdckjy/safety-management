
import React from 'react';
import { 
  LayoutDashboard, 
  ShieldCheck, 
  Building2, 
  Landmark,
  HardHat,
  Plus,
  Layers,
  Star,
  Clock,
  ChevronDown,
  FolderOpen
} from 'lucide-react';
import { MenuKey, CustomTab } from '../types';

interface SidebarProps {
  activeMenu: MenuKey;
  onMenuChange: (menu: MenuKey) => void;
  customTabs: CustomTab[];
  onAddTabOpen: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeMenu, onMenuChange, customTabs, onAddTabOpen }) => {
  const menuSections = [
    {
      title: '탐색',
      items: [
        { key: 'dashboard', label: '대시보드', icon: <LayoutDashboard size={18} /> },
        { key: 'safety', label: '안전 관리', icon: <ShieldCheck size={18} /> },
        { key: 'lease', label: '임대 및 세대', icon: <Building2 size={18} /> },
        { key: 'asset', label: '자산 가치', icon: <Landmark size={18} /> },
        { key: 'infra', label: '인프라 개발', icon: <HardHat size={18} /> },
      ]
    }
  ];

  return (
    <div className="w-64 h-full flex flex-col py-6 px-4 transition-all duration-300 z-50 bg-[#F8F7F4] border-r border-gray-100">
      <div className="mb-8 flex items-center gap-3 px-4">
        <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-white text-xs font-black">
          C
        </div>
        <div className="flex items-center gap-1 cursor-pointer group">
          <span className="font-bold text-sm tracking-tight">Codename.com</span>
          <ChevronDown size={14} className="text-gray-400 group-hover:text-black transition-colors" />
        </div>
      </div>

      <div className="mb-6 px-2 space-y-1">
        <div className="flex items-center gap-3 px-4 py-2 text-gray-400 hover:text-black cursor-pointer transition-colors">
          <Star size={16} />
          <span className="text-xs font-semibold">즐겨찾기</span>
        </div>
        <div className="flex items-center gap-3 px-4 py-2 text-gray-400 hover:text-black cursor-pointer transition-colors">
          <Clock size={16} />
          <span className="text-xs font-semibold">최근</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide px-2 space-y-8">
        {menuSections.map((section) => (
          <div key={section.title}>
            <div className="flex items-center justify-between px-4 mb-2">
              <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">{section.title}</span>
            </div>
            <div className="space-y-1">
              {section.items.map((item) => {
                const isActive = activeMenu === item.key;
                return (
                  <button
                    key={item.key}
                    onClick={() => onMenuChange(item.key)}
                    className={`w-full flex items-center p-3 rounded-2xl transition-all group ${
                      isActive 
                        ? 'bg-white text-black font-bold shadow-sm ring-1 ring-gray-100' 
                        : 'text-gray-500 hover:text-black hover:bg-white/50'
                    }`}
                  >
                    <span className={`${isActive ? 'text-black' : 'text-gray-400 group-hover:text-black'}`}>
                      {item.icon}
                    </span>
                    <span className="ml-3 text-xs">{item.label}</span>
                    {isActive && <div className="ml-auto w-1 h-4 bg-pink-500 rounded-full"></div>}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        <div>
          <div className="flex items-center justify-between px-4 mb-2">
            <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">공통관리</span>
            <div className="flex items-center">
                <button onClick={onAddTabOpen} className="text-gray-300 hover:text-black transition-colors">
                  <Plus size={14} />
                </button>
                <button className="text-gray-300 hover:text-black transition-colors ml-1">
                  <ChevronDown size={14} />
                </button>
            </div>
          </div>
          <div className="space-y-1">
            {customTabs.map((tab) => {
              const isActive = activeMenu === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => onMenuChange(tab.key)}
                  className={`w-full flex items-center p-3 rounded-2xl transition-all group ${
                    isActive 
                      ? 'bg-white text-black font-bold shadow-sm' 
                      : 'text-gray-500 hover:text-black'
                  }`}
                >
                  <span className="text-gray-400 group-hover:text-black">
                    <FolderOpen size={18} />
                  </span>
                  <span className="ml-3 text-xs">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-auto px-4 py-4">
        <div className="flex items-center gap-3 text-gray-400 hover:text-black cursor-pointer transition-colors text-xs font-semibold">
          <Layers size={16} />
          <span>폴더 관리</span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
