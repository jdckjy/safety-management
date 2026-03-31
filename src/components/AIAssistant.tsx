
import React, { useState, useEffect } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Sparkles } from 'lucide-react';

const AIAssistant: React.FC = () => {
  const [suggestion, setSuggestion] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchAIInsights = async () => {
      setIsLoading(true);
      try {
        // 1. 로컬 스토리지에서 캐시된 데이터를 가져옵니다.
        const cachedData = localStorage.getItem('aiDailyInsight');
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD 형식

        if (cachedData) {
          const { date, insight } = JSON.parse(cachedData);
          // 2. 날짜가 오늘이면 캐시된 데이터를 사용하고 API 호출을 생략합니다.
          if (date === today) {
            setSuggestion(insight);
            setIsLoading(false);
            return;
          }
        }

        // 3. 캐시가 없거나 날짜가 다르면 API를 호출합니다.
        const apiKey = import.meta.env.VITE_API_KEY;
        if (!apiKey) {
          throw new Error("API Key is not defined");
        }
        const genAI = new GoogleGenerativeAI(apiKey);

        // 사장님의 제안대로, 최신 라이브러리와 호환되는 gemini-1.5-flash 모델로 변경
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = "단지조성팀 업무 관리자에게 유용한 오늘의 비즈니스 인사이트 1가지를 '짧고 강력하게' 한국어로 알려줘. 안전, 임대, 자산, 인프라 중 하나를 골라서 조언해줘.";
        
        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();

        // 4. 새로 받은 인사이트를 로컬 스토리지에 오늘 날짜와 함께 저장합니다.
        localStorage.setItem('aiDailyInsight', JSON.stringify({ date: today, insight: text }));
        setSuggestion(text);

      } catch (error) {
        console.error("AI Insight Fetch Error:", error);
        // 5. 사용자가 이해하기 쉬운 에러 메시지로 변경합니다.
        if (error instanceof Error && (error.message.includes('429') || error.message.includes('resource has been exhausted'))) {
          setSuggestion("AI 인사이트 오늘의 사용량을 초과했습니다. 내일 다시 시도해주세요.");
        } else {
          setSuggestion("AI 인사이트를 가져오는 데 실패했습니다. 네트워크 또는 API 키를 확인해주세요.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchAIInsights();
  }, []);

  return (
    <div className="bg-blue-50 dark:bg-gray-800 p-3 rounded-lg flex items-start space-x-3 text-sm">
      <Sparkles className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
      <div className="flex-grow">
        <p className="font-semibold text-blue-800 dark:text-blue-300">오늘의 AI 비즈니스 인사이트</p>
        {isLoading ? (
          <p className="text-gray-600 dark:text-gray-400">생성 중...</p>
        ) : (
          <p className="text-gray-700 dark:text-gray-300">{suggestion}</p>
        )}
      </div>
    </div>
  );
};

export default AIAssistant;
