# 프로젝트 문서

## 1. 개요

이 문서는 React 기반 웹 애플리케이션의 전체 구조, 주요 컴포넌트, 데이터 흐름 및 핵심 아키텍처에 대해 상세히 설명합니다.

## 2. AI 협업 가이드라인

이 섹션은 AI 어시스턴트와의 효율적이고 안전한 협업을 위해 정의된 규칙입니다.

### 2.1. 기본 원칙 (Core Principles)

- **추측 금지 (No Hallucination)**: AI는 확실하지 않은 파일 경로, 변수명, 비즈니스 로직에 대해 절대 추측하지 않고, 반드시 사용자에게 질문하여 명확한 지침을 받습니다.
- **시니어 시각 (Senior Perspective)**: AI는 20년 경력의 시스템 설계자 관점에서, 코드의 확장성과 유지보수 용이성을 최우선 가치로 삼고 개발에 임합니다.
- **영향도 분석 (Impact Analysis)**: 코드 수정 전, 제안하는 변경이 기존의 다른 기능에 미칠 수 있는 잠재적 영향을 반드시 분석하고 보고합니다.

### 2.2. 코드 수정 전 필수 체크리스트 (Pre-flight Checklist)

AI는 코드를 작성하기 전, 다음 3가지 사항을 분석하여 사용자에게 보고하고 승인을 받아야 합니다.

- **기존 기능 유실 검토**: 수정하려는 코드가 기존 로직과 어떤 의존성을 가지고 있는지, 변경 시 예상치 못한 사이드 이펙트는 없는지 확인합니다.
- **구조적 정확성**: 모든 파일 경로는 실제 파일 시스템을 기준으로 하며, import 경로는 추측이 아닌 확인된 경로만을 사용합니다.
- **유지보수성**: 하드코딩을 최대한 지양하고, 공통 Hook이나 Constants를 활용하여 미래의 요구사항 변경에 유연하게 대처할 수 있는 코드를 작성합니다.

### 2.3. 작업 프로세스 (Step-by-Step Workflow)

1.  **분석**: 사용자의 수정 요청을 받으면, 관련된 파일들을 모두 읽고 변경이 미칠 '영향 범위'를 요약하여 보고합니다.
2.  **설계**: "확장성 고려 완료, 경로 확인 완료"와 같은 선언과 함께, 구체적인 수정 방향과 계획을 제안합니다.
3.  **구현**: 사용자의 최종 승인 후 코드를 작성하며, 제출 전 기존 기능과의 충돌 여부를 마지막으로 점검합니다.

## 3. 핵심 아키텍처

본 애플리케이션은 다음과 같은 핵심 아키텍처 패턴을 따릅니다.

- **컴포넌트 기반 아키텍처 (CBA)**: UI를 독립적이고 재사용 가능한 컴포넌트로 분리하여 개발 및 유지보수를 용이하게 합니다.
- **상태 관리**: React Context API를 활용한 Provider 패턴을 사용하여 전역 상태(인증, 알림, 프로젝트 데이터 등)를 효율적으로 관리합니다.
- **라우팅**: 사용자의 인증 상태에 따라 조건부 렌더링을 통해 페이지를 전환하고, `MainLayout` 내에서는 `navigationState`를 기반으로 동적으로 콘텐츠를 표시합니다.

### 3.1. 주요 Provider

- `ProjectDataProvider`: 앱의 핵심 데이터 및 상태 관리를 총괄합니다. (상세 내용은 `7.1.` 참조)
- `NotificationProvider`: 앱 내 알림 시스템을 관리합니다.
- `SearchProvider`: 검색 기능을 위한 상태와 로직을 관리합니다.

## 4. 디렉토리 구조

- **src/components**: `MainLayout`, `Dashboard` 등 애플리케이션의 핵심 UI를 구성하는 재사용 가능한 컴포넌트들이 위치합니다.
- **src/pages**: `BaseInfoPage`와 같이 특정 라우팅 경로에 매핑되는 페이지 단위의 컴포넌트들이 위치합니다.
- **src/providers**: `ProjectDataProvider`와 같이 React Context API를 사용하여 전역 상태를 관리하는 Provider들이 위치합니다.
- **src/features**: 인증(`auth`)과 같이 특정 기능 도메인에 관련된 파일들을 그룹화합니다.

## 5. 핵심 컴포넌트 분석

(상세 내용은 생략)

## 6. 페이지 분석

(상세 내용은 생략)

## 7. Provider 분석

### 7.1. ProjectDataProvider (ProjectDataProvider.tsx)

- **역할**: 애플리케이션의 모든 핵심 데이터와 상태를 관리하고, 하위 컴포넌트에 데이터와 상태 조작 함수를 제공하는 최상위 Provider입니다.

- **주요 기능 및 상태**:
    - **데이터 관리**: `safetyKPIs`, `leaseKPIs`, `assetKPIs`, `infraKPIs`, `hotspots`, `facilities`, `complexFacilities`, `teamMembers` 등 애플리케이션의 거의 모든 동적 데이터를 포함하는 `data` 객체를 상태로 관리합니다.
    - **Firebase Firestore 연동**:
        - `useAuth` 훅을 통해 현재 사용자(`currentUser`) 정보를 가져옵니다.
        - 사용자가 로그인하면 Firestore DB의 `users/{currentUser.uid}` 경로에서 해당 사용자의 데이터를 비동기적으로 가져와 상태를 업데이트합니다.
        - 사용자가 없는 경우(신규 사용자) 초기 데이터를 Firestore에 생성합니다.
        - `useEffect`와 디바운싱(`setTimeout`)을 결합하여, 상태(`data`)가 변경될 때마다 자동으로 변경사항을 Firestore에 저장하여 데이터 영속성을 보장합니다.
    - **네비게이션 상태 관리**: `navigationState` 객체를 통해 현재 활성화된 메뉴(`menuKey`)나 선택된 월(`selectedMonth`) 등 UI 네비게이션과 관련된 상태를 관리하며, `navigateTo` 함수를 통해 상태 변경을 지원합니다.
    - **파생 데이터 제공**: `useMemo` 훅을 사용하여 각기 다른 KPI 배열(`safetyKPIs`, `leaseKPIs` 등)을 UI에서 사용하기 편리한 단일 배열(`kpiData`)로 가공하여 제공합니다.

- **제공되는 주요 함수**:
    - **CRUD (Create, Read, Update, Delete) 함수**: KPI, Activity, Task, 단지 시설(`ComplexFacility`), 팀원(`TeamMember`) 등 다양한 데이터에 대한 생성, 수정, 삭제 로직을 캡슐화한 함수들(`addActivityToKpi`, `updateTask`, `deleteComplexFacility`, `addTeamMember` 등)을 제공합니다. 이를 통해 하위 컴포넌트는 데이터 구조에 대한 깊은 이해 없이 상태를 변경할 수 있습니다.
    - **상태 Setter 함수**: `setSafetyKPIs`, `setHotspots` 등 특정 데이터 조각을 직접 업데이트할 수 있는 Setter 함수들을 제공합니다.

- **`useProjectData` 훅**:
    - 컴포넌트에서 `useContext(ProjectDataContext)`를 직접 사용하는 대신, `useProjectData` 훅을 통해 컨텍스트 값에 간편하게 접근할 수 있도록 합니다. 컨텍스트가 없는 경우 에러를 발생시켜 잠재적인 버그를 방지합니다.
