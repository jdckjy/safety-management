
// 프로젝트의 주요 데이터 유형을 정의합니다.

/**
 * 최상위 프로젝트 데이터 구조
 */
export interface ProjectData {
  projectName: string;
  complexFacilities: ComplexFacility[];
  tenantUnits: TenantUnit[];
  safetyScores: SafetyScore[];
  leaseKPIs: LeaseKPI[];
  assetKPIs: AssetKPI[];
  infraKPIs: InfraKPI[];
  // [수정] 대시보드에서 사용하던 탭 관련 타입을 제거합니다.
}

/**
 * 좌측 사이드바 메뉴 키
 */
export type MenuKey = 'dashboard' | 'safety' | 'lease' | 'asset' | 'infra';

/**
 * 임대 유닛(호실)의 상태
 */
export type TenantUnitStatus = '입주' | '공실' | '협의중';

/**
 * 임대 유닛(호실) 정보
 */
export interface TenantUnit {
  id: string;
  facilityId?: string; // [수정] 각 유닛이 속한 시설 ID (옵셔널)
  floor: string;
  ho: string;
  area: number; // 면적 (제곱미터)
  status: TenantUnitStatus;
  tenantName?: string;
  rent?: number; // 월 임대료
}

/**
 * 단지 내 주요 시설 정보
 */
export interface ComplexFacility {
  id: string;
  name: string;
  category: '상가시설' | '운동시설' | '문화시설' | '주차장' | '기타';
  area: number; // 총 면적
  floor: string; // 위치한 층
}

/**
 * KPI 항목
 */
export interface KPI {
  id: string;
  name: string;
  value: number | string;
  unit: string;
  change: number; // 이전 기간 대비 변화율 (%)
}

// 각 메뉴별 KPI 타입 (기본 KPI 인터페이스 확장)
export interface LeaseKPI extends KPI {}
export interface AssetKPI extends KPI {}
export interface InfraKPI extends KPI {}

/**
 * 안전 관리 점수
 */
export interface SafetyScore {
  category: string;
  score: number;
  lastInspection: string;
}

/**
 * 알림 정보
 */
export interface Notification {
  id: number;
  type: 'alert' | 'info';
  message: string;
  timestamp: string;
  read: boolean;
}

// [수정] 대시보드에서 동적으로 추가되던 탭 관련 타입을 제거합니다.
