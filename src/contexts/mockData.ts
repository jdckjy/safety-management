
import { KPI, Tenant, Facility, HotSpot } from '../types';
import { createKpi } from '../data/factories';

const generateMonthlyRecords = () => Array.from({ length: 12 }, (_, i) => ({
    month: i + 1,
    plans: Math.random() > 0.5 ? [{ id: `plan-${i}`, content: `Monthly check for task ${i+1}`, completed: Math.random() > 0.3 }] : []
}));

export const initialSafetyKPIs: KPI[] = [
    createKpi({
        id: 'kpi-safety-1',
        name: '무재해 일수',
        current: 730,
        target: 1000,
        unit: 'days',
        pulse: { value: 2, trend: 'up' },
        activities: [
            { 
                id: 'act-safety-1', 
                content: '월간 안전 점검', 
                status: 'ongoing', 
                date: '2024-07-01', 
                monthlyRecords: generateMonthlyRecords()
            },
            { 
                id: 'act-safety-2', 
                content: '분기별 소방 훈련', 
                status: 'completed', 
                date: '2024-06-15', 
                monthlyRecords: generateMonthlyRecords()
            },
        ],
    }),
    createKpi({
        id: 'kpi-safety-2',
        name: '안전 교육 이수율',
        current: 98,
        target: 100,
        unit: '%',
        pulse: { value: -0.5, trend: 'down' },
        activities: [
             { 
                id: 'act-safety-3', 
                content: '신규 입사자 안전 교육', 
                status: 'ongoing', 
                date: '2024-07-05', 
                monthlyRecords: generateMonthlyRecords()
            },
        ],
    }),
];

export const initialLeaseKPIs: KPI[] = [
    createKpi({
        id: 'kpi-lease-1',
        name: '공실률',
        current: 3.5,
        target: 2,
        unit: '%',
        activities: [
            { 
                id: 'act-lease-1', 
                content: '신규 임차인 유치 프로모션', 
                status: 'ongoing', 
                date: '2024-07-10', 
                monthlyRecords: generateMonthlyRecords() 
            }
        ],
    }),
     createKpi({
        id: 'kpi-lease-2',
        name: '임대료 수금률',
        current: 99.1,
        target: 99.5,
        unit: '%',
        activities: [],
    }),
];

export const initialAssetKPIs: KPI[] = [
    createKpi({
        id: 'kpi-asset-1',
        name: '자산 가치 총액',
        current: 12.5,
        target: 15,
        unit: '$M',
        activities: [
            { 
                id: 'act-asset-1', 
                content: '자산 리모델링 및 가치 증대 계획', 
                status: 'ongoing', 
                date: '2024-05-20', 
                monthlyRecords: generateMonthlyRecords()
            }
        ],
    }),
];

export const initialInfraKPIs: KPI[] = [
    createKpi({
        id: 'kpi-infra-1',
        name: '인프라 확장 진행률',
        current: 68,
        target: 100,
        unit: '%',
        activities: [
            { 
                id: 'act-infra-1', 
                content: 'A동 증축 공사', 
                status: 'ongoing', 
                date: '2024-02-01', 
                monthlyRecords: generateMonthlyRecords()
            },
            { 
                id: 'act-infra-2', 
                content: '주차 타워 건설', 
                status: 'paused', 
                date: '2024-06-01', 
                monthlyRecords: generateMonthlyRecords() 
            },
        ],
    }),
];

export const initialTenants: Tenant[] = [
    { id: 't1', name: '(주)테크이노', businessType: 'IT/소프트웨어', space: 'A-301, 500㎡', entryDate: '2022-01-15', contact: '02-1234-5678' },
    { id: 't2', name: '글로벌 물류', businessType: '물류/운송', space: 'B-101, 1500㎡', entryDate: '2021-03-20', contact: '031-876-5432' },
];

export const initialFacilities: Facility[] = [
    { id: 'f1', name: '중앙 공조 시스템', type: 'HVAC', location: '통합관리실', status: 'Operational', lastInspection: '2024-07-01' },
    { id: 'f2', name: '비상 발전기 #2', type: 'Power', location: 'B동 지하 2층', status: 'Under Maintenance', lastInspection: '2024-06-20' },
];

export const initialHotspots: HotSpot[] = [
    { 
        id: 'h1', 
        name: '지게차-보행자 동선 충돌', 
        location: 'A동 하역장', 
        type: 'Safety Concern', 
        riskLevel: 'high', 
        lastInspection: '2024-07-15',
        position: { lat: 33.285186, lng: 126.560624 } 
    },
    { 
        id: 'h2', 
        name: '주차장 입구 정체', 
        location: '정문 주차장', 
        type: 'High Traffic', 
        riskLevel: 'medium', 
        lastInspection: '2024-07-20',
        position: { lat: 33.284186, lng: 126.561624 } 
    },
];
