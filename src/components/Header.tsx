
import React, { useMemo, useEffect, useState } from 'react';
import { Search, Bell, ChevronDown, Calendar, Menu, LogOut, X } from 'lucide-react';
import { useAppData } from '../providers/AppDataContext';
import { useAuth } from '../features/auth/AuthContext';
import { useDropdown } from '../hooks/useDropdown';
import { useNotifications } from '../providers/NotificationProvider';
import { useSearch } from '../providers/SearchProvider'; // 1. useSearch 훅 임포트
import NotificationDropdown from './NotificationDropdown';
import GlobalSearchResults from './GlobalSearchResults'; // 2. GlobalSearchResults 컴포넌트 임포트

const Header: React.FC = () => {
  const { customTabs, selectedMonth, setSelectedMonth } = useAppData();
  const { currentUser, logout } = useAuth(); 
  const { isOpen: isNotificationOpen, toggle: toggleNotification, close: closeNotification, dropdownRef: notificationRef } = useDropdown();
  const { unreadCount } = useNotifications();
  
  // 3. 검색 관련 훅과 상태 관리 추가
  const { query, search, clear } = useSearch();
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const { isOpen: isSearchResultsOpen, close: closeSearchResults, dropdownRef: searchRef } = useDropdown();

  const [activeMenu, setActiveMenu] = React.useState('dashboard');

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      search(e.target.value);
  };

  // 검색어가 있을 때만 검색 결과 창을 보여주도록 처리
  useEffect(() => {
    if (!query) {
      closeSearchResults();
    }
  }, [query, closeSearchResults]);

  const getTitle = () => {
    if (activeMenu === 'dashboard') return '대시보드';
    if (activeMenu === 'safety') return '안전 관리';
    if (activeMenu === 'lease') return '임대 및 세대 관리';
    if (activeMenu === 'asset') return '자산 가치 관리';
    if (activeMenu === 'infra') return '인프라 개발';
    const custom = customTabs.find(t => t.key === activeMenu);
    return custom ? custom.label : '대시보드';
  };
  
  const getDisplayName = () => {
    if (currentUser) {
      const emailName = currentUser.email?.split('@')[0];
      return emailName ? emailName.charAt(0).toUpperCase() + emailName.slice(1) : "김프로";
    }
    return "김프로";
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
        
        {/* 4. 전역 검색 UI 및 로직 연결 */}
        <div className="relative hidden md:block" ref={searchRef}>
          <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input 
            type="text" 
            placeholder="전체 검색..." 
            value={query}
            onChange={handleSearchChange}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            className="w-full max-w-xs pl-12 pr-10 py-3 bg-white rounded-2xl text-sm font-bold border border-gray-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-black" 
          />
          {query && (
            <button onClick={clear} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X size={18} />
            </button>
          )}
          {(isSearchFocused || isSearchResultsOpen) && <GlobalSearchResults />}
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
        
        <div className="relative" ref={notificationRef}>
          <button 
            onClick={toggleNotification}
            className="p-3.5 bg-white rounded-2xl shadow-sm border border-gray-100 relative"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                {unreadCount}
              </span>
            )}
          </button>
          {isNotificationOpen && <NotificationDropdown onClose={closeNotification} />}
        </div>

        <div className="flex items-center gap-3">
            <img src={`https://i.pravatar.cc/40?u=${currentUser?.uid || 'default'}`} alt="user" className="w-10 h-10 rounded-full border-2 border-white shadow-md" />
            <div>
                <p className="text-sm font-bold">{getDisplayName()}</p> 
                <p className="text-xs text-gray-400 font-bold">Project Manager</p>
            </div>
            <button 
              onClick={logout}
              className="p-2 rounded-full hover:bg-red-100 text-gray-500 hover:text-red-600 transition-colors"
              aria-label="로그아웃"
            >
              <LogOut size={20} />
            </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
