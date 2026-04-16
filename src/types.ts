// src/types.ts

// ==================================================================================
// OMS (단지 운영 관리) 관련 타입
// ==================================================================================

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
      solarGenerationKwh: { value: number; unit: string }; // 태양광 발전량
    };
    weather: {
      averageTemperatureC: { value: number; unit: string }; // 평균 기온
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
// 기존 프로젝트 타입 (수정됨)
// ==================================================================================

export type CompanySize = '대기업' | '중견' | '중소' | '스타트업';
export type BusinessCategory = '의료' | '교육' | '연구' | '근생' | '기타';
export type AcquisitionChannel = '직접 유치' | '유관기관 소개' | '온라인' | '기타';

export interface Attachment {
  name: string;
  url: string;
  type: '계약서' | '사업자등록증' | '기타';
}

export interface TenantInfo {
  id: string; // Use businessRegistrationNumber as a unique ID
  companyName: string; // 업체(기관)명
  businessRegistrationNumber: string; // 사업자등록번호
  representativeName: string; // 대표자명
  contact: string; // 담당자 연락처
  businessCategory: BusinessCategory; // 업종 카테고리
  companySize: CompanySize; // 기업 규모

  // 성과 및 행정 정보 (Performance & Admin)
  residentEmployees?: { // 상주 인원수
    male: number;
    female: number;
  };
  businessDescription?: string; // 주요 사업 내용
  attachments?: Attachment[]; // 첨부 파일
  acquisitionChannel?: AcquisitionChannel; // 유치 경로
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
  tenantInfo: TenantInfo[];
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
  buildingArea?: number;
  buildingCoverageRatio?: number;
  grossFloorArea?: number;
  floorAreaRatio?: number;
  mainUse?: string;
  height?: number;
  remarks?: string;
}

export interface TeamMember {
    id: string;
    name: string;
    team: string;
    role: string;
    contact: string;
    isManager: boolean;
}

export type TenantUnitStatus = 'OCCUPIED' | 'VACANT' | 'IN_DISCUSSION' | 'NON_RENTABLE';
export type ContractStatus = '입주예정' | '정상' | '만료임박' | '퇴거' | '연체';

export interface TenantUnit {
    id: string;
    floor: string;
    name: string;
    tenant: string;
    area: number;
    status: TenantUnitStatus;
    unitNumber?: string;
    companyName?: string;
    contactPerson?: string;
    contactNumber?: string;
    industry?: string;
    pathData?: string; // svgPath에서 pathData로 변경하여 일관성 확보
    rent?: number;
    deposit?: number;
    contractDate?: string;
    moveInDate?: string;
    moveOutDate?: string;

    // 시스템 관리 속성 (System Metadata)
    contractStatus?: ContractStatus; // 계약 상태 (자동 계산)
    lastModified?: { // 최종 수정일 및 수정자
      date: string; // ISO 8601 format
      user: string;
    };
    remarks?: string; // 비고란
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

export interface Income {
  id: string;
  source: string;
  amount: number;
  date: string; // ex: "2024-07-26"
  category: 'rent' | 'service' | 'other';
}

export interface Expense {
  id: string;
  item: string;
  amount: number;
  date: string; // ex: "2024-07-26"
  category: 'maintenance' | 'utilities' | 'salary' | 'other';
}
