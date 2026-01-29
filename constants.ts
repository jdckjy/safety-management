
import { Facility, InspectionLog, InspectionType, SeverityLevel, TaskKPI, LogStatus, ComplexFacility, InspectionItem } from './types';

/**
 * 이미지 기반 초기 점검 항목 데이터
 */
export const INITIAL_INSPECTION_ITEMS: InspectionItem[] = [
  { id: 'II01', classification: '정기점검', target: '전기설비', cycle: '일일', remarks: '수변전실 육안 점검' },
  { id: 'II02', classification: '정기점검', target: '승강기점검', cycle: '일일', remarks: '주요 층 호출 확인' },
  { id: 'II_LEG_01', classification: '법정검사', target: '소방시설 종합정밀점검', cycle: '연 1회', remarks: '관할 소방서 보고 필' },
  { id: 'II_LEG_02', classification: '법정검사', target: '승강기 정기검사', cycle: '연 1회', remarks: '승강기안전공단' },
  { id: 'II_URG_01', classification: '긴급점검', target: '폭우 대비 배수구', cycle: '강수 예보시', remarks: '범람 방지' },
  { id: 'II09', classification: '특별점검', target: '태풍, 장마', cycle: '6월-8월', remarks: '수해 대책 기간' },
  { id: 'II10', classification: '특별점검', target: '월동기', cycle: '11월-1월', remarks: '동파 방지 및 제설' },
];

/**
 * 실시계획인가 세부시설 결정조서 기반 데이터 (단지 내 시설정보)
 */
export const COMPLEX_FACILITY_LIST: ComplexFacility[] = [
  { id: 'CF01', categoryName: '공공편익시설', content: '도로', totalArea: '160,666', buildingArea: '-', bcr: '-', floorArea: '-', far: '-', usage: '-', height: '-' },
  { id: 'CF03', categoryName: '공공편익시설', content: '중앙관리센터', totalArea: '11,743', buildingArea: '4,267.51', bcr: '36.34', floorArea: '9,000.00', far: '76.64', usage: '업무시설, 근린생활시설', height: '12m(3층)이하' },
  { id: 'CF24', categoryName: '기타시설', content: '헬스케어센터', totalArea: '15,737', buildingArea: '6,000.00', bcr: '38.13', floorArea: '30,000.00', far: '190.63', usage: '의료시설, 근린생활시설', height: '15m(5층)이하' },
  { id: 'CF25', categoryName: '기타시설', content: '전문병원', totalArea: '63,354', buildingArea: '7,000.00', bcr: '11.05', floorArea: '28,000.00', far: '44.20', usage: '의료시설, 근린생활시설', height: '12m(4층)이하' },
  { id: 'CF27', categoryName: '기타시설', content: '의료R&D센터', totalArea: '22,659', buildingArea: '7,975.80', bcr: '35.20', floorArea: '24,655.00', far: '108.81', usage: '의료시설, 교육연구시설, 근린생활시설', height: '15m(4층)이하' },
];

export const MOCK_FACILITIES: Facility[] = [
  { id: 'F1', name: '메인 수변전설비', area: '전기실 A (전문병원)', lastInspectionDate: '2024-01-10', cycleMonths: 6, nextInspectionDate: '2024-07-10', category: 'Electrical' },
  { id: 'F2', name: '1호기 승강기', area: '웰니스몰 1동', lastInspectionDate: '2024-05-01', cycleMonths: 1, nextInspectionDate: '2024-06-01', category: 'Elevator' },
  { id: 'F3', name: '지하 소화펌프', area: '메디컬스트리트 B2', lastInspectionDate: '2024-02-15', cycleMonths: 3, nextInspectionDate: '2024-05-15', category: 'Fire' },
];

export const MOCK_LOGS: InspectionLog[] = [
  { id: 'L1', facilityId: 'F3', complexFacilityId: 'CF25', type: InspectionType.REACTIVE, severity: SeverityLevel.HIGH, status: LogStatus.ACTIVE, x: 78, y: 72, description: '메디컬 스트리트 소화펌프 누수 대응.', timestamp: '2024-05-20T10:30:00Z', leadTimeHours: 4, responder: '기계팀', distanceToResponder: '45m' },
];

/**
 * PDF 3페이지 데이터 기반 2026 KPI 설정
 */
export const MOCK_KPI_DATA: TaskKPI[] = [
  { id: 'K1', mainCategory: '의료서비스센터', subCategory: '입주유치', unitTask: '전략마케팅: 유치 대상 기관 발굴/DB 구축', kpi: '유효 DB확보 건 수', criteria: '연락처가 확보된 신규 리스트 수', cycle: '월', manager: '변경남' },
  { id: 'K2', mainCategory: '의료서비스센터', subCategory: '입주유치', unitTask: '전략마케팅: 잠재 유치고객 1:1 제안', kpi: 'LOI 확보 수', criteria: '공식 접수된 입주의향서(LOI) 수', cycle: '분기', manager: '변경남' },
  { id: 'K3', mainCategory: '의료서비스센터', subCategory: '입주유치', unitTask: '홍보마케팅: 유치 설명회/홍보부스 운영', kpi: '잠재고객 유입량', criteria: '입주문의 및 상담신청 건 수', cycle: '분기', manager: '이혜미' },
  { id: 'K4', mainCategory: '의료서비스센터', subCategory: '입주유치', unitTask: '홍보마케팅: 홍보관 운영 및 시설 투어', kpi: '투어 전환율', criteria: '(상담 후 시설투어 건 수/전체상담 건 수)X100', cycle: '월', manager: '이혜미' },
  { id: 'K5', mainCategory: '의료서비스센터', subCategory: '운영전반', unitTask: '공모: 잔여시설 공모계획 수립 및 선정', kpi: '공모 절차 적기 이행', criteria: '공모 계획 대비 일정 및 절차 준수 여부', cycle: '발생 시', manager: '임혜리' },
  { id: 'K6', mainCategory: '의료서비스센터', subCategory: '운영전반', unitTask: '운영관리: 입주기업 임대관리 지침 관리', kpi: '지침 현행화율', criteria: '(점검·개정 완료 횟수/계획 횟수)X100', cycle: '분기', manager: '임혜리' },
  { id: 'K7', mainCategory: '의료서비스센터', subCategory: '운영전반', unitTask: '협력지원: 입주기업 공동협의체 운영', kpi: '협의체 운영율', criteria: '협의체 운영계획 대비 실제 이행율', cycle: '분기', manager: '이혜미' },
  { id: 'K8', mainCategory: '의료서비스센터', subCategory: '시설운영', unitTask: '유지관리: 정기하자/안전검사 및 평가', kpi: '이행률', criteria: '점검 계획 대비 이행 100% 수행여부', cycle: '월', manager: '양형준' },
  { id: 'K9', mainCategory: '의료서비스센터', subCategory: '시설운영', unitTask: '시설물관리: 법정검사(소방/승강기 등)', kpi: '이행률', criteria: '점검 계획 대비 이행 100% 수행여부', cycle: '월', manager: '양형준' },
  { id: 'K10', mainCategory: '단지전반', subCategory: '단지관리', unitTask: '안전·관리: 단지 전체 정기하자/안전검사', kpi: '이행률', criteria: '점검 계획 대비 이행 100% 수행여부', cycle: '월', manager: '신 별' },
];

const svgSource = `
<svg width="800" height="600" viewBox="0 0 800 600" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="50" y="50" width="700" height="500" rx="10" stroke="#cbd5e1" stroke-width="2" stroke-dasharray="8 4"/>
  <rect x="350" y="200" width="150" height="200" stroke="#4f46e5" stroke-width="2" fill="#4f46e508"/>
  <text x="360" y="225" fill="#4f46e5" font-family="sans-serif" font-size="10" font-weight="bold">메인 병동 블록</text>
  <circle cx="200" cy="300" r="80" stroke="#6366f1" stroke-width="2" fill="#6366f105"/>
  <text x="140" y="210" fill="#6366f1" font-family="sans-serif" font-size="10" font-weight="bold">웰니스몰 구역</text>
  <rect x="580" y="380" width="150" height="150" stroke="#4f46e5" stroke-width="1.5"/>
  <text x="590" y="550" fill="#4f46e5" font-family="sans-serif" font-size="10" font-weight="bold">메디컬 스트리트</text>
</svg>
`.trim();

export const MAP_IMAGE_URL = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgSource)}`;
