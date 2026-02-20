
import { IAppData, Building, Lead, Activity, Unit } from './types';

// [✅ 최종 수정] buildings를 객체가 아닌 '배열'로 수정하여 flatMap 에러를 근본적으로 해결합니다.
const buildings: Building[] = [
  {
    id: 'medical-service-center',
    name: '의료서비스센터',
    total_area_sqm: 0, 
    floors: [
        { level: 1, name: '지상 1층', total_area_sqm: 1127.59, floor_plan_url: '/floor-plan-1f.png' },
        { level: 2, name: '지상 2층', total_area_sqm: 1780.18, floor_plan_url: '/floor-plan-2f.png' },
        { level: 3, name: '지상 3층', total_area_sqm: 1545.14, floor_plan_url: '/floor-plan-3f.png' },
    ],
    units: [
        // --- 1층 ---
        { id: 'MSC-1F-01', floor: 1, area_sqm: 744.07, status: 'occupied', tenant_name: 'KMI', usage_type: 'Office', position_x: 0, position_y: 0 },
        { id: 'MSC-1F-02', floor: 1, area_sqm: 274.05, status: 'occupied', tenant_name: 'KMI', usage_type: 'Facility', position_x: 0, position_y: 0 },
        { id: 'MSC-1F-03', floor: 1, area_sqm: 70.47, status: 'occupied', tenant_name: 'KMI', usage_type: 'Office', position_x: 0, position_y: 0 },
        { id: 'MSC-1F-04', floor: 1, area_sqm: 39.00, status: 'occupied', tenant_name: 'JDC', usage_type: 'Office', position_x: 0, position_y: 0 },
        // --- 2층 ---
        { id: 'MSC-2F-01', floor: 2, area_sqm: 783.04, status: 'occupied', tenant_name: 'KMI', usage_type: 'Clinic', position_x: 0, position_y: 0 },
        { id: 'MSC-2F-02', floor: 2, area_sqm: 104.49, status: 'occupied', tenant_name: 'KMI', usage_type: 'Clinic', position_x: 0, position_y: 0 },
        { id: 'MSC-2F-03', floor: 2, area_sqm: 104.49, status: 'vacant', tenant_name: null, usage_type: 'Clinic', position_x: 0, position_y: 0 },
        { id: 'MSC-2F-04', floor: 2, area_sqm: 104.49, status: 'vacant', tenant_name: null, usage_type: 'Clinic', position_x: 0, position_y: 0 },
        { id: 'MSC-2F-05', floor: 2, area_sqm: 204.20, status: 'vacant', tenant_name: null, usage_type: 'Clinic', position_x: 0, position_y: 0 },
        { id: 'MSC-2F-06', floor: 2, area_sqm: 104.49, status: 'occupied', tenant_name: '치과의원', usage_type: 'Clinic', position_x: 0, position_y: 0 },
        { id: 'MSC-2F-07', floor: 2, area_sqm: 104.49, status: 'vacant', tenant_name: null, usage_type: 'Clinic', position_x: 0, position_y: 0 },
        { id: 'MSC-2F-08', floor: 2, area_sqm: 104.49, status: 'occupied', tenant_name: 'KMI', usage_type: 'Clinic', position_x: 0, position_y: 0 },
        { id: 'MSC-2F-09', floor: 2, area_sqm: 66.00, status: 'occupied', tenant_name: 'KMI', usage_type: 'Cafe', position_x: 0, position_y: 0 },
        { id: 'MSC-2F-10', floor: 2, area_sqm: 105.95, status: 'occupied', tenant_name: '평화의 마을', usage_type: 'Cafe', position_x: 0, position_y: 0 },
        // --- 3층 ---
        { id: 'MSC-3F-01', floor: 3, area_sqm: 104.49, status: 'vacant', tenant_name: null, usage_type: 'Clinic', position_x: 0, position_y: 0 },
        { id: 'MSC-3F-02', floor: 3, area_sqm: 104.49, status: 'vacant', tenant_name: null, usage_type: 'Clinic', position_x: 0, position_y: 0 },
        { id: 'MSC-3F-03', floor: 3, area_sqm: 104.49, status: 'vacant', tenant_name: null, usage_type: 'Clinic', position_x: 0, position_y: 0 },
        { id: 'MSC-3F-04', floor: 3, area_sqm: 104.49, status: 'occupied', tenant_name: '한국보건복지인재원', usage_type: 'Office', position_x: 0, position_y: 0 },
        { id: 'MSC-3F-05', floor: 3, area_sqm: 104.49, status: 'occupied', tenant_name: '한국보건복지인재원', usage_type: 'Office', position_x: 0, position_y: 0 },
        { id: 'MSC-3F-06', floor: 3, area_sqm: 104.49, status: 'occupied', tenant_name: '한국보건복지인재원', usage_type: 'Office', position_x: 0, position_y: 0 },
        { id: 'MSC-3F-07', floor: 3, area_sqm: 104.49, status: 'occupied', tenant_name: 'KMI', usage_type: 'Office', position_x: 0, position_y: 0 },
        { id: 'MSC-3F-08', floor: 3, area_sqm: 250.26, status: 'occupied', tenant_name: 'KMI', usage_type: 'Lab', position_x: 0, position_y: 0 },
        { id: 'MSC-3F-09', floor: 3, area_sqm: 31.39, status: 'occupied', tenant_name: 'JDC', usage_type: 'Classroom', position_x: 0, position_y: 0 },
        { id: 'MSC-3F-10', floor: 3, area_sqm: 27.95, status: 'occupied', tenant_name: 'JDC', usage_type: 'Classroom', position_x: 0, position_y: 0 },
        { id: 'MSC-3F-11', floor: 3, area_sqm: 27.95, status: 'occupied', tenant_name: 'JDC', usage_type: 'Classroom', position_x: 0, position_y: 0 },
        { id: 'MSC-3F-12', floor: 3, area_sqm: 32.59, status: 'occupied', tenant_name: 'JDC', usage_type: 'Lab', position_x: 0, position_y: 0 },
        { id: 'MSC-3F-13', floor: 3, area_sqm: 499.66, status: 'occupied', tenant_name: 'JDC', usage_type: 'Convention', position_x: 0, position_y: 0 },
        { id: 'MSC-3F-14', floor: 3, area_sqm: 28.64, status: 'vacant', tenant_name: null, usage_type: 'Lab', position_x: 0, position_y: 0 },
        { id: 'MSC-3F-15', floor: 3, area_sqm: 27.26, status: 'vacant', tenant_name: null, usage_type: 'Lab', position_x: 0, position_y: 0 },
    ],
  },
];

const leads: Lead[] = [
    { id: 'lead-01', name: '스마트 헬스케어 스타트업', required_area: 100, status: 'new' },
    { id: 'lead-02', name: '빅데이터 분석 연구소', required_area: 250, status: 'contacted' },
    { id: 'lead-03', name: 'AI 기반 신약 개발사', required_area: 500, status: 'closed' },
];

const activities: Activity[] = []; // 현재는 비어있음

export const seedData: Partial<IAppData> = {
  buildings,
  leads,
  activities,
};
