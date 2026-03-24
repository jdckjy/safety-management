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
  // 다른 컴포넌트(AIAssistant.tsx)에서 사용하고 있는 정확한 모델 이름으로 수정합니다.
  const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

  const allKpis: KPI[] = [
    ...(data.safetyKPIs || []),
    ...(data.leaseKPIs || []),
    ...(data.assetKPIs || []),
    ...(data.infraKPIs || []),
  ];

  const prompt = `
    당신은 전문 상업용 부동산 자산 관리 AI 어시스턴트입니다.
    아래에 제공되는 JSON 데이터를 분석하여, 관리자가 오늘 주목해야 할 가장 중요한 사항들을 요약하는 "일일 브리핑"을 작성해주세요.

    [분석할 데이터]
    - 전체 세대 정보 (tenantUnits): ${JSON.stringify(data.tenantUnits)}
    - 주요 성과 지표 (kpiData): ${JSON.stringify(allKpis)}

    [브리핑에 포함할 내용]
    1.  **핵심 요약:** 전체 임대율, 공실 수, 총 예상 월 수입을 가장 먼저 언급해주세요.
    2.  **주요 변동 사항:** 최근 상태가 변경된 세대(예: 신규 공실, 신규 계약)가 있다면 강조해서 알려주세요.
    3.  **리스크 및 예정 사항:** 30일 이내에 계약이 만료되는 세대가 있다면 목록과 남은 기간을 알려주세요.
    4.  **긍정적 신호:** 최근에 계약이 체결되었거나 긍정적인 KPI 변화가 있다면 언급해주세요.

    [작성 스타일]
    - 전문가적이고 간결한 톤을 유지해주세요.
    - 각 항목을 줄바꿈으로 구분하여 가독성을 높여주세요.
    - 중요한 숫자나 변동사항은 **굵은 글씨**로 강조해주세요.
    - 최종 결과물은 브리핑 텍스트만 포함해야 합니다.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    return text;
  } catch (error) {
    console.error("AI 브리핑 생성 중 오류 발생 (라이브러리):", error);
    const errorMessage = error instanceof Error ? error.toString() : JSON.stringify(error);
    return `죄송합니다. AI 브리핑 생성에 실패했습니다. API 키와 관련된 모든 권한(사용 설정, API 제한, 웹사이트 제한)을 다시 한번 확인해주세요.\n오류: ${errorMessage}`;
  }
};
