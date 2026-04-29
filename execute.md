데이터 모델 리팩토링의 첫 번째 단계로, `src/data/tenantUnits.ts`에 존재하던 비정규화된 데이터를 정규화하여 새로운 파일을 생성합니다.

- **작업 내용:** `tenantUnits.ts`에서 공간(unit) 정보만 추출하여, 순수한 공간 데이터 배열을 담은 `src/data/initial-units.ts` 파일을 생성합니다.
- **영향:** 레거시 데이터 모델(`TenantUnit`)을 새로운 관계형 데이터 모델(`Unit`, `TenantInfo`, `Contract`)로 전환하는 과정의 첫 단추입니다.

---

- **작업 내용:** `tenantUnits.ts`에서 중복된 임차인 정보를 제거하고, 정규화된 임차인 정보(`TenantInfo`) 배열을 담은 `src/data/initial-tenants.ts` 파일을 생성합니다.
- **영향:** 데이터 중복 문제를 해결하고, 임차인 정보를 중앙에서 관리할 수 있는 기반을 마련합니다.

---

- **작업 내용:** `tenantUnits.ts`의 점유 상태(`OCCUPIED`) 데이터를 기반으로, `initial-units.ts`의 공간과 `initial-tenants.ts`의 임차인을 연결하는 계약 정보(`Contract`) 배열을 담은 `src/data/initial-contracts.ts` 파일을 생성합니다.
- **영향:** 비정규화된 데이터의 마지막 조각을 정규화하여, 관계형 데이터 모델을 완성합니다.

---

- **작업 내용:** `initial-contracts.ts` 파일에서 발생한 타입 오류를 해결하기 위해 `src/types.ts` 파일의 `Contract` 인터페이스에 `unitId` 속성을 추가합니다.
- **영향:** `Contract`와 `Unit`의 관계를 정립하여, 정규화된 데이터 모델의 참조 무결성을 보장합니다.

---

- **작업 내용:** `initial-contracts.ts`와 데이터 모델의 일관성을 맞추기 위해 `src/types.ts`의 `Contract` 인터페이스를 수정합니다. (`spaceId`를 `unitId`로 변경, `spaceName` 제거, `deposit` 및 `monthlyRent`를 선택적 속성으로 변경)
- **영향:** `Contract` 타입을 새로운 데이터 구조에 맞게 업데이트하여 타입 에러를 해결하고 데이터 모델의 일관성을 확보합니다.

---

- **작업 내용:** `src/providers/ProjectDataProvider.tsx`를 리팩토링하여 레거시 `tenantUnits` 데이터 로딩 로직을 제거하고, 새로 생성한 정규화된 데이터 파일들(`initial-units.ts`, `initial-tenants.ts`, `initial-contracts.ts`)을 로드하도록 변경합니다.
- **영향:** 애플리케이션 전역에서 새로운 관계형 데이터 모델을 사용하도록 데이터 흐름의 중심을 변경합니다.

---

- **작업 내용:** `src/types.ts` 파일의 `IProjectData` 인터페이스에 `units` 속성을 추가하고, 더 이상 사용되지 않는 `tenantUnits` 속성을 제거하여 `ProjectDataProvider.tsx`의 타입 오류를 해결합니다.
- **영향:** `ProjectDataProvider`가 새로운 `Unit` 데이터 모델을 정식으로 사용하도록 타입을 업데이트하여, 코드의 안정성과 일관성을 높입니다.

---

- **작업 내용:** 더 이상 사용되지 않는 레거시 데이터 파일인 `src/data/tenantUnits.ts`를 삭제합니다.
- **영향:** 프로젝트에서 레거시 데이터 모델을 완전히 제거하여 코드 베이스를 정리하고 혼란의 여지를 없앱니다.

---

- **작업 내용:** `src/features/tenant-roster/LeaseStatusDashboard.tsx` 컴포넌트가 새로운 데이터 모델(`units`, `contracts`)을 사용하도록 리팩토링합니다. `contracts` 데이터를 기반으로 각 유닛의 점유 상태를 동적으로 계산하고, 이를 차트에 반영합니다.
- **영향:** 대시보드의 핵심 시각화 컴포넌트 중 하나를 새로운 데이터 구조에 맞게 업데이트하여, 애플리케이션의 데이터 일관성을 유지하고 런타임 에러를 방지합니다.

---

- **작업 내용:** `src/features/tenant-roster/TenantRoster.tsx` 컴포넌트가 새로운 데이터 모델(`units`, `tenantInfo`, `contracts`)을 사용하도록 리팩토링합니다. `contracts`를 중심으로 `tenantInfo`와 `units` 정보를 조합하여 임차인 목록을 생성하고 표시합니다.
- **영향:** 애플리케이션의 핵심 기능 중 하나인 임차인 명부 표시 방식을 새로운 데이터 모델에 맞게 업데이트합니다.

---

- **작업 내용:** `src/features/tenant-roster/UnitDetailPanel.tsx` 컴포넌트가 `TenantRoster`에서 전달되는 새로운 `EnrichedUnit` 데이터 타입에 맞게 리팩토링됩니다. 유닛의 점유 상태에 따라 임차인 정보를 표시하거나 '공실' 상태를 명확히 보여주도록 수정합니다.
- **영향:** 유닛 상세 정보 패널이 새로운 데이터 모델과 호환되도록 하여, 사용자에게 정확한 유닛 정보를 제공합니다.

---

- **작업 내용:** `src/features/tenant-roster/FloorPlan.tsx` 컴포넌트가 새로운 `EnrichedUnit` 데이터 타입을 사용하도록 리팩토링됩니다. 각 유닛의 점유 상태(`OCCUPIED` 또는 `VACANT`)에 따라 SVG path의 색상을 동적으로 변경하여 도면의 시각적 정보를 정확하게 표시합니다.
- **영향:** 도면 시각화의 핵심 로직을 새로운 데이터 모델에 맞게 업데이트하여, 사용자에게 현재 임대 현황을 직관적으로 전달합니다.

---

- **작업 내용:** 배포 후 '도면 편집' 기능에서 `Cannot read properties of undefined (reading 'filter')` 에러가 발생했습니다. 원인은 `ProjectDataProvider`에서 `units`와 같은 데이터 배열이 비동기 로딩 과정에서 일시적으로 `undefined`가 되기 때문입니다. 이를 해결하기 위해 `ProjectDataProvider`의 `initialData`와 `cleanData` 생성 로직에서 `units`, `tenantInfo`, `contracts` 등의 배열들이 `undefined` 대신 항상 빈 배열(`[]`)을 기본값으로 갖도록 수정합니다.
- **영향:** 데이터가 로드되기 전이나 Firestore에 데이터가 없는 경우에도 데이터 관련 배열들이 항상 빈 배열로 초기화되도록 보장하여, `.filter`, `.map` 등 배열 메서드 호출 시 발생하는 런타임 에러를 원천적으로 방지하고 애플리케이션의 안정성을 높입니다.

---

- **작업 내용:** 재배포 후에도 `filter` 에러가 해결되지 않아 재조사한 결과, 진짜 원인은 `src/features/floor-plan/FloorPlanDrafter.tsx` 컴포넌트가 리팩토링에서 누락된 사실을 발견했습니다. 이 컴포넌트는 더 이상 존재하지 않는 `tenantUnits` 데이터를 사용하고 있어 `undefined.filter()` 에러를 발생시켰습니다. 이 문제를 해결하기 위해 `FloorPlanDrafter.tsx`가 새로운 데이터 모델(`units`)을 사용하도록 코드를 전면 수정합니다.
- **영향:** 대규모 리팩토링 과정에서 누락되었던 마지막 레거시 컴포넌트를 수정하여, "도면 편집" 기능의 런타임 에러를 해결하고 애플리케이션의 모든 기능이 새로운 데이터 모델 위에서 일관되게 동작하도록 보장합니다.

---

- **작업 내용:** '신규 유닛 추가' 모달(`UnitEditModal.tsx`)의 저장 버튼이 비활성화되는 문제가 발견되었습니다. 원인은 이 컴포넌트 역시 리팩토링에서 누락되어, 오래된 데이터 모델(`TenantUnit`)과 함수(`addTenantUnit`)를 사용하고 있기 때문입니다. 이 문제를 해결하기 위해 `ProjectDataProvider`, `UnitEditModal`, `TenantRoster`를 아우르는 3단계 리팩토링을 진행합니다.
- **영향:**
    1.  **`ProjectDataProvider` 보강:** 데이터 관리의 핵심인 `ProjectDataProvider`에 계약(Contract) 정보 CRUD 기능을 추가하고, `addUnit` 함수가 생성된 ID를 반환하도록 개선하여 데이터 처리의 완전성을 높입니다.
    2.  **`UnitEditModal` 리팩토링:** 모달이 새로운 데이터 모델(`Unit`, `Contract`)을 사용하도록 코드를 전면 수정하고, 유효성 검사를 추가하여 UI 동작의 명확성을 확보합니다.
    3.  **`TenantRoster` 수정:** 상위 컴포넌트의 저장 로직을 새로운 데이터 모델에 맞게 강화하여, '신규 유닛 추가' 기능이 완벽하게 작동하도록 수정합니다.