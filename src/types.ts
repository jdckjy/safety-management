
// src/types.ts

// ==================================================================================
// OMS (단지 운영 관리) 관련 타입
// =================================G=================================================

/**
 * 월간 보고서 전체 데이터 구조
 */
export interface MonthlyReport {
  id: string; // 예: "2026-02"
  year: number;
  month: number;
  report_date: string; // 예: "2026-03-05"
  raw_data: {
    energyUsage: {
      electricityKwh: { value: number; unit: string };
      waterM3: { value: number; unit: string };
      gasM3: { value: number; unit: string };
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
      gas: {
        usageCharge: { value: number };
      };
      total: { value: number; unit: string };
    };
    teamActivities: TeamActivity[];
  };
}

/**
 * 팀별 활동 데이터 구조
 */
export interface TeamActivity {
  id: string; // 예: "facility", "cleaning", "security"
  teamName: string; // 예: "시설팀", "미화팀", "보안팀"
  tasks: string[];
}

// ==================================================================================
// 기존 프로젝트 타입 (수정 없음)
// ==================================================================================

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
  generalActivities: GeneralActivity[];
  customTabs: CustomTab[];
  monthly_reports: MonthlyReport[];
}

export interface KPI {
  id: string;
  title: string;
  description: string;
  current: number;
  target: number;
  previous: number;
  unit: string;
  activities?: Activity[];
}

export interface Activity {
  id: string;
  name: string;
  description?: string;
  status: string;
  startDate?: string;
  endDate?: string;
  assignees?: string[];
  tasks?: Task[];
}

export interface Task {
  id: string;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  status: string;
  assignees?: string[];
  records: { date: string; value: number }[];
  comments: Comment[];
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
  description: string;
  location: string;
  imageUrl: string;
  status: string; 
}

export interface Facility {
  id: string;
  name: string;
  description: string;
  status: string; 
  imageUrl?: string;
}

export interface NavigationState {
  menuKey: string;
  selectedKpiId?: string;
  selectedActivityId?: string;
  selectedTaskId?: string;
  selectedHotspotId?: string;
  selectedFacilityId?: string;
  selectedMonth: number;
}

export interface ComplexFacility {
  id: string;
  floor: number;
  name: string;
  area: number;
  category: 'public' | 'commercial' | 'office' | 'residential' | 'special';
}

export interface TeamMember {
    id: string;
    name: string;
    team: string;
    role: string;
    contact: string;
    isManager: boolean;
}

export interface TenantUnit {
    id: string;
    floor: number;
    unitNumber: string;
    companyName: string;
    contactPerson: string;
    contactNumber: string;
    industry: string; 
    pathData?: string;
}

export interface GeneralActivity {
  id: string;
  title: string;
  category: string;
  date: string;
  description: string;
}

export interface CustomTab {
  id: string;
  name: string;
  type: 'kpi-based' | 'general-activities';
  kpiIds?: string[];
  activityCategories?: string[];
}

