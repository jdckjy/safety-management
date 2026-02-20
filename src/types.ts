
// src/types.ts
import { TaskStatus } from './constants';

export type MenuKey = 'dashboard' | 'safety' | 'lease' | 'asset' | 'infra';

export type { TaskStatus };

export interface WeeklyRecord {
  year: number;
  month: number;
  week: number;
  status: TaskStatus;
  comment?: string;
}

export interface Task {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: TaskStatus;
  records: WeeklyRecord[];
}

export interface Activity {
  id: string;
  name: string;
  status: TaskStatus;
  tasks: Task[];
}

export interface KPI {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  previous?: number;
  unit: string;
  activities: Activity[];
}

// [수정] 더 이상 사용하지 않는 CustomTab 인터페이스를 완전히 제거합니다.

export interface HotSpot {
  id: string;
  name: string;
  location: string;
  description: string;
}

export interface Facility {
  id: string;
  name: string;
  type: string;
  status: string;
}

export interface ComplexFacility {
  id: string;
  category: string;
  name: string;
  area: number | null;
  compositionRatio: number | null;
  details: string;
  buildingArea: number | null;
  buildingCoverageRatio: number | null;
  grossFloorArea: number | null;
  floorAreaRatio: number | null;
  mainUse: string;
  height: string;
  remarks: string;
}

export interface NavigationState {
  menuKey: string;
  selectedKpiId?: string;
  activityId?: string;
  selectedMonth?: number;
}

// [핵심 수정] IAppData 인터페이스에서 customTabs 속성을 제거하여 타입 정의를 일치시킵니다.
export interface IAppData {
  safetyKPIs: KPI[];
  leaseKPIs: KPI[];
  assetKPIs: KPI[];
  infraKPIs: KPI[];
  hotspots: HotSpot[];
  facilities: Facility[];
  complexFacilities: ComplexFacility[];
}

export type StateUpdater<T> = React.Dispatch<React.SetStateAction<T>>;
