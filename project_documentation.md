# 프로젝트 구조 문서

이 문서는 Gemini의 이해를 돕기 위해 프로젝트의 주요 파일 구조와 데이터 흐름을 기록합니다.

## 핵심 아키텍처

이 프로젝트는 React 기반의 싱글 페이지 애플리케이션(SPA)으로, 컴포넌트 기반 아키텍처를 따릅니다.

- **`src/App.tsx`**: 애플리케이션의 최상위 진입점입니다. 모든 `Provider` (상태 관리, 알림, 데이터 등)를 설정하고, 사용자의 인증 상태에 따라 `LoginPage` 또는 `MainLayout`을 렌더링합니다.

- **`src/layouts/MainLayout.tsx`**: 인증된 사용자에게 표시되는 기본 레이아웃입니다. `Sidebar`와 `Header`, 그리고 현재 선택된 메뉴에 따른 주요 콘텐츠 영역으로 구성됩니다.

- **`src/components/Sidebar.tsx`**: 좌측 내비게이션 메뉴입니다. 사용자가 메뉴를 클릭하면 `ProjectDataProvider`의 `navigationState`를 업데이트하여 `MainLayout`이 올바른 페이지 컴포넌트를 렌더링하도록 합니다.

- **`src/providers/ProjectDataProvider.tsx`**: React Context API를 사용하여 프로젝트 전반의 상태를 관리합니다. 특히 `navigationState`는 현재 활성화된 메뉴와 탭을 결정하는 핵심적인 역할을 합니다.

## '임대 및 세대 관리' 페이지 상세 구조

사용자가 사이드바에서 '임대 및 세대 관리'를 클릭했을 때의 흐름은 다음과 같습니다.

1.  **`Sidebar`**에서 메뉴 클릭 이벤트가 발생합니다.
2.  **`ProjectDataProvider`**의 `navigateTo` 함수가 호출되어 `navigationState.menuKey`가 `'lease'`로 설정됩니다.
3.  **`MainLayout`**은 `navigationState.menuKey` 값의 변화를 감지하고, `renderContent` 함수 내의 `switch` 문을 통해 **`src/components/LeaseRecruitment.tsx`** 컴포넌트를 렌더링합니다.

### `LeaseRecruitment.tsx`

이 파일은 '임대 및 세대 관리' 페이지의 핵심 컨테이너 역할을 합니다. 내부적으로 여러 하위 탭을 가지고 있으며, `useState` 훅을 통해 `activeTab` 상태를 관리합니다.

- **탭 구성 (`subTabs` 배열):**
    - `KPI Reports`: `KPIManager` 컴포넌트 렌더링
    - `주요 임대현황`: `LeaseStatusSummaryPage` 컴포넌트 렌더링
    - `임차인 정보`: `TenantInfoPage` 컴포넌트 렌더링
    - `Tenant Roster`: `TenantManager` 컴포넌트 렌더링
    - `수익 분석`: `LeaseAnalysisPage` 컴포넌트 렌더링
    - `AI Tenant Recommender`: `AITenantRecommender` 컴포넌트 렌더링

- **경로 별칭 (`@/`):**
    - 컴포넌트나 페이지를 가져올 때, 상대 경로 (`../`) 대신 `@/` 별칭을 사용하여 `src` 디렉토리로부터의 절대 경로를 참조해야 합니다. (예: `import TenantInfoPage from '@/pages/TenantInfoPage';`)
