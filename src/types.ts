
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

export interface TeamMember {
  id: string;
  name: string;
  position: string;
  phone: string;
  photo: string;
}

export interface NavigationState {
  menuKey: string;
  selectedKpiId?: string;
  activityId?: string;
  selectedMonth?: number;
}

export interface Tenant {
    id: string;
    name: string;
    // Add other tenant properties as needed
}

export type TenantUnitStatus = '공실' | '입주' | '협의중' | '비임대';

export interface TenantUnit {
    id: string;
    floor: string;
    name: string; // 호실명 (예: 101호)
    area: number; // 면적 (m²)
    status: TenantUnitStatus;
    tenant?: string; // 임차인
    rent?: number; // 월 임대료
    deposit?: number; // 보증금
    contractDate?: string;
    moveInDate?: string;
    moveOutDate?: string;
    pathData?: string; // For SVG path
}


export interface IProjectData {
  safetyKPIs: KPI[];
  leaseKPIs: KPI[];
  assetKPIs: KPI[];
  infraKPIs: KPI[];
  hotspots: HotSpot[];
  facilities: Facility[];
  complexFacilities: ComplexFacility[];
  teamMembers: TeamMember[];
  tenantUnits: TenantUnit[];
}

export type StateUpdater<T> = React.Dispatch<React.SetStateAction<T>>;
