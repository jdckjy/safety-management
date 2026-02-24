
import React, { useState } from 'react';
import { KPI, Activity } from '../types';
import { ActivityItem } from './ActivityItem';
import { AddActivity } from './AddActivity';
import { WeeklyPerformanceModal } from './shared/WeeklyPerformanceModal';

interface ActivityManagerProps {
  kpi: KPI;
}

export const ActivityManager: React.FC<ActivityManagerProps> = ({ kpi }) => {
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(null);

  const handleActivitySelect = (activityId: string) => {
    setSelectedActivityId(activityId);
  };

  const handleCloseModal = () => {
    setSelectedActivityId(null);
  };

  const selectedActivity = kpi.activities?.find(a => a.id === selectedActivityId);

  return (
    <div className="bg-gray-50/80 rounded-b-3xl -mt-2 pt-4 pb-6 px-6 border-t border-gray-200/80 animate-fade-in-down">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Activity Ledger</h3>
        <span className="text-xs font-semibold text-gray-400">Total {kpi.activities?.length || 0} Records</span>
      </div>
      
      <div className="space-y-3">
        {(kpi.activities || []).map((activity: Activity) => (
          <ActivityItem 
            key={activity.id} 
            kpiId={kpi.id}
            activity={activity} 
            onSelect={handleActivitySelect} 
          />
        ))}
        
        <AddActivity kpiId={kpi.id} />
      </div>
      
      {selectedActivity && (
        <WeeklyPerformanceModal
          kpi={kpi}
          activity={selectedActivity}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};
