
// src/types.ts
import { TaskStatus } from './constants'; // "Single Source of Truth"를 임포트합니다.

// 1. Task의 진행 상태 타입이 이제 constants.ts를 유일한 진실의 원천으로 삼습니다.
// export type TaskStatus = 'not-started' | 'in-progress' | 'pending' | 'completed' | 'deferred'; // 이 라인은 제거됩니다.

// 2. 주간 보고서 레코드
export interface WeeklyRecord {
  year: number;
  month: number; // 1-12
  week: number;  // 월 기준 주차 (e.g., 1, 2, 3, 4, 5)
  status: TaskStatus; // 강화된 타입을 사용합니다.
  comment?: string;
}

// 3. 개별 업무(Task)
export interface Task {
  id: string;
  name: string;
  startDate: string; // ISO 8601 format string
  endDate: string;   // ISO 8601 format string
  status: TaskStatus; // 강화된 타입을 사용합니다.
  records: WeeklyRecord[];
}

// 4. 활동(Activity)
export interface Activity {
  id: string;
  name: string;
  status: TaskStatus; // 강화된 타입을 사용합니다.
  tasks: Task[]; 
}

// 5. 핵심 성과 지표(KPI)
export interface KPI {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  previous?: number; 
  unit: string;
  activities: Activity[];
}

// 이하 다른 타입들 (변경 없음)
export interface CustomTab {
  key: string;
  title: string;
  content: string;
}

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

// 6. 네비게이션 상태
export interface NavigationState {
  menuKey: string;
  selectedKpiId?: string;
  activityId?: string;
  selectedMonth?: number; 
}
