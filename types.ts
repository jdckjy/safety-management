
export enum InspectionType {
  PLANNED = 'Planned',
  REACTIVE = 'Reactive'
}

export enum SeverityLevel {
  LOW = 1,
  MEDIUM = 3,
  HIGH = 5
}

export enum LogStatus {
  ACTIVE = 'Active',
  RESOLVED = 'Resolved',
  FALSE_ALARM = 'FalseAlarm'
}

export type AssetCategory = 'HVAC' | 'Electrical' | 'Fire' | 'Structural' | 'Elevator';

/**
 * 이미지 기반 시설물 유지관리 점검 항목 인터페이스
 */
export interface InspectionItem {
  id: string;
  classification: '정기점검' | '법정검사' | '긴급점검' | '특별점검';
  target: string;      // 점검대상 (전기설비, 태양광 등)
  cycle: string;       // 점검주기 (일일, 주 1회 등)
  remarks: string;     // 비고
}

/**
 * PDF 조서 기반 단지 내 시설 정보 인터페이스
 */
export interface ComplexFacility {
  id: string;
  categoryName: string; // 세부시설명 (대분류)
  content: string;      // 시설내용 (소분류/명칭)
  totalArea: string;    // 시설면적(㎡)
  buildingArea: string; // 건축면적(㎡)
  bcr: string;          // 건폐율(%)
  floorArea: string;    // 지상층연면적(㎡)
  far: string;          // 용적률(%)
  usage: string;        // 건축물용도(주용도)
  height: string;       // 높이(m)
  remarks?: string;     // 비고
}

export interface Facility {
  id: string;
  name: string;
  area: string;
  lastInspectionDate: string;
  cycleMonths: number;
  nextInspectionDate: string;
  category: AssetCategory;
  manager?: string; 
  inspectionTypeDetail?: string; 
  isUrgent?: boolean;
}

export interface InspectionLog {
  id: string;
  facilityId: string;
  complexFacilityId?: string; // 단지 내 시설 정보 ID 연결
  type: InspectionType;
  severity: SeverityLevel;
  status: LogStatus;
  x: number; 
  y: number; 
  description: string;
  timestamp: string;
  leadTimeHours: number;
  photoUrl?: string;
  responder?: string;
  distanceToResponder?: string;
}

export interface MonthlyData {
  month: string;
  preventive: number;
  reactive: number;
}

export interface TaskKPI {
  id: string;
  mainCategory: string;
  subCategory: string;
  unitTask: string;
  kpi: string;
  criteria: string;
  cycle: string;
  manager: string;
}
