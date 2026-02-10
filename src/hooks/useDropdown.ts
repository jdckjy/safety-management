import { useState, useRef, useEffect, useCallback } from 'react';

/**
 * 드롭다운 UI의 상태 및 외부 클릭 감지를 처리하는 커스텀 훅
 * @returns { isOpen, toggle, close, dropdownRef }
 */
export const useDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggle = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        close();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [close]);

  return { isOpen, toggle, close, dropdownRef };
};
