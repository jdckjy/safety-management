
import React from 'react';
import {
  LayoutDashboard,
  ShieldCheck,
  Building2,
  Landmark,
  HardHat,
  ChevronDown,
  FolderOpen,
  Calendar // 1. Calendar 아이콘을 임포트합니다.
} from 'lucide-react';
import { MenuKey } from '../types';

// 2. activeMenu와 onMenuChange의 타입에 'calendar'를 추가합니다.
interface SidebarProps {
  activeMenu: MenuKey | 'base-info' | 'calendar';
  onMenuChange: (menu: MenuKey | 'base-info' | 'calendar') => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeMenu, onMenuChange }) => {
  const menuSections = [
    {
      title: '탐색',
      items: [
        { key: 'dashboard', label: '대시보드', icon: <LayoutDashboard size={18} /> },
        // 3. '대시보드' 다음에 '캘린더' 메뉴 아이템을 추가합니다.
        { key: 'calendar', label: '캘린더', icon: <Calendar size={18} /> },
        { key: 'safety', label: '안전 관리', icon: <ShieldCheck size={18} /> },
        { key: 'lease', label: '임대 및 세대', icon: <Building2 size={18} /> },
        { key: 'asset', label: '자산 가치', icon: <Landmark size={18} /> },
        { key: 'infra', label: '인프라 개발', icon: <HardHat size={18} /> },
      ]
    }
  ];

  const renderMenuItem = (key: string, label: string, icon: React.ReactNode) => {
    const isActive = activeMenu === key;
    return (
      <button
        key={key}
        // 4. onMenuChange 핸들러의 타입 캐스팅을 업데이트합니다.
        onClick={() => onMenuChange(key as MenuKey | 'base-info' | 'calendar')}
        className={`w-full flex items-center p-3 rounded-lg transition-all group ${
          isActive
            ? 'bg-white text-black font-bold shadow-sm ring-1 ring-gray-100'
            : 'text-gray-500 hover:text-black hover:bg-white/50'
        }`}
      >
        <span className={`${isActive ? 'text-black' : 'text-gray-400 group-hover:text-black'}`}>
          {icon}
        </span>
        <span className="ml-3 text-xs">{label}</span>
      </button>
    );
  };

  return (
    <div className="w-64 h-full flex flex-col py-6 px-4 transition-all duration-300 z-50 bg-[#F8F7F4] border-r border-gray-100">
      <div className="mb-8 flex items-center gap-3 px-4">
        <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-white text-xs font-black">C</div>
        <div className="flex items-center gap-1 cursor-pointer group">
          <span className="font-bold text-sm tracking-tight">Codename.com</span>
          <ChevronDown size={14} className="text-gray-400 group-hover:text-black transition-colors" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide px-2 space-y-8">
        {menuSections.map((section) => (
          <div key={section.title}>
            <div className="px-4 mb-2">
              <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">{section.title}</span>
            </div>
            <div className="space-y-1">
              {section.items.map((item) => renderMenuItem(item.key, item.label, item.icon))}
            </div>
          </div>
        ))}

        <div>
          <div className="px-4 mb-2">
            <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">공통관리</span>
          </div>
          <div className="space-y-1">
            {renderMenuItem('base-info', '기본정보', <FolderOpen size={18} />)}
          </div>
        </div>
      </div>

      <div className="mt-auto px-4 py-4">
      </div>
    </div>
  );
};

export default Sidebar;
