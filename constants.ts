
import { Facility, InspectionLog, InspectionType, SeverityLevel, TaskKPI, LogStatus, ComplexFacility, InspectionItem } from './types';

/**
 * 이미지 기반 초기 점검 항목 데이터 (법정검사, 긴급점검 추가)
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
  { id: 'CF02', categoryName: '공공편익시설', content: '보행자전용도로', totalArea: '7,670', buildingArea: '-', bcr: '-', floorArea: '-', far: '-', usage: '-', height: '-' },
  { id: 'CF03', categoryName: '공공편익시설', content: '중앙관리센터', totalArea: '11,743', buildingArea: '4,267.51', bcr: '36.34', floorArea: '9,000.00', far: '76.64', usage: '업무시설, 근린생활시설', height: '12m(3층)이하' },
  { id: 'CF04', categoryName: '공공편익시설', content: '주민지원시설', totalArea: '1,038', buildingArea: '400.00', bcr: '38.54', floorArea: '1,200.00', far: '115.61', usage: '업무시설, 근린생활시설', height: '마을회관' },
  { id: 'CF05', categoryName: '공공편익시설', content: '오수중계펌프장', totalArea: '749', buildingArea: '-', bcr: '-', floorArea: '-', far: '-', usage: '-', height: '-' },
  { id: 'CF06', categoryName: '공공편익시설', content: '공용주차장', totalArea: '25,074', buildingArea: '-', bcr: '-', floorArea: '-', far: '-', usage: '-', height: '-' },
  { id: 'CF07', categoryName: '공공편익시설', content: '저류지', totalArea: '50,030', buildingArea: '-', bcr: '-', floorArea: '-', far: '-', usage: '-', height: '-' },
  { id: 'CF08', categoryName: '공공편익시설', content: '가압장', totalArea: '150', buildingArea: '-', bcr: '-', floorArea: '-', far: '-', usage: '-', height: '-' },
  { id: 'CF09', categoryName: '공공편익시설', content: '배수지', totalArea: '5,206', buildingArea: '-', bcr: '-', floorArea: '-', far: '-', usage: '-', height: '-' },
  { id: 'CF10', categoryName: '공공편익시설', content: '광장', totalArea: '30,790', buildingArea: '-', bcr: '-', floorArea: '-', far: '-', usage: '-', height: '-' },
  { id: 'CF11', categoryName: '숙박시설', content: '휴양콘도미니엄1', totalArea: '30,474', buildingArea: '9,334.82', bcr: '30.63', floorArea: '36,922.55', far: '121.16', usage: '숙박시설, 근린생활시설', height: '12m(4층)이하' },
  { id: 'CF12', categoryName: '숙박시설', content: '휴양콘도미니엄2', totalArea: '35,274', buildingArea: '10,498.44', bcr: '29.76', floorArea: '41,315.32', far: '117.13', usage: '숙박시설, 근린생활시설', height: '-' },
  { id: 'CF13', categoryName: '숙박시설', content: '텔라소리조트', totalArea: '87,334', buildingArea: '17,922.25', bcr: '20.52', floorArea: '30,267.78', far: '34.66', usage: '숙박시설, 근린생활시설', height: '12m(3층)이하' },
  { id: 'CF14', categoryName: '숙박시설', content: '리타이어먼트 커뮤니티', totalArea: '115,471', buildingArea: '10,000.00', bcr: '8.66', floorArea: '29,000.00', far: '25.11', usage: '숙박시설, 근린생활시설', height: '-' },
  { id: 'CF15', categoryName: '숙박시설', content: '롱텀케어타운', totalArea: '87,426', buildingArea: '7,000.00', bcr: '8.01', floorArea: '21,000.00', far: '24.02', usage: '숙박시설, 근린생활시설', height: '-' },
  { id: 'CF16', categoryName: '숙박시설', content: '힐링스파이럴호텔', totalArea: '25,145', buildingArea: '10,209.75', bcr: '40.60', floorArea: '22,115.16', far: '87.95', usage: '숙박시설, 판매시설, 근린생활시설', height: '20m(5층)이하' },
  { id: 'CF17', categoryName: '숙박시설', content: '힐링타운', totalArea: '27,504', buildingArea: '6,602.32', bcr: '24.00', floorArea: '14,492.22', far: '52.69', usage: '관광휴게시설, 숙박시설, 위락시설', height: '12m(3층)이하' },
  { id: 'CF18', categoryName: '상가시설', content: '웰니스몰1', totalArea: '12,475', buildingArea: '5,590.00', bcr: '44.81', floorArea: '11,700.00', far: '93.79', usage: '근린생활시설, 판매시설', height: '15m(4층)이하' },
  { id: 'CF19', categoryName: '상가시설', content: '웰니스몰2', totalArea: '2,360', buildingArea: '1,055.00', bcr: '44.70', floorArea: '2,000.00', far: '84.75', usage: '근린생활시설, 판매시설', height: '-' },
  { id: 'CF20', categoryName: '상가시설', content: '웰니스몰3', totalArea: '7,416', buildingArea: '3,338.00', bcr: '45.01', floorArea: '9,300.00', far: '125.40', usage: '근린생활시설, 판매시설', height: '-' },
  { id: 'CF21', categoryName: '상가시설', content: '웰니스몰8', totalArea: '9,978', buildingArea: '5,620.00', bcr: '56.32', floorArea: '12,900.00', far: '129.28', usage: '근린생활시설, 판매시설', height: '20m(4층)이하' },
  { id: 'CF22', categoryName: '운동오락시설', content: '워터파크', totalArea: '15,197', buildingArea: '4,000.00', bcr: '26.32', floorArea: '16,000.00', far: '105.28', usage: '위락시설, 근린생활시설', height: '12m(4층)이하' },
  { id: 'CF23', categoryName: '운동오락시설', content: '재활훈련센터', totalArea: '31,897', buildingArea: '4,000.00', bcr: '12.54', floorArea: '12,000.00', far: '37.62', usage: '의료시설, 운동시설, 근린생활시설', height: '12m(3층)이하' },
  { id: 'CF24', categoryName: '기타시설', content: '헬스케어센터', totalArea: '15,737', buildingArea: '6,000.00', bcr: '38.13', floorArea: '30,000.00', far: '190.63', usage: '의료시설, 근린생활시설', height: '15m(5층)이하' },
  { id: 'CF25', categoryName: '기타시설', content: '전문병원', totalArea: '63,354', buildingArea: '7,000.00', bcr: '11.05', floorArea: '28,000.00', far: '44.20', usage: '의료시설, 근린생활시설', height: '12m(4층)이하' },
  { id: 'CF26', categoryName: '기타시설', content: '메디컬스트리트1', totalArea: '6,236', buildingArea: '2,410.00', bcr: '38.65', floorArea: '6,780.00', far: '108.72', usage: '의료시설, 근린생활시설', height: '15m(3층)이하' },
  { id: 'CF27', categoryName: '기타시설', content: '의료R&D센터', totalArea: '22,659', buildingArea: '7,975.80', bcr: '35.20', floorArea: '24,655.00', far: '108.81', usage: '의료시설, 교육연구시설, 근린생활시설', height: '15m(4층)이하' },
  { id: 'CF28', categoryName: '녹지', content: '경관녹지', totalArea: '395,413', buildingArea: '-', bcr: '-', floorArea: '-', far: '-', usage: '-', height: '-' },
  { id: 'CF29', categoryName: '녹지', content: '완충녹지', totalArea: '108,250', buildingArea: '-', bcr: '-', floorArea: '-', far: '-', usage: '-', height: '-' },
];

export const MOCK_FACILITIES: Facility[] = [
  { id: 'F1', name: '메인 수변전설비', area: '전기실 A (전문병원)', lastInspectionDate: '2024-01-10', cycleMonths: 6, nextInspectionDate: '2024-07-10', category: 'Electrical' },
  { id: 'F2', name: '1호기 승강기', area: '웰니스몰 1동', lastInspectionDate: '2024-05-01', cycleMonths: 1, nextInspectionDate: '2024-06-01', category: 'Elevator' },
  { id: 'F3', name: '지하 소화펌프', area: '메디컬스트리트 B2', lastInspectionDate: '2024-02-15', cycleMonths: 3, nextInspectionDate: '2024-05-15', category: 'Fire' },
  { id: 'F4', name: '공조기 AHU-01', area: '리타이어먼트 커뮤니티', lastInspectionDate: '2023-12-01', cycleMonths: 12, nextInspectionDate: '2024-12-01', category: 'HVAC' },
  { id: 'F5', name: '외벽 지지구조물', area: '텔라소리조트 외벽', lastInspectionDate: '2023-06-01', cycleMonths: 24, nextInspectionDate: '2025-06-01', category: 'Structural' },
];

export const MOCK_LOGS: InspectionLog[] = [
  { id: 'L1', facilityId: 'F3', complexFacilityId: 'CF26', type: InspectionType.REACTIVE, severity: SeverityLevel.HIGH, status: LogStatus.ACTIVE, x: 78, y: 72, description: '메디컬 스트리트 구역 소화펌프 누수 및 기동 불량 긴급 수리.', timestamp: '2024-05-20T10:30:00Z', leadTimeHours: 4, responder: '기계팀 A조', distanceToResponder: '45m' },
  { id: 'L2', facilityId: 'F1', complexFacilityId: 'CF25', type: InspectionType.PLANNED, severity: SeverityLevel.LOW, status: LogStatus.RESOLVED, x: 60, y: 48, description: '전문병원 본관 변압기 정기 점검 및 절연유 측정.', timestamp: '2024-05-19T09:00:00Z', leadTimeHours: 1, responder: '전기팀 B조', distanceToResponder: '120m' },
  { id: 'L3', facilityId: 'F2', complexFacilityId: 'CF18', type: InspectionType.REACTIVE, severity: SeverityLevel.MEDIUM, status: LogStatus.ACTIVE, x: 45, y: 65, description: '웰니스몰 중앙 승강기 도어 센서 오작동 보수.', timestamp: '2024-05-18T14:20:00Z', leadTimeHours: 2, responder: '유지보수협력업체', distanceToResponder: '80m' },
];

export const MOCK_KPI_DATA: TaskKPI[] = [
  { id: 'K1', mainCategory: '의료서비스센터', subCategory: '입주유치', unitTask: '전략마케팅: 유치 대상 기관 발굴', kpi: '유효 DB확보 건 수', criteria: '연락처가 확보된 신규 리스트 수', cycle: '월', manager: '변경남' },
  { id: 'K4', mainCategory: '의료서비스센터', subCategory: '시설운영', unitTask: '유지관리: 정기 안전검사 및 평가', kpi: '이행률', criteria: '점검 계획 대비 이행 100% 수행여부', cycle: '월', manager: '양형준' },
];

const svgSource = `
<svg width="800" height="600" viewBox="0 0 800 600" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="50" y="50" width="700" height="500" rx="10" stroke="#cbd5e1" stroke-width="2" stroke-dasharray="8 4"/>
  <rect x="350" y="200" width="150" height="200" stroke="#4f46e5" stroke-width="2" fill="#4f46e508"/>
  <text x="360" y="225" fill="#4f46e5" font-family="sans-serif" font-size="10" font-weight="bold">메인 병동 블록</text>
  <circle cx="200" cy="300" r="80" stroke="#6366f1" stroke-width="2" fill="#6366f105"/>
  <text x="140" y="210" fill="#6366f1" font-family="sans-serif" font-size="10" font-weight="bold">웰니스몰 구역</text>
  <rect x="550" y="80" width="180" height="120" stroke="#64748b" stroke-width="1.5"/>
  <text x="560" y="105" fill="#64748b" font-family="sans-serif" font-size="10" font-weight="bold">실버 커뮤니티</text>
  <rect x="580" y="380" width="150" height="150" stroke="#4f46e5" stroke-width="1.5"/>
  <text x="590" y="550" fill="#4f46e5" font-family="sans-serif" font-size="10" font-weight="bold">메디컬 스트리트</text>
</svg>
`.trim();

export const MAP_IMAGE_URL = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgSource)}`;
