
// src/types.ts

// 1. Task의 진행 상태를 나타내는 타입입니다.
export type TaskStatus = 'not-started' | 'in-progress' | 'pending' | 'completed' | 'deferred';

// 2. *** 당신의 설계에 따라, 데이터 정합성을 위해 연도와 월 정보를 포함하도록 수정합니다. ***
export interface WeeklyRecord {
  year: number;
  month: number; // 1-12
  week: number;  // 월 기준 주차 (e.g., 1, 2, 3, 4, 5)
  status: TaskStatus;
  comment?: string;
}

// 3. 개별 업무(Task)를 정의합니다. (기간 기반)
export interface Task {
  id: string;
  name: string;
  startDate: string; // ISO 8601 format string
  endDate: string;   // ISO 8601 format string
  status: TaskStatus;
  records: WeeklyRecord[];
}

// 4. Activity 타입을 정의합니다.
export interface Activity {
  id: string;
  name: string;
  status: TaskStatus;
  tasks: Task[]; 
}

// 5. KPI 타입을 정의합니다.
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

export interface NavigationState {
  menuKey: string;
  selectedKpiId?: string;
  activityId?: string;
  selectedMonth?: number; 
}
