
import React from 'react';
import { Activity } from '../types';
import { useAppData } from '../providers/AppDataContext';

interface ActivityListProps {
  kpiId: string;
  activities: Activity[];
}

export const ActivityList: React.FC<ActivityListProps> = ({ kpiId, activities }) => {
  const { navigateTo } = useAppData();

  if (!activities || activities.length === 0) {
    return <p className="text-gray-500">이 KPI에 해당하는 활동이 아직 없습니다.</p>;
  }

  const handleActivityClick = (activityId: string) => {
    // ActivityManager와 같은 상세 뷰로 이동하는 로직 (현재는 navigateTo 사용)
    navigateTo({ activityId: activityId }); 
    console.log(`Navigating to details for activity: ${activityId}`);
  };

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-gray-800">활동 목록</h3>
      <ul className="divide-y divide-gray-200">
        {activities.map((activity) => (
          <li 
            key={activity.id}
            onClick={() => handleActivityClick(activity.id)}
            className="p-3 hover:bg-gray-50 rounded-md cursor-pointer transition-colors"
          >
            <div className="flex justify-between items-center">
              <span className="font-medium text-gray-900">{activity.name}</span>
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${activity.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                {activity.status}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
