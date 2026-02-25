
// 이 파일은 실제 AI 연동 전, UI 프로토타입을 위해 가상의 추천 데이터를 제공하는 모의 서비스입니다.
// 향후 이 부분은 실제 Gemini AI를 호출하는 코드로 대체될 것입니다.

/** AI가 반환할 추천 데이터의 구조 정의 */
export interface Recommendation {
  tenantType: string;         // 추천 업종 (예: "소아과", "프랜차이즈 카페")
  reason: string;             // AI의 추천 사유
  expectedMonthlyRevenue: number; // 예상 월 매출 (단위: 원)
  successScore: number;       // 성공 가능성 점수 (0-100점)
}

/**
 * 특정 상가 시설에 대한 최적 임차인 추천 목록을 비동기적으로 가져오는 모의 함수
 * @param facilityName 분석할 시설의 이름 (예: "웰니스몰9")
 * @returns 추천 데이터 배열을 담은 Promise
 */
export const getOptimalTenantRecommendations = async (facilityName: string): Promise<Recommendation[]> => {
  console.log(`AI 모델이 [${facilityName}]에 대한 최적 임차인을 분석중입니다...`);

  // 실제 네트워크 통신을 흉내 내기 위한 1초 지연
  await new Promise(resolve => setTimeout(resolve, 1000));

  // "메디컬" 이름 포함 여부에 따라 다른 모의 데이터 반환
  if (facilityName.includes("메디컬")) {
    return [
      {
        tenantType: "소아청소년과",
        reason: "주변에 30-40대 인구 밀집 지역이 있어, 어린 자녀를 둔 가족 단위 수요가 높을 것으로 예상됩니다. 경쟁 소아과가 부족하여 시장 선점 효과가 큽니다.",
        expectedMonthlyRevenue: 50000000,
        successScore: 92,
      },
      {
        tenantType: "피부과",
        reason: "인근에 대규모 주거 단지가 있고, 소득 수준이 비교적 높아 미용 및 피부 관리에 대한 수요가 꾸준할 것으로 보입니다.",
        expectedMonthlyRevenue: 70000000,
        successScore: 88,
      },
       {
        tenantType: "정형외과",
        reason: "인근에 대규모 스포츠 단지가 있어, 운동 관련 부상 환자 수요가 꾸준할 것으로 보입니다.",
        expectedMonthlyRevenue: 60000000,
        successScore: 85,
      },
    ];
  } else {
    return [
      {
        tenantType: "프리미엄 피트니스 센터",
        reason: "주변에 오피스 단지가 형성되어 있어, 직장인들의 퇴근 후 운동 수요를 흡수할 수 있습니다. 웰니스몰의 컨셉과 시너지를 낼 수 있습니다.",
        expectedMonthlyRevenue: 120000000,
        successScore: 95,
      },
      {
        tenantType: "유기농 베이커리 & 카페",
        reason: "소득 수준이 높은 배후 주거 단지의 소비 트렌드에 부합하며, 주말 가족 단위 방문객을 유치하기에 적합합니다.",
        expectedMonthlyRevenue: 45000000,
        successScore: 85,
      },
    ];
  }
};
