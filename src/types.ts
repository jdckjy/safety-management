
import { LucideIcon } from "lucide-react";

export type MenuKey = 'dashboard' | 'calendar' | 'safety' | 'lease' | 'asset' | 'infra';

export interface KPI {
    id: string;
    title: string;
    description?: string;
    current: number;
    target: number;
    unit: string;
    activities?: Activity[];
    previous?: number;
}

export interface Activity {
    id: string;
    name: string;
    description?: string;
    date: string;
    status: string;
    assignee?: string;
    tasks?: Task[];
}

export interface Task {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    status: string;
    assignees?: string[];
    records?: TaskRecord[];
    comments?: Comment[];
}

export interface TaskRecord {
    id: string;
    date: string;
    content: string;
    author: string;
}

export interface Comment {
    id: string;
    author: string;
    timestamp: string;
    content: string;
}

export interface HotSpot {
  id: string;
  title: string;
  description: string;
  facilityId: number;
  responseType: '정기' | '긴급';
  riskLevel: 'low' | 'medium' | 'high';
  position: { lat: number; lng: number };
  attachments?: string[]; // Array of image URLs
}


export interface Facility {
    id: number;
    name: string;
    type: string;
    status: string;
}

export interface NavigationState {
    menuKey: string;
    selectedMonth?: number;
    selectedKpiId?: string;
    selectedActivityId?: string;
    selectedTaskId?: string;
}

export interface ComplexFacility {
    id: string;
    name: string;
    category: string;
    location: string;
    area_sqm: number;
    status: string;
}

export interface TeamMember {
    id: string;
    name: string;
    team: string;
    role: string;
    avatar: string;
    tasks_completed: number;
    tasks_pending: number;
}

export interface Unit {
    id: string;
    name: string;
    floor: string;
    area_sqm: number;
    status: 'occupied' | 'vacant' | 'under-renovation' | 'notice';
    pathData: string;
    position_x?: number;
    position_y?: number;
}

export interface TenantUnit {
    id: string;
    floor: string;
    name: string;
    tenant: string;
    area_sqm: number;
    status: string;
    pathData: string;
}

export interface TenantInfo {
    id: string;
    businessName?: string; 
    companyName?: string; 
    ownerName?: string;
    representativeName?: string;
    contact: string;
    businessType?: string; 
    businessCategory?: string;
    unitId?: string;
    residentEmployees?: { male: number; female: number };
    companySize?: string;
    businessDescription?: string;
    acquisitionChannel?: string;
    businessRegistrationNumber?: string;
}

export interface Contract {
    id: string;
    tenantId: string;
    unitId?: string;
    facilityId?: string;
    startDate: string;
    endDate: string;
    deposit: number;
    rent: number;
    moveInDate?: string;
}

export type EnrichedUnit = Unit & {
    tenant?: TenantInfo;
    contract?: Contract;
};

export interface Attachment {
    id: string;
    tenantId: string;
    fileName: string;
    url: string;
    uploadedAt: string;
}

export interface GeneralActivity {
    id: string;
    category: string;
    title: string;
    date: string;
    content: string;
    author: string;
}

export interface CustomTab {
    id: string;
    title: string;
    icon?: LucideIcon;
    content?: string;
}

export interface Floor {
  level: number;
  floor_plan_url: string;
}

export interface Building {
  id: string;
  name: string;
  floors: Floor[];
  units: Unit[];
}

export interface IProjectData {
    buildings?: Building[];
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

export interface MonthlyReport {
  id: string;
  year: number;
  month: number;
  report_date: string;
  raw_data: {
    energyUsage: {
      electricityKwh: { value: number; unit: string };
      waterM3: { value: number; unit: string };
      gasM3: { value: number; unit: string };
      solarGenerationKwh: { value: number; unit: string };
    };
    weather: {
      averageTemperatureC: { value: number; unit: string };
    };
    energyCosts: {
      electricity: {
        basicCharge: { value: number };
        usageCharge: { value: number };
        demandCharge: { value: number };
        vat: { value: number };
        fund: { value: number };
        finalAmount: { value: number };
      };
      water: {
        usageCharge: { value: number };
        generalTotal: { value: number };
      };
      gas: { usageCharge: { value: number }; };
      total: { value: number; unit: string };
    };
    teamActivities: { id: string; teamName: string; tasks: string[]; }[];
  };
}
