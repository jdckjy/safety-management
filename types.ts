
import React from 'react';
import { LatLngExpression } from 'leaflet';

export type MenuKey = 'dashboard' | 'safety' | 'lease' | 'asset' | 'infra' | string;

export interface CustomTab {
  key: string;
  label: string;
  color: 'orange' | 'blue' | 'emerald' | 'purple';
}

export interface SummaryStats {
  safety: { days: number; change: number };
  lease: { rate: number; change: number };
  asset: { value: number; change: number };
  infra: { progress: number; change: number };
}

export interface StatItem {
  label: string;
  value: string | number;
  change: number;
  isPositive: boolean;
  unit?: string;
}

export interface TaskItem {
  id: string;
  time: string;
  category: string;
  subject: string;
  assignee: string;
  status: 'pending' | 'completed' | 'urgent';
}

export interface PlanItem {
  id: string;
  text: string;
  isExecuted: boolean;
  week: number;
}

export interface MonthlyRecord {
  month: number;
  plans: PlanItem[];
}

export interface BusinessActivity {
  id: string;
  content: string;
  status: 'ongoing' | 'completed' | 'delayed';
  date: string;
  monthlyRecords?: MonthlyRecord[];
}

export interface KPI {
  id:string;
  name: string;
  target: number;
  current: number;
  unit: string;
  activities?: BusinessActivity[];
}

export interface Tenant {
  id: string;
  name: string;
  usage: string; 
  area: number;  
  floor: number; 
  status: 'occupied' | 'vacant' | 'public';
}

export interface Facility {
  id: string;
  category: string;
  name: string;
  area?: number;
  ratio?: number;
  content?: string;
  buildingArea?: number;
  bcr?: number;
  gfa?: number;
  far?: number;
  usage?: string;
  height?: string;
  notes?: string;
}

// 지도에 표시될 새로운 노드(마커)를 위한 타입 정의 (id를 string으로 변경)
export interface HotSpot {
  id: string;
  position: LatLngExpression;
  facilityId: string;
  facilityName: string;
  responseType: '정기' | '긴급';
  riskLevel: 'Level 1 (낮음)' | 'Level 2 (중간)' | 'Level 3 (높음)';
  details: string;
}

export type StateUpdater<T> = React.Dispatch<React.SetStateAction<T>>;
