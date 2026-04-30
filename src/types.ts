
// General Project Data Structure
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

// Key Performance Indicators
export interface KPI {
  id: string;
  title: string;
  description: string;
  current: number;
  target: number;
  unit: string;
  previous: number;
  activities: Activity[];
}

export interface Activity {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: string;
  assignees: string[];
  cost: number;
  tasks: Task[];
}

export interface Task {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: string;
  assignees: string[];
  records: Record[];
  comments: Comment[];
}

export interface Record {
  id: string;
  date: string;
  content: string;
}

export interface Comment {
  id: string;
  author: string;
  timestamp: string;
  content: string;
}

// Hotspots and Facilities
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

// Navigation
export interface NavigationState {
  menuKey: string;
  selectedKpiId?: string;
  selectedActivityId?: string;
  selectedTaskId?: string;
  selectedMonth: number;
}

// Complex Facilities
export interface ComplexFacility {
    id: string;
    name: string;
    category: '전기' | '기계' | '소방' | '건축' | '기타';
    status: '정상' | '주의' | '이상' | '점검중';
    location: string;
    manager: string;
    lastInspection: string;
}

// Team Management
export interface TeamMember {
    id: string;
    name: string;
    role: string;
    team: '운영' | '기술' | '보안' | '환경';
    email: string;
    position: string;
    photo?: string;
}

// General Activities
export interface GeneralActivity {
    id: string;
    description: string;
    date: string;
    participants: string[];
}

// Custom Tabs
export interface CustomTab {
    id: string;
    title: string;
    content: string; // Could be markdown, JSON, etc.
}

// Monthly Reports
export interface MonthlyReport {
    id: string;
    year: number;
    month: number;
    report_date: string;
    raw_data: any; // Can be defined more strictly if the structure is known
}

// Tenant and Leasing Information
export interface Unit {
  id: string;
  floor: string;
  name: string;
  area_sqm: number;
  pathData?: string; 
}

export interface Contract {
  id: string;
  unitId: string;
  tenantId: string;
  startDate: string;
  endDate: string;
  deposit: number;
  monthlyRent: number;
  area: number;
  moveInDate: string;
  remarks: string;
  spaceName: string;
  spaceId: string;
}

export interface TenantInfo {
  id: string;
  companyName: string;
  representativeName: string;
  businessRegistrationNumber: string;
  contact: string;
  businessCategory: BusinessCategory;
  companySize: CompanySize;
  acquisitionChannel: AcquisitionChannel;
  businessDescription?: string;
}

export type BusinessCategory = 'IT' | 'Service' | 'Manufacturing' | 'Retail' | 'Education' | 'Other';
export type CompanySize = 'Small' | 'Medium' | 'Large' | 'Enterprise';
export type AcquisitionChannel = 'Website' | 'Referral' | 'Direct' | 'Brokerage' | 'Other';

export interface Attachment {
  id: string;
  tenantId: string;
  fileName: string;
  url: string;
  uploadedAt: string;
}
