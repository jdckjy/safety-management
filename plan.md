### 수익 분석 대시보드 구현 계획

**목표:** 사용자가 Excel 파일을 업로드하여 수익 및 지출 내역을 분석하고, 시각적인 대시보드를 통해 재무 상태를 직관적으로 파악할 수 있는 기능을 구현합니다.

**핵심 전략:** `xlsx` 라이브러리를 사용해 Excel 데이터를 JSON으로 파싱하고, `recharts`를 활용하여 다양한 분석 차트를 제공합니다.

---

#### 1단계: Excel 파싱 유틸리티 고도화 (Excel Parsing Utility Enhancement)

- **작업:** `src/utils/ExcelParser.ts`의 `parseExcelFile` 함수를 수정하여 날짜 파싱 로직을 개선하고, `ProfitAnalysisData` 인터페이스를 `export`하여 다른 컴포넌트에서 재사용할 수 있도록 합니다.
- **이유:** 안정적인 데이터 처리를 위해 다양한 형식의 날짜를 올바르게 ISO String으로 변환하고, 타입 정의를 공유하여 코드의 일관성과 유지보수성을 높입니다.
- **파일:**
  - `src/utils/ExcelParser.ts`

---

#### 2단계: 수익 분석 컴포넌트 재설계 (Profit Analysis Component Redesign)

- **작업:** `src/features/tenant-info/ProfitAnalysis.tsx` 컴포넌트를 `Research.md`에 정의된 UI/UX 계획에 따라 재설계합니다.
- **이유:** 단순한 JSON 표시 기능을 넘어, 사용자에게 실질적인 재무 인사이트를 제공하는 동적인 대시보드를 구현합니다. 이를 위해 데이터 요약, 차트, 상세 거래 내역 테이블을 포함하는 종합적인 UI를 구성합니다.
- **파일:** `src/features/tenant-info/ProfitAnalysis.tsx`

---

#### 3단계: 데이터 시각화 구현 (Data Visualization Implementation)

- **작업:** `recharts` 라이브러리를 사용하여 `ProfitAnalysis.tsx` 내에 다음 차트들을 구현합니다:
  - **요약 카드 (Summary Cards):** 총 수입, 총 지출, 순수익, 총 거래 건수
  - **카테고리별 분석:** 지출 및 수입 상위 5개 항목을 보여주는 원형 차트 (Pie Chart)
  - **월별 추이 분석:** 월별 수입과 지출의 변화를 보여주는 꺾은선 그래프 (Line Chart)
- **이유:** 복잡한 재무 데이터를 시각적으로 표현하여 사용자가 재무 상태의 트렌드와 주요 항목을 쉽게 파악할 수 있도록 돕습니다.
- **파일:** `src/features/tenant-info/ProfitAnalysis.tsx`

---

#### 4단계: 전체 기능 테스트 및 검증 (End-to-End Testing and Validation)

- **작업:** Excel 파일 업로드부터 데이터 파싱, 차트 렌더링, 테이블 표시까지 전체 기능이 올바르게 작동하는지 테스트합니다.
- **이유:** 다양한 형식의 Excel 파일과 데이터를 사용하여 예외 상황을 처리하고, 모든 기능이 기획된 대로 정확하게 동작하는지 최종 검증합니다. 특히, 데이터 계산의 정확성과 차트의 상호작용성을 중점적으로 확인합니다.