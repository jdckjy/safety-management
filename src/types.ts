
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
 * 애플리케이션의 모든 주요 데이터가 이 구조에 포함됩니다.
 */
export interface IProjectData {
  // --- KPI 관련 데이터 ---
  safetyKPIs: KPI[];
  leaseKPIs: KPI[];
  assetKPIs: KPI[];
  infraKPIs: KPI[];

  // --- 공간 및 시설 데이터 ---
  hotspots: HotSpot[];
  facilities: Facility[];
  complexFacilities: ComplexFacility[];
  tenantUnits: TenantUnit[];
  
  // --- 임차인 및 계약 관련 데이터 ---
  tenantInfo: TenantInfo[];
  contracts: Contract[];
  attachments: Attachment[];

  // --- 인력 및 활동 데이터 ---
  teamMembers: TeamMember[];
  generalActivities: GeneralActivity[];
  customTabs: CustomTab[];
  
  // --- 월간 보고서 데이터 ---
  monthly_reports: MonthlyReport[];
}


// ==================================================================================
// II. 임차인 및 계약 관련 타입
// ==================================================================================

/**
 * @interface TenantInfo
 * @description 임차인(사)의 기본 정보를 정의합니다.
 */
export interface TenantInfo {
  /** @property {string} id - 고유 식별자 (사업자등록번호를 사용) */
  id: string; 
  /** @property {string} companyName - 업체(기관)명 */
  companyName: string;
  /** @property {string} businessRegistrationNumber - 사업자등록번호 */
  businessRegistrationNumber: string;
  /** @property {string} representativeName - 대표자명 */
  representativeName: string;
  /** @property {string} contact - 담당자 연락처 */
  contact: string;
  /** @property {BusinessCategory} businessCategory - 업종 */
  businessCategory: BusinessCategory;
  /** @property {CompanySize} companySize - 기업 규모 */
  companySize: CompanySize;
  /** @property {{ male: number; female: number }} [residentEmployees] - 상주 인원 (선택) */
  residentEmployees?: {
    male: number;
    female: number;
  };
  /** @property {string} [businessDescription] - 주요 사업 내용 (선택) */
  businessDescription?: string;
  /** @property {AcquisitionChannel} [acquisitionChannel] - 유치 경로 (선택) */
  acquisitionChannel?: AcquisitionChannel;
}

/**
 * @interface Contract
 * @description 임대차 계약 정보를 정의합니다.
 */
export interface Contract {
  /** @property {string} id - 계약 고유 식별자 */
  id: string;
  /** @property {string} tenantId - 해당 계약의 임차인 ID */
  tenantId: string;
  /** @property {string} spaceId - 임대 공간 ID */
  spaceId: string;
  /** @property {string} spaceName - 임대 공간 명칭 */
  spaceName: string;
  /** @property {string} startDate - 계약 시작일 (YYYY-MM-DD) */
  startDate: string;
  /** @property {string} endDate - 계약 종료일 (YYYY-MM-DD) */
  endDate: string;
  /** @property {number} area - 계약 면적 (단위: ㎡) */
  area: number;
  /** @property {number} deposit - 보증금 */
  deposit: number;
  /** @property {number} monthlyRent - 월 임대료 */
  monthlyRent: number;
}

/**
 * @interface Attachment
 * @description 계약서, 사업자등록증 등 첨부 파일 정보를 정의합니다.
 */
export interface Attachment {
  /** @property {string} id - 파일 고유 식별자 */
  id: string;
  /** @property {string} tenantId - 파일과 연관된 임차인 ID */
  tenantId: string;
  /** @property {string} name - 파일 이름 */
  name: string;
  /** @property {string} url - 파일 접근을 위한 URL */
  url: string;
  /** @property {'계약서' | '사업자등록증' | '기타'} type - 파일 종류 */
  type: '계약서' | '사업자등록증' | '기타';
  /** @property {string} uploadDate - 파일 업로드 날짜 (ISO 8601 형식) */
  uploadDate: string;
}

/** @type {'대기업' | '중견' | '중소' | '스타트업'} CompanySize - 기업 규모 */
export type CompanySize = '대기업' | '중견' | '중소' | '스타트업';
/** @type {'의료' | '교육' | '연구' | '근생' | '기타'} BusinessCategory - 업종 */
export type BusinessCategory = '의료' | '교육' | '연구' | '근생' | '기타';
/** @type {'직접 유치' | '유관기관 소개' | '온라인' | '기타'} AcquisitionChannel - 유치 경로 */
export type AcquisitionChannel = '직접 유치' | '유관기관 소개' | '온라인' | '기타';

// ==================================================================================
// III. 공간 및 임대 단위 관련 타입
// ==================================================================================

/**
 * @interface TenantUnit
 * @description 개별 임대 공간(호실)의 정보를 정의합니다.
 */
export interface TenantUnit {
    /** @property {string} id - 공간 고유 식별자 */
    id: string;
    /** @property {string} floor - 층 */
    floor: string;
    /** @property {string} name - 공간 이름 (예: "301호") */
    name: string;
    /** @property {string} tenant - 현재 입주 임차인 이름 */
    tenant: string;
    /** @property {number} area - 면적 (단위: ㎡) */
    area: number;
    /** @property {TenantUnitStatus} status - 현재 상태 (입주, 공실 등) */
    status: TenantUnitStatus;
    /** @property {string} [unitNumber] - 호실 번호 (선택) */
    unitNumber?: string;
    /** @property {string} [pathData] - 도면 SVG의 path 데이터 (선택) */
    pathData?: string;
    
    // --- 계약 관련 정보 (선택) ---
    /** @property {number} [rent] - 월 임대료 */
    rent?: number;
    /** @property {number} [deposit] - 보증금 */
    deposit?: number;
    /** @property {string} [contractDate] - 계약일 */
    contractDate?: string;
    /** @property {string} [moveInDate] - 입주일 */
    moveInDate?: string;
    /** @property {string} [moveOutDate] - 퇴거일 */
    moveOutDate?: string;

    // --- 시스템 관리 속성 ---
    /** @property {ContractStatus} [contractStatus] - 계약 상태 (자동 계산) */
    contractStatus?: ContractStatus;
    /** @property {{ date: string; user: string; }} [lastModified] - 최종 수정 정보 */
    lastModified?: {
      date: string;
      user: string;
    };
    /** @property {string} [remarks] - 비고 */
    remarks?: string;
}

/** @type {'OCCUPIED' | 'VACANT' | 'IN_DISCUSSION' | 'NON_RENTABLE'} TenantUnitStatus - 임대 단위 공간의 상태 */
export type TenantUnitStatus = 'OCCUPIED' | 'VACANT' | 'IN_DISCUSSION' | 'NON_RENTABLE';

/** @type {'입주예정' | '정상' | '만료임박' | '퇴거' | '연체'} ContractStatus - 계약의 상태 */
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
// IV. KPI 및 활동 관련 타입
// ==================================================================================

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


// ==================================================================================
// V. 단지 운영 관리 (OMS) 및 기타 타입
// ==================================================================================

/**
 * @interface MonthlyReport
 * @description 월간 보고서 데이터 구조를 정의합니다.
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
      gas: {
        usageCharge: { value: number };
      };
      total: { value: number; unit: string };
    };
    teamActivities: TeamActivity[];
  };
}

/**
 * @interface TeamActivity
 * @description 시설, 미화, 보안 등 팀별 활동 데이터를 정의합니다.
 */
export interface TeamActivity {
  id: string; // 예: "facility", "cleaning", "security"
  teamName: string; // 예: "시설팀", "미화팀", "보안팀"
  tasks: string[];
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

/**
 * @interface Income
 * @description 수입 항목 정보를 정의합니다. (재무 관리용)
 */
export interface Income {
  id: string;
  source: string;
  amount: number;
  date: string; // ex: "2024-07-26"
  category: 'rent' | 'service' | 'other';
}

/**
 * @interface Expense
 * @description 지출 항목 정보를 정의합니다. (재무 관리용)
 */
export interface Expense {
  id: string;
  item: string;
  amount: number;
  date: string; // ex: "2024-07-26"
  category: 'maintenance' | 'utilities' | 'salary' | 'other';
}

/**
 * @interface NavigationState
 * @description UI의 네비게이션 상태를 관리하기 위한 타입입니다. (현재 사용 안함)
 * @deprecated
 */
export interface NavigationState {
  menuKey: string;
  selectedKpiId?: string;
  selectedActivityId?: string;
  selectedTaskId?: string;
  selectedHotspotId?: string;
  selectedFacilityId?: string;
  selectedMonth: number;
}
