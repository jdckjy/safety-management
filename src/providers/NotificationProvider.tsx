
import React, { createContext, useContext, useState, useMemo } from 'react';
import { Bell } from 'lucide-react';

// 1. 알림 데이터 타입 정의
interface Notification {
  id: string;
  type: 'new_task' | 'due_date' | 'comment';
  message: string;
  timestamp: string;
  read: boolean;
}

// 2. 목업 데이터
const mockNotifications: Notification[] = [
    {
        id: '1',
        type: 'new_task',
        message: "'안전교육 계획 수립' 업무가 할당되었습니다.",
        timestamp: '15분 전',
        read: false,
    },
    {
        id: '2',
        type: 'due_date',
        message: "'소방 시설 점검' 업무 마감이 내일입니다.",
        timestamp: '1시간 전',
        read: false,
    },
    {
        id: '3',
        type: 'comment',
        message: "이프로님이 '임대 계약서 검토'에 새로운 댓글을 남겼습니다.",
        timestamp: '3시간 전',
        read: true,
    },
];

// 3. Context 타입 정의
interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
}

// 4. Context 생성
const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// 5. Provider 컴포넌트 생성
export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);

  const unreadCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications]);

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const value = { notifications, unreadCount, markAsRead, markAllAsRead };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

// 6. 커스텀 훅 생성
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};