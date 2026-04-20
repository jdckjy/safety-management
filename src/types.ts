
/**
 * @file src/types.ts
 * @description 프로젝트 전체에서 사용되는 TypeScript 타입 정의 파일입니다.
 */

// ==================================================================================
// I. 프로젝트 코어 데이터 구조
// ==================================================================================

/**
 * @interface IProjectData
 * @description 전체 프로젝트의 데이터를 통합 관리하는 최상위 인터페이스입니다.
 */
export interface IProjectData {
  // --- 공간 및 시설 데이터 ---
  buildings?: Building[];
  
  // --- 임차인 및 계약 관련 데이터 ---
  tenantInfo?: TenantInfo[];
  contracts?: Contract[];
  attachments?: Attachment[];
  
  // --- 월간 보고서 데이터 ---
  monthly_reports?: MonthlyReport[];

  // --- 잠재고객 및 활동 데이터 ---
  leads?: Lead[];
  activities?: Activity[];

  // --- 레거시 또는 기타 데이터 ---
  safetyKPIs?: KPI[];
  leaseKPIs?: KPI[];
  assetKPIs?: KPI[];
  infraKPIs?: KPI[];
  hotspots?: HotSpot[];
  facilities?: Facility[];
  complexFacilities?: ComplexFacility[];
  tenantUnits?: TenantUnit[]; // Legacy
  teamMembers?: TeamMember[];
  generalActivities?: GeneralActivity[];
  customTabs?: CustomTab[];
}

// ==================================================================================
// II. 빌딩, 공간 및 임대 단위 관련 타입
// ==================================================================================

/**
 * @interface Building
 * @description 하나의 건물을 나타냅니다. 여러 층과 유닛으로 구성됩니다.
 */
export interface Building {
  id: string;
  name: string;
  total_area_sqm?: number;
  floors: Floor[];
  units: Unit[];
}

/**
 * @interface Floor
 * @description 건물의 한 층을 나타냅니다.
 */
export interface Floor {
  level: number;
  name: string;
  total_area_sqm: number;
  floor_plan_url: string;
}

/**
 * @interface Unit
 * @description 건물의 개별 임대 유닛(호실)을 나타냅니다.
 */
export interface Unit {
  id: string;
  floor: number;
  area_sqm: number;
  status: string;
  tenant_name: string | null;
  usage_type: string;
  position_x: number;
  position_y: number;
}

/**
 * @interface TenantUnit
 * @description 개별 임대 공간(호실)의 정보를 정의합니다. (Legacy)
 */
export interface TenantUnit {
    id: string;
    floor: string;
    name: string;
    tenant: string;
    area: number;
    status: TenantUnitStatus;
    unitNumber?: string;
    pathData?: string;
    rent?: number;
    deposit?: number;
    contractDate?: string;
    moveInDate?: string;
    moveOutDate?: string;
    contractStatus?: ContractStatus;
    lastModified?: { date: string; user: string; };
    remarks?: string;
}

export type TenantUnitStatus = 'OCCUPIED' | 'VACANT' | 'IN_DISCUSSION' | 'NON_RENTABLE';
export type ContractStatus = '입주예정' | '정상' | '만료임박' | '퇴거' | '연체';

/**
 * @interface ComplexFacility
 * @description 단지 내 주요 시설물 정보를 정의합니다.
 */
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


// ==================================================================================
// III. 임차인, 계약, 잠재고객 관련 타입
// ==================================================================================

/**
 * @interface TenantInfo
 * @description 임차인(사)의 기본 정보를 정의합니다.
 */
export interface TenantInfo {
  id: string; 
  companyName: string;
  businessRegistrationNumber: string;
  representativeName: string;
  contact: string;
  businessCategory: BusinessCategory;
  companySize: CompanySize;
  residentEmployees?: { male: number; female: number; };
  businessDescription?: string;
  acquisitionChannel?: AcquisitionChannel;
}

/**
 * @interface Contract
 * @description 임대차 계약 정보를 정의합니다.
 */
export interface Contract {
  id: string;
  tenantId: string;
  spaceId: string;
  spaceName: string;
  startDate: string;
  endDate: string;
  area: number;
  deposit: number;
  monthlyRent: number;
}

/**
 * @interface Attachment
 * @description 계약 또는 임차인 관련 첨부 파일 정보를 정의합니다.
 */
export interface Attachment {
  id: string;
  tenantId: string;
  fileName: string;
  fileType: string;
  url: string;
  uploadedAt: string;
}


/**
 * @interface Lead
 * @description 잠재 임차 고객 정보를 정의합니다.
 */
export interface Lead {
  id: string;
  name: string;
  required_area: number;
  status: string;
}

export type CompanySize = '대기업' | '중견' | '중소' | '스타트업';
export type BusinessCategory = '의료' | '교육' | '연구' | '근생' | '기타';
export type AcquisitionChannel = '직접 유치' | '유관기관 소개' | '온라인' | '기타';


// ==================================================================================
// IV. 보고서 및 활동 관련 타입
// ==================================================================================

/**
 * @interface ReportRawData
 * @description 월간 보고서의 원시 데이터 구조를 정의합니다.
 */
export interface ReportRawData {
  energyUsage: { [key: string]: { value: number; unit: string } };
  weather: { [key: string]: { value: number; unit: string } };
  energyCosts: { [key: string]: any };
  teamActivities: TeamActivity[];
}

/**
 * @interface MonthlyReport
 * @description 월간 보고서 데이터 구조를 정의합니다.
 */
export interface MonthlyReport {
  id: string;
  year: number;
  month: number;
  report_date?: string;
  raw_data: ReportRawData;
}

/**
 * @interface Activity
 * @description KPI 달성을 위한 개별 활동 정보를 정의합니다.
 */
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

/**
 * @interface GeneralActivity
 * @description 특정 KPI에 종속되지 않는 일반 활동 정보를 정의합니다.
 */
export interface GeneralActivity {
  id: string;
  title: string;
  category: string;
  date: string;
  description: string;
}

/**
 * @interface TeamActivity
 * @description 시설, 미화, 보안 등 팀별 활동 데이터를 정의합니다.
 */
export interface TeamActivity {
  id: string;
  teamName: string;
  tasks: string[];
}


// ==================================================================================
// V. 기타 타입
// ==================================================================================

/**
 * @interface NavigationState
 * @description UI 네비게이션 상태를 정의합니다. (e.g. 현재 선택된 메뉴, 월)
 */
export interface NavigationState {
  menuKey: string;
  selectedMonth: number;
  subView?: string;
  selectedKpiId?: string;
  selectedActivityId?: string;
  selectedTaskId?: string;
}

/**
 * @interface KPI
 * @description 핵심 성과 지표(KPI) 정보를 정의합니다.
 */
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

/**
 * @interface Task
 * @description 활동에 속한 세부 작업 정보를 정의합니다.
 */
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

/**
 * @interface Comment
 * @description 작업에 대한 댓글 정보를 정의합니다.
 */
export interface Comment {
  id: string;
  author: string;
  timestamp: string;
  content: string;
}

/**
 * @interface HotSpot
 * @description 주요 관리 포인트(Hotspot) 정보를 정의합니다.
 */
export interface HotSpot {
  id: string;
  name: string;
  description: string;
  location: string;
  imageUrl: string;
  status: string;
}

/**
 * @interface Facility
 * @description 일반 시설물 정보를 정의합니다.
 */
export interface Facility {
  id: string;
  name: string;
  description: string;
  status: string;
  imageUrl?: string;
}

/**
 * @interface TeamMember
 * @description 프로젝트 팀원 정보를 정의합니다.
 */
export interface TeamMember {
    id: string;
    name: string;
    team: string;
    role: string;
    contact: string;
    isManager: boolean;
}

/**
 * @interface CustomTab
 * @description 사용자가 정의하는 탭 정보를 정의합니다.
 */
export interface CustomTab {
  id: string;
  name: string;
  type: 'kpi-based' | 'general-activities';
  kpiIds?: string[];
  activityCategories?: string[];
}

