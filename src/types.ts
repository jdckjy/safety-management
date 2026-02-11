
// src/types.ts

export type MenuKey = 'dashboard' | 'safety' | 'lease' | 'asset' | 'infra' | string; // Allow for custom keys

export interface Pulse {
  value: number;
  trend: 'up' | 'down' | 'stable';
}

// 'Plan' is deprecated and will be replaced by 'Task' for better consistency.
// export interface Plan {
//   id: string;
//   content: string;
//   completed: boolean;
//   week: number; // 주차 정보 (1-5)
// }

export type TaskStatus = 'not-started' | 'in-progress' | 'pending' | 'completed';

export interface Task {
  id: string;
  name: string;
  month: number;
  week: number;
  status: TaskStatus;
  kpiId?: string; // Optional: Link to a KPI
  dueDate?: string; // Optional: for deadline-based tasks
}


export interface MonthlyRecord {
  month: number; // 1-12
  plans: Task[]; // Changed from Plan[] to Task[]
}

export interface BusinessActivity {
  id: string;
  content: string;
  status: 'ongoing' | 'completed' | 'paused';
  date: string;
  monthlyRecords?: MonthlyRecord[];
}

export interface KPI {
  id: string;
  name: string;
  target: number;
  current: number;
  unit: string;
  activities?: BusinessActivity[];
  pulse?: Pulse;
}

export interface HotSpot {
  id: string;
  facilityId: string;
  facilityName: string;
  responseType: '정기' | '긴급';
  riskLevel: 'high' | 'medium' | 'low';
  details: string;
  position: { lat: number; lng: number };
}

export interface Facility {
  id: string;
  name: string;
  category: string;
  status: 'active' | 'maintenance' | 'inactive';
  lastMaintenance: string;
}


// Add CustomTab type for dynamic tabs
export interface CustomTab {
  key: string;
  label: string;
}

// src/types.ts: Tenant 타입 추가
export interface Tenant {
  id: string;
  name: string;
  businessType: string;
  space: string;
  entryDate: string;
  contact: string;
}
