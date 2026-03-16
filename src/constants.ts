
/**
 * 애플리케이션 전체에서 사용되는 핵심 상수들을 정의하는 파일입니다.
 * "Single Source of Truth" 원칙에 따라, 상태, 유형, 표시 이름 등
 * 재사용 가능하고 일관성이 필요한 모든 값은 이곳에서 관리합니다.
 * 이를 통해 유지보수성을 높이고, "매직 스트링" 사용을 방지합니다.
 */

// 1. 표준 업무 상태 (Canonical Task Status)
// -----------------------------------------------------------------------------
export const TASK_STATUS = {
  NOT_STARTED: 'not-started',
  IN_PROGRESS: 'in-progress',
  COMPLETED: 'completed',
  OVERDUE: 'overdue', // 신규: 지연 상태 추가
} as const;

export type TaskStatus = typeof TASK_STATUS[keyof typeof TASK_STATUS];

// 2. 상태 표시 이름 (Status Display Names)
// -----------------------------------------------------------------------------
// UI에 표시될 때 사용되는 한글 이름입니다.
export const TASK_STATUS_DISPLAY_NAMES: { [key in TaskStatus]: string } = {
  [TASK_STATUS.NOT_STARTED]: '시작전',
  [TASK_STATUS.IN_PROGRESS]: '진행중',
  [TASK_STATUS.COMPLETED]: '완료',
  [TASK_STATUS.OVERDUE]: '지연', // 신규: 지연 상태 표시 이름
};

// 3. 마스터 상태 변환 맵 (Master Status Transition Map)
// -----------------------------------------------------------------------------
// 시스템에 존재했던 모든 레거시/변형 상태 값을 공식 TaskStatus로 매핑합니다.
// 데이터 정제(sanitize), UI 컴포넌트 등 상태를 다루는 모든 곳에서 이 맵을
// 유일한 기준으로 사용하여, 시스템 전체의 상태 일관성을 100% 보장합니다.

const legacyAndVariantStatusMap: { [key: string]: TaskStatus } = {
  pending: TASK_STATUS.NOT_STARTED,
  on_hold: TASK_STATUS.NOT_STARTED,
  deferred: TASK_STATUS.NOT_STARTED,
  in_progress: TASK_STATUS.IN_PROGRESS,
  complete: TASK_STATUS.COMPLETED,
};

// 최종 마스터 맵: 자기 자신으로의 매핑을 포함하여, 어떤 입력값이 들어와도 항상 유효한 TaskStatus를 반환합니다.
export const MASTER_STATUS_TRANSITION_MAP: { [key: string]: TaskStatus } = {
  // 표준 상태 (입력값이 이미 올바를 경우)
  [TASK_STATUS.NOT_STARTED]: TASK_STATUS.NOT_STARTED,
  [TASK_STATUS.IN_PROGRESS]: TASK_STATUS.IN_PROGRESS,
  [TASK_STATUS.COMPLETED]: TASK_STATUS.COMPLETED,
  [TASK_STATUS.OVERDUE]: TASK_STATUS.OVERDUE, // 신규: 지연 상태 매핑 추가

  // 레거시 및 변형 상태
  ...legacyAndVariantStatusMap,
};

// 4. UI 렌더링용 상태 목록
// -----------------------------------------------------------------------------
// 드롭다운 메뉴와 같이 사용자가 '직접' 상태를 변경할 때 사용되는 옵션 목록입니다.
// '지연' 상태는 시스템에 의해 '계산'되는 상태이므로, 사용자가 선택할 수 있는 옵션에는 포함하지 않습니다.
export const UI_STATUS_OPTIONS = [
    TASK_STATUS.NOT_STARTED,
    TASK_STATUS.IN_PROGRESS,
    TASK_STATUS.COMPLETED
].map(status => ({
  value: status,
  label: TASK_STATUS_DISPLAY_NAMES[status],
}));

// 5. 임대 유닛 상태 (Tenant Unit Status)
// -----------------------------------------------------------------------------
export const UNIT_STATUS = {
  VACANT: '공실',
  OCCUPIED: '입주',
  IN_DISCUSSION: '협의중',
  NON_RENTABLE: '비임대',
} as const;
