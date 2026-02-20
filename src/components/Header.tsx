
import React, { useMemo, useEffect, useState } from 'react';
import { Search, Bell, ChevronDown, Calendar, Menu, LogOut, X } from 'lucide-react';
// [수정] 더 이상 전역 customTabs를 사용하지 않으므로, useAppData에서 해당 부분을 가져오지 않습니다.
import { useAppData } from '../providers/AppDataContext';
import { useAuth } from '../features/auth/AuthContext';
import { useDropdown } from '../hooks/useDropdown';
import { useNotifications } from '../providers/NotificationProvider';
import { useSearch } from '../providers/SearchProvider';
import NotificationDropdown from './NotificationDropdown';
import GlobalSearchResults from './GlobalSearchResults';

interface HeaderProps {
  activeMenu: string;
}

const Header: React.FC<HeaderProps> = ({ activeMenu }) => {
  // [수정] customTabs를 제거합니다.
  const { navigationState, setSelectedMonth } = useAppData();
  const { currentUser, logout } = useAuth();
  const { isOpen: isNotificationOpen, toggle: toggleNotification, close: closeNotification, dropdownRef: notificationRef } = useDropdown();
  const { unreadCount } = useNotifications();

  const { query, search, clear } = useSearch();
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const { isOpen: isSearchResultsOpen, close: closeSearchResults, dropdownRef: searchRef } = useDropdown();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    search(e.target.value);
  };

  useEffect(() => {
    if (!query) {
      closeSearchResults();
    }
  }, [query, closeSearchResults]);

  // [핵심 수정] getTitle 함수를 당신의 요구사항에 맞게 재구성합니다.
  const getTitle = () => {
    if (activeMenu === 'dashboard') return '';
    // 당신의 지시대로, 'base-info' 페이지에서는 제목을 표시하지 않습니다.
    if (activeMenu === 'base-info') return '';
    if (activeMenu === 'safety') return '안전 관리';
    if (activeMenu === 'lease') return '임대 및 세대 관리';
    if (activeMenu === 'asset') return '자산 가치 관리';
    if (activeMenu === 'infra') return '인프라 개발';

    // 이전의 잘못된 custom tab 관련 로직을 모두 제거합니다.
    return '';
  };

  const getDisplayName = () => {
    if (currentUser) {
      const emailName = currentUser.email?.split('@')[0];
      return emailName ? emailName.charAt(0).toUpperCase() + emailName.slice(1) : "김프로";
    }
    return "김프로";
  };

  const months = useMemo(() =>
    Array.from({ length: 12 }, (_, i) => new Date(0, i).toLocaleString('ko-KR', { month: 'long' }))
    , []);

  return (
    <header className="flex items-center justify-between w-full">
      <div className="flex items-center gap-4">
        <button className="p-2.5 bg-white rounded-2xl shadow-sm border border-gray-100 lg-hidden">
          <Menu size={20} />
        </button>
        {getTitle() && <h1 className="text-3xl font-black text-[#1A1D1F] tracking-tighter">{getTitle()}</h1>}
      </div>
      <div className="flex items-center gap-4">
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
          <Calendar size={18} className="text-gray-400" />
          <select
            value={navigationState.selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            className="bg-transparent text-sm font-bold text-gray-800 outline-none appearance-none pr-6"
          >
            {months.map((m, i) => (
              <option key={i} value={i}>{m}</option>
            ))}
          </select>
          <ChevronDown size={16} className="text-gray-400 -ml-5 pointer-events-none" />
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
