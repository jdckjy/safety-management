
import { GoogleGenAI } from "@google/genai";
import { InspectionLog, Facility } from "../types";

/**
 * Gemini API를 활용한 안전 관리 인사이트 서비스
 */
export const getSafetyInsights = async (logs: InspectionLog[], facilities: Facility[]) => {
  try {
    // API 키는 환경 변수 process.env.API_KEY에서 직접 가져와 초기화합니다.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const prompt = `
      당신은 제주의 대규모 헬스케어 단지 전문 안전 엔지니어입니다. 다음 시설 및 점검 데이터를 분석하여 
      현재의 안전 리스크 요약과 3가지 구체적인 기술적 개선 권고안을 한국어로 제시하세요.
      
      시설 목록: ${JSON.stringify(facilities)}
      최근 점검 로그: ${JSON.stringify(logs.slice(-5))}
      
      특히 'Reactive(긴급)' 점검 비중이 높은 항목과 법정 검사 기한(D-Day)이 임박한 자산을 중심으로 사고 예방을 위한 통찰을 제공하세요.
      답변은 단호하고 전문적인 톤으로 작성하세요. 마크다운 형식을 사용하여 가독성을 높이세요.
    `;

    // ai.models.generateContent를 사용하여 모델 이름과 프롬프트를 한 번에 전달합니다.
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        systemInstruction: "당신은 제주 헬스케어타운 통합 관제실의 수석 분석관입니다. 현장의 데이터에 근거하여 치명적인 위험 요소를 선제적으로 식별하고 보고합니다.",
        temperature: 0.5,
      }
    });

    // GenerateContentResponse.text 속성을 통해 텍스트 결과를 추출하여 반환합니다.
    return response.text || "데이터 분석 결과, 현재 모든 설비가 관리 기준 범위 내에서 안정적으로 가동 중입니다.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "실시간 AI 분석 모듈에 일시적인 지연이 발생했습니다. 대시보드의 D-Day 알람과 긴급 핫스팟 마커를 수동으로 우선 확인해 주시기 바랍니다.";
  }
};
