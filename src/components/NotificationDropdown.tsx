
import React from 'react';
import { CheckCircle, MessageSquare, AlertTriangle } from 'lucide-react';
import { useNotifications } from '../providers/NotificationProvider'; // 1. useNotifications 훅 임포트

const NotificationIcon = ({ type }: { type: string }) => {
    switch (type) {
        case 'new_task':
            return <CheckCircle className="text-green-500" size={20} />;
        case 'due_date':
            return <AlertTriangle className="text-yellow-500" size={20} />;
        case 'comment':
            return <MessageSquare className="text-blue-500" size={20} />;
        default:
            return null;
    }
};

/**
 * 알림 목록을 표시하는 드롭다운 컴포넌트입니다.
 * useNotifications 훅을 통해 중앙 상태와 연결됩니다.
 */
const NotificationDropdown: React.FC<{onClose: () => void}> = ({onClose}) => {
    // 2. useNotifications 훅 사용
    const { notifications, unreadCount, markAllAsRead } = useNotifications();

    const handleMarkAll = () => {
      markAllAsRead();
      // 여기에 모든 알림을 읽음 처리하는 API 호출을 추가할 수 있습니다.
    }

    return (
        <div className="absolute top-16 right-0 w-80 bg-white rounded-2xl shadow-lg border border-gray-100 z-50">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-bold text-lg">알림</h3>
                {unreadCount > 0 && 
                  <button onClick={handleMarkAll} className='text-sm font-bold text-teal-600 hover:underline'>모두 읽음</button>
                }
            </div>
            <div className="max-h-96 overflow-y-auto scrollbar-hide">
                {notifications.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">새로운 알림이 없습니다.</p>
                ) : (
                    notifications.map(notification => (
                        <div key={notification.id} className={`flex items-start gap-4 p-4 border-b border-gray-100 transition-colors hover:bg-gray-50 ${
                            !notification.read ? 'bg-teal-50/50' : ''
                        }`}>
                            <NotificationIcon type={notification.type} />
                            <div className="flex-1">
                                <p className="text-sm text-gray-800 leading-relaxed">{notification.message}</p>
                                <p className="text-xs text-gray-400 mt-1">{notification.timestamp}</p>
                            </div>
                            {!notification.read && 
                                <div className="w-2 h-2 bg-teal-500 rounded-full self-center flex-shrink-0"></div>
                            }
                        </div>
                    ))
                )}
            </div>
            <div className="p-2 text-center bg-gray-50 rounded-b-2xl">
                <button onClick={onClose} className="text-sm font-bold text-gray-600 hover:underline">닫기</button>
            </div>
        </div>
    );
};

export default NotificationDropdown;
