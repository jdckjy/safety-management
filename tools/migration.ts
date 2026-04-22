
import { tenantUnits } from '../src/data/tenantUnits';
import { initialTenantInfo } from '../src/data/initial-tenant-info';
import { Building, Floor, Unit, TenantInfo, Contract, UnitStatus, ContractStatus } from '../src/types';

// tenant 필드를 기반으로 tenantId를 찾아주는 헬퍼 함수
const getTenantId = (tenantName: string): string | null => {
  const tenant = initialTenantInfo.find(t => t.companyName === tenantName);
  if (tenant) return tenant.id;

  // 일치하는 회사가 없는 경우에 대한 처리
  if (tenantName === 'JDC' || tenantName === '(공용)' || tenantName === '(미지정)') return null;
  
  // 예외 케이스 처리 또는 경고
  console.warn(`[Migration] 경고: '${tenantName}'에 해당하는 임차인 정보를 찾을 수 없습니다.`);
  return null;
};

// Legacy TenantUnitStatus를 새로운 UnitStatus로 변환
const mapUnitStatus = (legacyStatus: any): UnitStatus => {
  const statusMap: { [key: string]: UnitStatus } = {
    'OCCUPIED': 'OCCUPIED',
    'VACANT': 'VACANT',
    'IN_DISCUSSION': 'IN_DISCUSSION',
    'NON_RENTABLE': 'NON_RENTABLE',
  };
  return statusMap[legacyStatus] || 'VACANT'; // 기본값은 VACANT
}

// --- 1. Building 데이터 생성 (Unit 중심 통합) ---
const floors: Floor[] = [
  { level: 1, name: '1층', total_area_sqm: 3000, floor_plan_url: '/path/to/1f-plan.svg' },
  { level: 2, name: '2층', total_area_sqm: 3000, floor_plan_url: '/path/to/2f-plan.svg' },
  { level: 3, name: '3층', total_area_sqm: 3000, floor_plan_url: '/path/to/3f-plan.svg' },
];

const allUnits: Unit[] = tenantUnits.map(tu => ({
  id: tu.id,
  name: tu.name,
  unitNumber: tu.unitNumber || tu.id, // unitNumber가 없으면 id를 사용
  floor: parseInt(tu.floor.replace('F', '')),
  area_sqm: tu.area,
  status: mapUnitStatus(tu.status),
  tenantId: getTenantId(tu.tenant),
  usage_type: 'Office', // 기본값 설정, 필요시 수정
  pathData: tu.pathData || '',
}));

const totalArea = allUnits.reduce((sum, unit) => sum + unit.area_sqm, 0);

const building: Building = {
  id: 'main-building',
  name: '의료서비스센터',
  total_area_sqm: parseFloat(totalArea.toFixed(2)),
  floors: floors, // 층별 정보는 우선 기본값으로 생성
  units: allUnits,
};


// --- 2. TenantInfo 데이터 생성 (Contract 포함) ---
const newTenantInfo: TenantInfo[] = initialTenantInfo.map(tenant => {
  // 이 임차인에게 속한 모든 유닛(호실)을 찾는다.
  const associatedUnits = allUnits.filter(unit => unit.tenantId === tenant.id);

  // 각 유닛에 대해 새로운 계약(Contract) 객체를 생성한다.
  const contracts: Contract[] = associatedUnits.map(unit => ({
    id: `contract-${unit.id}`,
    unitId: unit.id,
    startDate: '2023-01-01', // 기본값
    endDate: '2025-12-31',   // 기본값
    deposit: unit.area_sqm * 100000, // 임의 계산
    monthlyRent: unit.area_sqm * 10000, // 임의 계산
    contractStatus: 'ACTIVE', // 기본값
  }));

  return {
    ...tenant,
    contracts: contracts, // 생성된 계약 목록을 추가
  };
});

// --- 3. 결과 출력 ---

console.log('// ******** 생성된 Building 데이터 (initial-building-data.ts) ********');
console.log(`export const initialBuildingData: Building[] = ${JSON.stringify([building], null, 2)};`);

console.log('\n// ******** 생성된 TenantInfo 데이터 (initial-tenant-info-v2.ts) ********');
console.log(`export const initialTenantInfoV2: TenantInfo[] = ${JSON.stringify(newTenantInfo, null, 2)};`);
