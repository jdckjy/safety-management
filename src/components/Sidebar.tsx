
import React from 'react';
import {
  LayoutDashboard,
  ShieldCheck,
  Building2,
  Landmark,
  HardHat,
  ChevronDown,
  FolderOpen,
  Calendar,
  BarChart
} from 'lucide-react';
import { MenuKey } from '../types';
import logo from '../assets/logo.png';

interface SidebarProps {
  activeMenu: MenuKey;
  onMenuChange: (menu: MenuKey) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeMenu, onMenuChange }) => {
  const menuSections = [
    {
      title: '탐색',
      items: [
        { key: 'dashboard', label: '대시보드', icon: <LayoutDashboard size={18} /> },
        { key: 'calendar', label: '캘린더', icon: <Calendar size={18} /> },
        { key: 'safety', label: '안전 관리', icon: <ShieldCheck size={18} /> },
        { key: 'lease', label: '임대 및 세대', icon: <Building2 size={18} /> },
        { key: 'asset', label: '자산 가치', icon: <Landmark size={18} /> },
        { key: 'infra', label: '인프라 개발', icon: <HardHat size={18} /> },
      ]
    }
  ];

  const renderMenuItem = (key: MenuKey, label: string, icon: React.ReactNode) => {
    const isActive = activeMenu === key;
    return (
      <button
        key={key}
        onClick={() => onMenuChange(key)}
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
       <div className="mb-8 px-2">
        <button 
          onClick={() => onMenuChange('dashboard')} 
          className="w-full flex justify-center items-center rounded-lg transition-colors"
        >
          <img src={logo} alt="H-Town Management Logo" className="w-full h-auto" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide px-2 space-y-8">
        {menuSections.map((section) => (
          <div key={section.title}>
            <div className="px-4 mb-2">
              <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">{section.title}</span>
            </div>
            <div className="space-y-1">
              {section.items.map((item) => renderMenuItem(item.key as MenuKey, item.label, item.icon))}
            </div>
          </div>
        ))}

        <div>
          <div className="px-4 mb-2">
            <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">공통관리</span>
          </div>
          <div className="space-y-1">
            {renderMenuItem('base-info', '기본정보', <FolderOpen size={18} />)}
            {renderMenuItem('statistics', '통계정보', <BarChart size={18} />)}
          </div>
        </div>
      </div>

      <div className="mt-auto px-4 py-4">
      </div>
    </div>
  );
};

export default Sidebar;
