# KOSIS 연동 인구 통계 대시보드 구현 계획

## 1. 최종 목표

현재 정적 콘텐츠만 표시하는 `StatisticsPage.tsx`를 **동적 데이터 기반의 인터랙티브 대시보드**로 전환합니다. `research.md`의 분석에 따라, 백엔드 프록시를 통해 KOSIS의 인구 통계 데이터를 실시간으로 가져와 시계열 차트와 GIS 지도로 시각화하는 것을 목표로 합니다. 이 과정에서 현재 시스템 아키텍처의 한계(백엔드 및 동적 데이터 처리 로직 부재)를 해결합니다.

## 2. 수정 및 신규 생성 파일

### 가. 수정 대상

*   `src/pages/PopulationInfoTab.tsx`: 동적 데이터 패칭, 상태 관리 및 시각화 컴포넌트 렌더링 로직 추가

### 나. 신규 생성

*   `api/kosisProxy.ts`: KOSIS API 호출을 중계하고 CORS 문제를 해결할 백엔드 프록시 (서버리스 함수)
*   `src/components/charts/PopulationChart.tsx`: 시계열 인구 데이터를 라인/바 차트로 시각화할 컴포넌트
*   `src/components/maps/JejuMap.tsx`: 제주 읍면동별 인구 데이터를 단계 구분도로 시각화할 컴포넌트
*   `src/types/population.ts`: KOSIS API 응답 및 시각화에 사용될 데이터 관련 TypeScript 인터페이스
*   `.env.local`: KOSIS API 키를 저장할 환경 변수 파일

## 3. 핵심 구현 계획 (P0 우선순위 중심)

### 1단계: 백엔드 프록시 구축 및 API 연동 준비

- **목표:** 클라이언트에서 KOSIS API를 직접 호출할 때 발생하는 CORS 오류를 우회하기 위한 서버리스 함수 기반의 프록시를 구축합니다.
- **실행 방안:**
    1.  프로젝트 루트에 `.env.local` 파일을 생성하고, 발급받은 KOSIS API 키를 `VITE_KOSIS_API_KEY="{발급받은 키}"` 형식으로 저장합니다. (`.gitignore`에 `.env.local` 추가 확인)
    2.  프로젝트 루트에 `api` 디렉터리를 생성하고, 그 안에 `kosisProxy.ts` 파일을 만듭니다.
    3.  `kosisProxy.ts` 내부에 KOSIS API (`statisticsData.do`) 호출을 중계하는 서버리스 함수를 작성합니다. 이 함수는 프론트엔드의 요청을 받아 환경 변수에 저장된 API 키를 포함하여 KOSIS 서버로 전달하고, 그 결과를 다시 프론트엔드에 반환하는 역할을 합니다.

### 2단계: 데이터 패칭 로직 및 상태 관리 구현

- **목표:** `PopulationInfoTab.tsx` 컴포넌트가 1단계에서 만든 백엔드 프록시를 통해 실제 인구 데이터를 비동기적으로 가져오도록 구현합니다.
- **실행 방안:**
    1.  데이터 통신을 위해 `axios` 라이브러리를 설치합니다. (`npm install axios`)
    2.  `PopulationInfoTab.tsx`에 `useState`를 사용하여 `data`, `loading`, `error` 상태를 관리합니다.
    3.  `useEffect` 훅을 사용하여 컴포넌트가 마운트될 때 백엔드 프록시 API (`/api/kosisProxy`)를 호출하는 함수를 실행합니다.
    4.  API 호출 시작 시 `loading` 상태를 `true`로, 호출 완료 시 `false`로 변경합니다. 데이터 수신 성공 시 `data` 상태에 저장하고, 실패 시 `error` 상태에 에러 정보를 저장합니다.
    5.  `loading` 및 `error` 상태에 따라 적절한 UI(로딩 스피너, 에러 메시지)가 표시되도록 조건부 렌더링을 구현합니다.

### 3단계: 차트 라이브러리 연동 및 시각화

- **목표:** KOSIS에서 가져온 시계열 데이터를 사용자가 직관적으로 이해할 수 있는 라인 차트로 시각화합니다.
- **실행 방안:**
    1.  React 차트 라이브러리인 `recharts`를 설치합니다. (`npm install recharts`)
    2.  `src/components/charts/PopulationChart.tsx` 파일을 생성합니다.
    3.  KOSIS API로부터 받은 원본 JSON 데이터를 `recharts`가 요구하는 데이터 형식(예: `[{ name: '2023년 01월', value: 12345 }]`)으로 변환하는 유틸리티 함수를 작성합니다.
    4.  `PopulationChart.tsx`는 변환된 데이터를 props로 받아, `LineChart`, `XAxis`, `YAxis`, `Tooltip` 등의 컴포넌트를 사용하여 차트를 렌더링합니다.
    5.  `PopulationInfoTab.tsx`에서 데이터 로딩이 완료되면 `PopulationChart.tsx` 컴포넌트를 렌더링하여 차트를 화면에 표시합니다.

### 4단계 (P1): GIS 지도 연동 및 단계 구분도 구현

- **목표:** 읍면동별 인구 데이터를 지도 위에 색상으로 표현하여 지역별 인구 분포를 한눈에 파악할 수 있도록 합니다.
- **실행 방안:**
    1.  지도 라이브러리인 `react-leaflet`과 `leaflet`을 설치합니다. (`npm install react-leaflet leaflet`, `npm install -D @types/leaflet`)
    2.  제주특별자치도 읍면동 단위의 `GeoJSON` 데이터를 확보하여 `src/data` 폴더에 저장합니다.
    3.  `src/components/maps/JejuMap.tsx` 파일을 생성합니다.
    4.  `JejuMap.tsx`에서 `MapContainer`, `TileLayer`, `GeoJSON` 컴포넌트를 사용하여 기본 지도를 렌더링하고, 확보한 GeoJSON 데이터를 지도 위에 표시합니다.
    5.  인구 데이터와 GeoJSON의 지역 코드를 기준으로 데이터를 조인하고, 인구 수에 따라 각 폴리곤의 채우기 색상을 다르게 설정하는 로직을 구현하여 단계 구분도를 완성합니다.
