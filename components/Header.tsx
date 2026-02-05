
import React, { useMemo } from 'react';
import { Search, Bell, ChevronDown, Calendar, Menu } from 'lucide-react';
import { useData } from '../contexts/DataContext'; // Import useData hook

const Header: React.FC = () => {
  // All props are now gone, we get everything from the context
  const { customTabs, selectedMonth, setSelectedMonth } = useData();
  
  // This state can be local to the Header or derived from a global state if needed
  const [activeMenu, setActiveMenu] = React.useState('dashboard');

  const getTitle = () => {
    if (activeMenu === 'dashboard') return '대시보드';
    if (activeMenu === 'safety') return '안전 관리';
    if (activeMenu === 'lease') return '임대 및 세대 관리';
    if (activeMenu === 'asset') return '자산 가치 관리';
    if (activeMenu === 'infra') return '인프라 개발';
    
    const custom = customTabs.find(t => t.key === activeMenu);
    return custom ? custom.label : '대시보드';
  };

  const months = useMemo(() => 
    Array.from({length: 12}, (_, i) => new Date(0, i).toLocaleString('ko-KR', {month: 'long'}))
  , []);

  return (
    <header className="flex items-center justify-between w-full">
      <div className="flex items-center gap-4">
        <button className="p-2.5 bg-white rounded-2xl shadow-sm border border-gray-100 lg:hidden">
            <Menu size={20}/>
        </button>
        <h1 className="text-3xl font-black text-[#1A1D1F] tracking-tighter">{getTitle()}</h1>
      </div>
      <div className="flex items-center gap-4">
        <div className="relative hidden md:block">
          <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search..." className="w-full max-w-xs pl-12 pr-4 py-3 bg-white rounded-2xl text-sm font-bold border border-gray-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-black" />
        </div>
        
        <div className="flex items-center gap-2 bg-white pl-5 pr-3 py-2 rounded-2xl shadow-sm border border-gray-100">
          <Calendar size={18} className="text-gray-400"/>
          <select 
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="bg-transparent text-sm font-bold text-gray-800 outline-none appearance-none pr-6"
          >
            {months.map((m, i) => (
              <option key={i} value={i}>{m}</option>
            ))}
          </select>
           <ChevronDown size={16} className="text-gray-400 -ml-5 pointer-events-none"/>
        </div>
        
        <button className="p-3.5 bg-white rounded-2xl shadow-sm border border-gray-100">
          <Bell size={20} />
        </button>
        <div className="flex items-center gap-3">
            <img src="https://i.pravatar.cc/40?u=a042581f4e29026704d" alt="user" className="w-10 h-10 rounded-full border-2 border-white shadow-md" />
            <div>
                <p className="text-sm font-bold">김프로</p>
                <p className="text-xs text-gray-400 font-bold">Project Manager</p>
            </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
