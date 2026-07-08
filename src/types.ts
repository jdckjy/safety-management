
export type TaskStatus = 'not-started' | 'in-progress' | 'completed' | 'waiting' | 'deferred' | 'overdue';

export type KpiCategory = 'safety' | 'lease' | 'asset' | 'infra';

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
  monthly_reports?: MonthlyReport[];
  rentalHistory: RentalHistory[];
  evaluationResults: EvaluationResult[];
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

export interface Activity {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: TaskStatus;
  tasks: Task[];
}

export interface Task {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: TaskStatus;
  records: WeeklyRecord[];
  comments: Comment[];
  assigneeIds: string[];
  assignees?: TeamMember[]; // For backward compatibility
}

export interface WeeklyRecord {
  year: number;
  month: number;
  week: number;
  status: TaskStatus;
}

export interface Comment {
  id: string;
  author: string;
  timestamp: string;
  content: string;
}

export interface HotSpot {
  id: string;
  name: string;
  type: '안전' | '보안' | '환경' | '기타';
  location: string;
  description: string;
  image: string;
}

export interface Facility {
  id: string;
  name: string;
  type: string;
  location: string;
  status: 'operational' | 'maintenance' | 'inactive';
}

export interface NavigationState {
  menuKey: string;
  selectedMonth: number;
}

export interface TeamMember {
  id: string;
  name: string;
  position: string;
  team: string;
  photo: string;
}

export interface ComplexFacility {
  id: string;
  name: string;
  floor: string;
  location: string;
  area: number; 
  status: string;
  lastInspection?: string; 
}

export interface GeneralActivity {
  id: string;
  category: 'finance' | 'maintenance' | 'community';
  date: string;
  description: string;
  amount?: number;
  related_docs?: string[];
}

export interface CustomTab {
  id: string;
  title: string;
  content: string; // Could be markdown or structured data
}


export interface MonthlyReport {
  id: string; // e.g., "2023-05"
  year: number;
  month: number;
  report_date: string;
  raw_data: any;
}


export interface TenantInfo {
  id: string;
  name: string; // Tenant or Company Name
  businessType: string; // Type of business
  contactPerson: string;
  phone: string;
  email: string;
}

export interface Contract {
  id: string;
  tenantId: string;
  unitId: string;
  startDate: string;
  endDate: string;
  rent: number;
  deposit: number;
}

export interface Attachment {
  id: string;
  tenantId: string;
  fileName: string;
  url: string;
  uploadedAt: string;
}

export interface Unit {
  id: string;
  name: string;
  floor: number;
  area_sqm: number;
  type: 'office' | 'retail' | 'storage' | 'parking';
  status: 'occupied' | 'vacant' | 'notice'
}

export interface RentalHistory {
  id: string;
  year: number;
  total_rentable_area: number;
  total_leased_area: number;
  occupancy_rate: number;
  created_at: string;
}

export interface EvaluationResult {
    id: string;
    kpiId: string;
    date: string;
    score: number;
    rating: number;
}
