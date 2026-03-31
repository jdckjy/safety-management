import { GoogleGenerativeAI } from "@google/generative-ai";
import { IProjectData, KPI } from "../types";

const API_KEY = import.meta.env.VITE_API_KEY;

if (!API_KEY) {
  throw new Error("VITE_API_KEY is not defined in .env file");
}

// Google AI 클라이언트를 초기화합니다.
const genAI = new GoogleGenerativeAI(API_KEY);

/**
 * 프로젝트 데이터를 기반으로 AI 일일 브리핑을 생성합니다.
 * @param data - IProjectData 형태의 전체 프로젝트 데이터
 * @returns 생성된 브리핑 텍스트 (string)
 */
export const generateDailyBriefing = async (data: IProjectData): Promise<string> => {
  // 사장님의 제안대로, 최신 라이브러리와 호환되는 gemini-1.5-flash 모델로 변경
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const allKpis: KPI[] = [
    ...(data.safetyKPIs || []),
    ...(data.leaseKPIs || []),
    ...(data.assetKPIs || []),
    ...(data.infraKPIs || []),
  ];

  const prompt = `
    당신은 전문 상업용 부동산 자산 관리 AI 어시스턴트입니다.
    아래에 제공되는 JSON 데이터를 분석하여, 관리자가 오늘 주목해야 할 가장 중요한 사항들을 요약하는 "일일 브리핑"을 작성해주세요.
    브리핑은 다음 구조를 따라야 합니다:
    1.  **핵심 요약:** 가장 중요하고 긴급한 1-2가지 사항을 먼저 언급합니다.
    2.  **주요 KPI 현황:** 목표 미달이거나 특이사항이 있는 KPI를 중심으로 진행 상황을 요약합니다. (예: "안전 KPI: 분기별 안전 점검 목표 75% 달성 중")
    3.  **오늘의 주요 활동:** 마감일이 임박했거나 중요한 일반 활동, 회의 등을 최대 3개까지 나열합니다.
    4.  **리스크 및 제안:** 데이터 분석을 통해 잠재적인 리스크를 예측하고, 이를 해결하기 위한 구체적인 행동을 1가지 제안합니다.

    브리핑은 명확하고 간결해야 하며, 관리자가 즉시 행동을 취할 수 있도록 구체적인 정보를 제공해야 합니다.
    
    데이터:
    \`\`\`json
    ${JSON.stringify({ kpis: allKpis, activities: data.generalActivities }, null, 2)}
    \`\`\`
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    return response.text();
  } catch (error) {
    console.error('Error during generateContent. Attempted to use model: gemini-1.5-flash');
    // API 사용량 초과 또는 기타 오류 발생 시 사용자에게 명확한 메시지를 전달하기 위해 오류를 다시 던짐
    if (error instanceof Error && (error.message.includes('429') || error.message.includes('resource has been exhausted'))) {
        throw new Error("AI 브리핑 오늘의 사용량을 초과했습니다.");
    }
    throw new Error("AI 브리핑을 생성하는 데 실패했습니다. 네트워크 또는 API 키를 확인해주세요.");
  }
};
