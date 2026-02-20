
import React from 'react';
import {
  LayoutDashboard,
  ShieldCheck,
  Building2,
  Landmark,
  HardHat,
  ChevronDown,
  FolderOpen
} from 'lucide-react';
// [수정] 더 이상 CustomTab 관련 props는 Sidebar가 관리하지 않으므로 타입을 가져올 필요가 없습니다.
import { MenuKey } from '../types';

// [수정] Sidebar가 받아야 할 props를 정리합니다. 동적 탭 관련 로직은 모두 제거됩니다.
interface SidebarProps {
  activeMenu: MenuKey | 'base-info';
  onMenuChange: (menu: MenuKey | 'base-info') => void;
}

// [수정] props에서 customTabs와 onAddTabOpen를 제거합니다.
const Sidebar: React.FC<SidebarProps> = ({ activeMenu, onMenuChange }) => {
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

  const renderMenuItem = (key: string, label: string, icon: React.ReactNode) => {
    const isActive = activeMenu === key;
    return (
      <button
        key={key}
        onClick={() => onMenuChange(key as MenuKey | 'base-info')}
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
        {/* ... 로고 및 프로젝트 이름 ... */}
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

        {/* ====================================================================================== */}
        {/* [핵심 수정] 당신의 지시대로 '공통관리' 섹션을 복원하고 '기본정보' 메뉴만 고정합니다. */}
        {/* ====================================================================================== */}
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
        {/* ... 폴더 관리 ... */}
      </div>
    </div>
  );
};

export default Sidebar;
