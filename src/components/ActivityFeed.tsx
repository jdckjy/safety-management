
// src/components/ActivityFeed.tsx
import React from 'react';
import { useAppData } from '../providers/AppDataContext';
import { Activity } from '../types';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

const ActivityItem: React.FC<{ activity: Activity }> = ({ activity }) => {
  return (
    <div className="flex items-start space-x-3 py-3">
      <div className="flex-shrink-0">
        <div className={`h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center`}>
          {/* Icon can be extended later */}
          <span className="text-sm font-bold text-blue-600">i</span> 
        </div>
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm text-gray-800" dangerouslySetInnerHTML={{ __html: activity.description }} />
        <p className="text-xs text-gray-400">
          {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true, locale: ko })}
        </p>
      </div>
    </div>
  );
};


const ActivityFeed: React.FC = () => {
  const { activities } = useAppData();

  // Sort by timestamp
  const sortedActivities = [...activities].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <h3 className="text-lg font-bold text-gray-800 mb-4">최근 활동</h3>
      {sortedActivities.length > 0 ? (
        <div className="-my-3 divide-y divide-gray-200">
          {sortedActivities.map(activity => (
            <ActivityItem key={activity.id} activity={activity} />
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500 py-8">기록된 활동이 없습니다.</p>
      )}
    </div>
  );
};

export default ActivityFeed;
