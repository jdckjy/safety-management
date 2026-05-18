
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

export type CompanySize = '대기업' | '중견' | '중소' | '스타트업';
export type BusinessCategory = '의료' | '교육' | '연구' | '근생' | '기타';
export type AcquisitionChannel = '직접 유치' | '유관기관 소개' | '온라인' | '기타';
export type ContractStatus = 'ACTIVE' | 'EXPIRED' | 'PENDING';

export interface Unit {
  id: string;
  floor: string; // '1F', '2F', etc.
  name: string;
  area_sqm: number;
  pathData: string;
}

export interface TenantInfo {
    id: string;
    companyName: string;
    businessRegistrationNumber: string;
    representativeName: string;
    contact: string;
    businessCategory: BusinessCategory;
    companySize: CompanySize;
    businessDescription?: string;
    acquisitionChannel?: AcquisitionChannel;
    residentEmployees?: { male: number; female: number };
}

export interface Contract {
    id: string;
    unitId: string;
    tenantId: string;
    startDate: string;
    endDate: string;
    deposit: number;
    monthlyRent: number;
    contractStatus: ContractStatus;
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

export interface ReportRawData {
    [key: string]: any;
}

export interface MonthlyReport {
  id: string;
  year: number;
  month: number;
  report_date: string;
  raw_data: ReportRawData;
}


export interface Building {
    id: string;
    name: string;
    total_area_sqm: number;
    floors: Array<{
        level: number;
        name: string;
        total_area_sqm: number;
        floor_plan_url: string;
    }>;
    units: Array<{
        id: string;
        floor: number;
        area_sqm: number;
        status: 'occupied' | 'vacant';
        tenant_name: string | null;
        usage_type: string;
        position_x: number;
        position_y: number;
    }>;
}

export interface Lead {
    id: string;
    name: string;
    required_area: number;
    status: 'new' | 'contacted' | 'tour' | 'proposal' | 'closed';
}

// 네비게이션 상태
export interface NavigationState {
  menuKey: string;
  selectedMonth: number;
  [key: string]: any;
}

// 최상위 데이터 구조
export interface IProjectData {
  safetyKPIs?: KPI[];
  leaseKPIs?: KPI[];
  assetKPIs?: KPI[];
  infraKPIs?: KPI[];
  hotspots?: HotSpot[];
  facilities?: Facility[];
  teamMembers?: TeamMember[];

  buildings?: Building[];
  leads?: Lead[];
  activities?: Activity[];
  monthly_reports?: MonthlyReport[];
  
  units: Unit[];
  tenantInfo: TenantInfo[];
  contracts: Contract[];

  complexFacilities: ComplexFacility[];
  attachments: Attachment[];
  generalActivities: GeneralActivity[];
  customTabs: CustomTab[];
}
