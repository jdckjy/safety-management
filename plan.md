
# 데이터 모델 통합 리팩토링 실행 계획 (plan.md)

이 문서는 `research.md`에서 분석한 데이터 모델 이중화 문제를 해결하기 위한 구체적인 기술 실행 계획을 정의합니다.

---

## 1단계: 데이터 정규화 (신규 데이터 소스 3종 생성) - ✅ 완료

### 접근 방식 상세설명

현재 모든 정보가 뒤섞여 있는 `src/data/initial-tenant-units.ts` 파일을 기반으로, **'공간(Unit)', '임차인(TenantInfo)', '계약(Contract)'** 정보를 분리하여 3개의 정규화된 데이터 파일을 생성합니다.

1.  `initial-tenant-units.ts`를 순회하며 중복 없는 임차인 목록을 추출하고, 각 임차인에게 고유 ID를 부여하여 `initial-tenants.ts`를 생성합니다.
2.  `initial-tenant-units.ts`의 각 항목을 `Unit` 타입에 맞게 변환하고, 위에서 생성된 임차인 ID를 `tenantId`로 매핑하여 `initial-units.ts`를 생성합니다. (임차인이 없으면 `tenantId`는 `null`이 됩니다.)
3.  임차인이 있는 유닛에 대해서만 `Unit`과 `TenantInfo`를 연결하는 `Contract` 객체를 생성하여 `initial-contracts.ts`를 생성합니다.

### 코드 스니펫 예시

#### A. `initial-tenants.ts` (신규 생성)
```typescript
// 중복을 제거하고 고유 ID를 부여한 임차인 정보
import { TenantInfo } from '../types';

export const initialTenants: TenantInfo[] = [
  {
    id: 'T-001',
    companyName: 'KMI',
    businessRegistrationNumber: '220-82-05115',
    representativeName: '김대표',
    contact: '010-2802-2837',
    businessCategory: '의료',
    companySize: '중견',
  },
  {
    id: 'T-002',
    companyName: 'JDC',
    // ... 기타 정보
  },
  // ... 기타 임차인
];
```

#### B. `initial-units.ts` (신규 생성)
```typescript
// 공간 정보와 임차인 ID를 연결한 유닛 정보
import { Unit } from '../types';

export const initialUnits: Unit[] = [
  {
    id: '1F_KMI_01',
    name: '건강검진센터 1',
    unitNumber: '101',
    floor: 1,
    area_sqm: 744.07,
    status: 'OCCUPIED',
    tenantId: 'T-001', // 'KMI'의 고유 ID
    usage_type: 'Medical',
    pathData: 'M 381, 720 L 587, 720 L 587, 850 L 381, 850 Z',
  },
  {
    id: '2F_CL_02',
    name: '의원 2',
    unitNumber: '202',
    floor: 2,
    area_sqm: 104.49,
    status: 'VACANT',
    tenantId: null, // 공실이므로 null
    usage_type: 'Clinic',
    pathData: 'M 386, 513 L 520, 513 L 520, 584 L 386, 584 Z',
  },
  // ... 모든 유닛
];
```

#### C. `initial-contracts.ts` (신규 생성)
```typescript
import { Contract } from '../types';

export const initialContracts: Contract[] = [
    {
        id: 'C-001',
        tenantId: 'T-001',
        spaceId: '1F_KMI_01', // Unit ID
        spaceName: '건강검진센터 1',
        startDate: '2023-01-01',
        endDate: '2025-12-31',
        area: 744.07,
        deposit: 500000000,
        monthlyRent: 30000000,
    },
    // ... 모든 계약 정보
]
```

### 파일 경로

-   `src/data/initial-tenants.ts`
-   `src/data/initial-units.ts`
-   `src/data/initial-contracts.ts`

### 트레이드오프

-   **장점**: 데이터 정규화를 통해 중복을 제거하고 일관성을 확보하는 가장 확실한 첫 단계입니다.
-   **단점**: 초기 데이터 생성 과정에서 수동 작업이 일부 필요합니다. 레거시 데이터에 계약 시작일, 보증금 등의 정보가 없으므로, 초기에는 임시값(dummy data)으로 채워야 합니다.

---

## 2단계: 데이터 프로바이더 리팩토링 - ✅ 완료

### 접근 방식 상세설명

애플리케이션의 중앙 데이터 공급자인 `ProjectDataProvider`를 수정하여 레거시 `tenantUnits` 대신 새로 만든 3개의 정규화된 데이터를 사용하도록 변경합니다.

-   `ProjectDataProvider.tsx`에서 `initialTenantUnits`를 가져오는 import 구문을 제거합니다.
-   `initialUnits`, `initialTenants`, `initialContracts`를 import 하도록 수정합니다.
-   `useState`를 사용하여 `units`, `tenants`, `contracts`를 상태로 관리하고, 이를 `ProjectDataContext`의 `value`로 제공합니다.

### 코드 스니펫 예시

```typescript
// src/providers/ProjectDataProvider.tsx

import { initialUnits } from '../data/initial-units';
import { initialTenants } from '../data/initial-tenants';
import { initialContracts } from '../data/initial-contracts';
// 제거: import { initialTenantUnits } from '../data/initial-tenant-units';

// ...

export const ProjectDataProvider: React.FC<ProjectDataProviderProps> = ({ children }) => {
  // 새로운 데이터 상태
  const [units, setUnits] = useState<Unit[]>(initialUnits);
  const [tenants, setTenants] = useState<TenantInfo[]>(initialTenants);
  const [contracts, setContracts] = useState<Contract[]>(initialContracts);

  // 제거: const [tenantUnits, setTenantUnits] = useState<TenantUnit[]>(initialTenantUnits);

  // ... (데이터 수정/삭제 함수들도 모두 새로운 상태를 바라보도록 수정)

  const contextValue = {
    units,
    tenants,
    contracts,
    // ... (수정된 함수들)
    // 제거: tenantUnits,
  };

  return (
    <ProjectDataContext.Provider value={contextValue}>
      {children}
    </ProjectDataContext.Provider>
  );
};
```

### 파일 경로

-   `src/providers/ProjectDataProvider.tsx`

### 트레이드오프

-   **장점**: 앱의 데이터 공급원을 단일화하고 깨끗한 데이터 흐름의 기반을 마련합니다.
-   **단점**: 이 변경사항을 적용하는 순간, 기존 `tenantUnits`를 사용하던 모든 컴포넌트(`TenantRoster` 등)에서 오류가 발생합니다. 이는 계획된 과정이며, 다음 3단계에서 해결해야 할 문제입니다.

---

## 3단계: 'Tenant Roster' 기능 전면 리팩토링

### 접근 방식 상세설명

레거시 데이터에 가장 깊이 의존하고 있는 `TenantRoster`와 그 하위 컴포넌트들을 새로운 데이터 모델에 맞게 전면 수정합니다.

-   `TenantRoster.tsx`에서 `useProjectData`를 통해 `tenantUnits` 대신 `units`, `tenants`, `contracts`를 가져옵니다.
-   층별 유닛을 필터링할 때는 `units` 상태를 사용합니다.
-   `UnitDetailPanel`에 정보를 전달할 때, 선택된 `unit` 객체와, 그 `unit.tenantId`를 이용해 `tenants`와 `contracts` 배열에서 찾은 관련 정보를 함께 전달합니다.
-   `useMemo`를 사용하여 ID 기반 조회 성능을 최적화할 수 있습니다. (예: `tenantMap`, `contractMap` 생성)

### 코드 스니펫 예시

```typescript
// src/features/tenant-roster/TenantRoster.tsx

const TenantRoster: React.FC = () => {
  // 데이터 공급 방식 변경
  const { units, tenants, contracts } = useProjectData();
  // 제거: const { tenantUnits } = useProjectData();

  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);

  // 맵을 생성하여 조회 성능 최적화
  const tenantMap = useMemo(() => new Map(tenants.map(t => [t.id, t])), [tenants]);
  const contractMap = useMemo(() => new Map(contracts.map(c => [c.spaceId, c])), [contracts]);

  // 로직 수정: `units` 데이터를 기반으로 필터링
  const unitsOnSelectedFloor = useMemo(() => 
    units.filter(u => u.floor === selectedFloor),
    [units, selectedFloor]
  );

  // 로직 수정: 선택된 유닛과 관련 데이터를 모두 찾음
  const selectedUnitData = useMemo(() => {
    if (!selectedUnitId) return null;
    const unit = units.find(u => u.id === selectedUnitId);
    if (!unit) return null;

    const tenant = unit.tenantId ? tenantMap.get(unit.tenantId) : null;
    const contract = contractMap.get(unit.id); // unit.id가 spaceId와 같다고 가정

    return { unit, tenant, contract };
  }, [selectedUnitId, units, tenantMap, contractMap]);


  return (
    // ...
    <div className="md:col-span-2 ...">
      {/* FloorPlan은 이제 순수한 Unit[] 데이터만 받음 */}
      <FloorPlan 
         units={unitsOnSelectedFloor}
         // ...
       />
    </div>

    <div className="md:col-span-1 ...">
      {selectedUnitData ? (
        // UnitDetailPanel에 정규화된 데이터를 각각 전달
        <UnitDetailPanel 
          unit={selectedUnitData.unit} 
          tenant={selectedUnitData.tenant}
          contract={selectedUnitData.contract}
          // ...
        />
      ) : ( /* ... */ )}
    </div>
    // ...
  );
};
```

### 파일 경로

-   `src/features/tenant-roster/TenantRoster.tsx`
-   `src/features/tenant-roster/UnitDetailPanel.tsx`
-   `src/features/tenant-roster/FloorPlan.tsx`

### 트레이드오프

-   **장점**: 시스템에서 가장 복잡하고 비효율적인 부분을 근본적으로 해결하여 데이터 일관성을 확보합니다.
-   **단점**: 리팩토링의 핵심이자 가장 많은 코드 수정이 필요한 단계입니다. 컴포넌트 내에서 `unit`, `tenant`, `contract` 데이터를 조합하는 로직이 추가되어 초기 복잡성이 다소 증가할 수 있습니다.

---

## 4단계: 레거시 코드 제거 및 최종 검증

### 접근 방식 상세설명

모든 기능이 새로운 데이터 모델을 성공적으로 사용하고 있음을 확인한 후, 프로젝트에 남아있는 레거시 코드의 흔적을 완전히 제거하여 리팩토링을 마무리합니다.

1.  `src/data/initial-tenant-units.ts` 파일을 물리적으로 삭제합니다.
2.  `src/types.ts` 파일을 열어 `TenantUnit` 타입과 관련 타입(`TenantUnitStatus`) 정의를 삭제합니다.
3.  애플리케이션을 전체적으로 테스트하며 '임대 및 세대 관리'와 'Tenant Roster' 기능이 동일한 데이터를 기반으로 완벽하게 연동되는지 최종 검증합니다.

### 코드 스니펫 예시

```typescript
// src/types.ts 에서 아래 내용을 완전히 삭제

/**
 * @interface TenantUnit
 * @description 개별 임대 공간(호실)의 정보를 정의합니다. (Legacy)
 */
export interface TenantUnit {
    id: string;
    floor: string;
    name: string;
    tenant: string;
    area: number;
    status: TenantUnitStatus;
    // ... 이하 모든 속성
}

export type TenantUnitStatus = 'OCCUPIED' | 'VACANT' | 'IN_DISCUSSION' | 'NON_RENTABLE';
```

### 파일 경로

-   `src/data/initial-tenant-units.ts` (삭제)
-   `src/types.ts` (수정)

### 트레이드오프

-   **장점**: 프로젝트에서 기술 부채를 완전히 청산하고, 향후 새로운 개발자가 코드를 이해하기 쉬운 깨끗한 상태로 만듭니다.
-   **단점**: 되돌릴 수 없는 작업이므로, 이전 단계의 기능 검증이 완벽하게 이루어졌다는 확신이 있을 때만 수행해야 합니다.
