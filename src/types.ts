
import { LatLngExpression } from 'leaflet';
import React from 'react';

// Base data structures
export interface IProjectData {
  safetyKPIs: KPI[];
  leaseKPIs: KPI[];
  assetKPIs: KPI[];
  infraKPIs: KPI[];
  hotspots: HotSpot[];
  facilities: Facility[];
  complexFacilities: ComplexFacility[];
  teamMembers: TeamMember[];
  units: Unit[];
  tenantInfo: TenantInfo[];
  contracts: Contract[];
  attachments: Attachment[];
  generalActivities: GeneralActivity[];
  customTabs: CustomTab[];
  monthly_reports: MonthlyReport[];
  rentalHistory: RentalHistory[];
  evaluationResults: EvaluationResult[];
}

export interface NavigationState {
  menuKey: string;
  selectedMonth: number;
}

// KPI and related items
export interface KPI {
  id: string;
  title: string;
  description: string;
  current: number;
  target: number;
  previous: number;
  unit: string;
  activities: Activity[];
}

export interface Activity {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: string;
  tasks: Task[];
}

export interface Task {
  id: string;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  status: string;
  assignees: TeamMember[];
  records: TaskRecord[];
  comments: Comment[];
}

export interface TaskRecord {
  id: string;
  date: string;
  content: string;
}

export interface Comment {
  id: string;
  author: string;
  timestamp: string;
  content: string;
}

export interface GeneralActivity {
  id: string;
  date: string;
  author: string;
  category: string;
  content: string;
  createdAt?: string;
  title?: string;
  type?: 'generalActivity';
}

// Spatial and facility types
export interface HotSpot {
  id: string;
  position: LatLngExpression;
  facilityId: string;
  facilityName: string;
  responseType: '정기' | '긴급';
  riskLevel: 'Level 1 (낮음)' | 'Level 2 (중간)' | 'Level 3 (높음)';
  details: string;
  createdAt?: string;
  title?: string;
  type?: 'hotspot';
}

export interface Facility {
  id: string;
  category: string;
  name: string;
  area?: number;
  ratio?: number;
}

export interface ComplexFacility {
    id: string;
    name: string;
    type: string;
    location: string;
    area: number;
    description: string;
}

// Team and Tenant Management
export interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatarUrl: string;
}

export interface Unit {
    id: string;
    floor: number;
    unit_number: string;
    area_sqm: number;
    status: 'occupied' | 'vacant' | 'notice';
    usage: string;
}

export interface EnrichedUnit extends Unit {
    tenant?: TenantInfo;
    contract?: Contract;
}

export type CompanySize = '대기업' | '중견' | '중소' | '스타트업';
export type BusinessCategory = '의료' | '교육' | '연구' | '근생' | '기타';
export type AcquisitionChannel = '직접 유치' | '유관기관 소개' | '온라인' | '기타';

export interface TenantInfo {
    id: string;
    companyName: string;
    businessRegistrationNumber: string;
    representativeName: string;
    contact: string;
    businessCategory: BusinessCategory;
    companySize: CompanySize;
    businessDescription: string;
    acquisitionChannel: AcquisitionChannel;
}

export interface Contract {
    id: string;
    tenantId: string;
    unitId: string;
    startDate: string;
    endDate: string;
    deposit: number;
    rent: number;
    status?: 'active' | 'expired' | 'pending' | 'unknown';
}

export interface Attachment {
    id: string;
    tenantId: string;
    fileName: string;
    url: string;
    uploadedAt: string;
}

// Reporting and History
export interface MonthlyReport {
  id: string;
  year: number;
  month: number;
  report_date: string;
  raw_data: any;
}

export interface RentalHistory {
    id: string;
    year: number;
    rentable_area: number;
    leased_area: number;
    occupancy_rate: number;
    created_at: string;
}

export interface EvaluationResult {
    id: string;
    kpiId: string;
    date: string;
    score: number;
    rating: number;
}

// UI and other types
export interface CustomTab {
  key: string;
  label: string;
  color: 'orange' | 'blue' | 'emerald' | 'purple';
}
