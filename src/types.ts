export interface Comment {
    id: string;
    author: string;
    timestamp: string;
    content: string;
}

export interface TaskRecord {
    id: string;
    date: string;
    status: string;
    comment: string;
}

export interface Task {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    status: string;
    assignees: string[];
    records: TaskRecord[];
    comments: Comment[];
}

export interface Activity {
    id: string;
    name: string;
    status: string;
    tasks: Task[];
    description: string;
    startDate: string;
    endDate: string;
    assignee: string;
}

export interface KPI {
    id: string;
    title: string;
    description: string;
    current: number;
    target: number;
    unit: string;
    previous: number;
    activities: Activity[];
}

export interface HotSpot {
    id: string;
    name: string;
    x: number;
    y: number;
    floor: string;
    type: 'safety' | 'traffic' | 'congestion';
}

export interface Facility {
    id: string;
    name: string;
    type: string;
    location: string;
}

export interface NavigationState {
    menuKey: string;
    selectedKpi?: string;
    selectedActivity?: string;
    selectedTask?: string;
    selectedMonth: number;
}
export interface TenantUnit {
    id: string;
    name: string;
    floor: string;
    area: number;
    status: '입주' | '공실' | '수리중';
    tenantName?: string;
    leaseStartDate?: string;
    leaseEndDate?: string;
    rent?: number;
    facilityId?: string;
    pathData?: string;
}

export interface ComplexFacility {
    id: string;
    name: string;
    type: '주거' | '상업' | '의료' | '기타';
    floorRange: [number, number];
}

export interface TeamMember {
    id: string;
    name: string;
    team: string;
    position: string;
    phone: string;
    email: string;
    avatar?: string;
}

export interface IProjectData {
    safetyKPIs: KPI[];
    leaseKPIs: KPI[];
    assetKPIs: KPI[];
    infraKPIs: KPI[];
    hotspots: HotSpot[];
    facilities: Facility[];
    tenantUnits: TenantUnit[];
    complexFacilities: ComplexFacility[];
    teamMembers: TeamMember[];
}


export type TenantUnitStatus = '입주' | '공실' | '수리중';

export type IncomeCategory = '관리비' | '주차비' | '기타';

export type ExpenseCategory = '공과금' | '수리비' | '인건비' | '마케팅' | '용역비' | '기타';

export interface IncomeItem {
    id: string;
    date: string;
    category: string;
    description: string;
    amount: number;
}

export interface ExpenseItem {
    id: string;
    date: string;
    category: string;
    description: string;
    amount: number;
}
