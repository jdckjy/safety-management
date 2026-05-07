import { ReactNode } from 'react';

// 기본 인터페이스
export interface Comment {
  id: string;
  author: string;
  timestamp: string;
  content: string;
}

export interface Task {
  id: string;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  status: string;
  assignees: string[];
  records: any[];
  comments: Comment[];
}

export interface Activity {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  status: string;
  tasks: Task[];
}

export interface KPI {
  id: string;
  title: string;
  description: string;
  current: number;
  target: number;
  previous: number;
  unit: string;
  activities: Activity[];
}

export interface HotSpot {
  id: string; 
  title: string;
  description: string;
  riskLevel: string;
  responseType: string;
  position: { lat: number; lng: number };
  facilityId: number;
}

export interface Facility {
  id: number;
  name: string;
  type: string;
  status: string;
}

export interface ComplexFacility {
  id: string;
  name: string;
  type: string;
  category: string; // 'category' 속성 추가
  location: string;
  manager?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
  phone?: string;
}

export interface Unit {
  id: string;
  unitNumber: string;
  floor: number;
  area: number;
  tenantId?: string;
}

export interface TenantInfo {
  id: string;
  name: string;
  businessName: string;
  contact: string;
  leaseStartDate: string;
  leaseEndDate: string;
}

export interface Contract {
  id: string;
  tenantId: string;
  type: string;
  startDate: string;
  endDate: string;
  rent: number;
  status: string;
}

export interface Attachment {
  id: string;
  tenantId: string;
  fileName: string;
  url: string;
  uploadedAt: string;
}

export interface GeneralActivity {
    id: string;
    date: string;
    category: string;
    name: string; // 'title'을 'name'으로 변경
    description: string;
    participants: string[];
}

export interface CustomTab {
  id: string;
  title: string;
}

export interface MonthlyReport {
  id: string;
  year: number;
  month: number;
  report_date: string;
  raw_data: any;
}

// 네비게이션 상태
export interface NavigationState {
  menuKey: string;
  selectedMonth: number;
  [key: string]: any;
}

// 최상위 데이터 구조
export interface IProjectData {
  safetyKPIs: KPI[];
  leaseKPIs: KPI[];
  assetKPIs: KPI[];
  infraKPIs: KPI[];
  hotspots: HotSpot[];
  facilities: Facility[];
  complexFacilities: ComplexFacility[];
  teamMembers: TeamMember[];
  units: Unit[];
  tenantInfo: TenantInfo[];
  contracts: Contract[];
  attachments: Attachment[];
  generalActivities: GeneralActivity[];
  customTabs: CustomTab[];
  monthly_reports: MonthlyReport[];
}
