
import React, { useState, useEffect } from 'react';
import { Sparkles, MessageSquare, ChevronRight, HelpCircle, LogOut } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { auth } from '../firebaseConfig';
import { signOut } from 'firebase/auth';

const AIAssistant: React.FC = () => {
  const [suggestion, setSuggestion] = useState<string>("단지 조성 현황과 안전 등급을 분석하고 있습니다...");
  const [isLoading, setIsLoading] = useState(false);

  const fetchAIInsights = async () => {
    setIsLoading(true);
    try {
      // Use process.env.API_KEY directly as required by the coding guidelines
      // Instantiate GoogleGenAI right before usage to ensure current API key is used
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: "단지조성팀 업무 관리자에게 유용한 오늘의 비즈니스 인사이트 1가지를 '짧고 강력하게' 한국어로 알려줘. 안전, 임대, 자산 중 하나를 골라서 조언해줘.",
        config: {
          systemInstruction: "당신은 부동산 개발 및 단지 조성 전문가입니다.",
        },
      });
      // Directly access .text property from GenerateContentResponse
      setSuggestion(response.text || "오늘의 인사이트를 불러올 수 없습니다.");
    } catch (error) {
      console.error("AI Insight Fetch Error:", error);
      setSuggestion("네트워크 연결을 확인하고 다시 시도해 주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAIInsights();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      // onAuthStateChanged가 리디렉션을 처리합니다.
      console.log("로그아웃 성공");
    } catch (error) {
      console.error("로그아웃 실패:", error);
      alert("로그아웃 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col h-full min-h-[350px]">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
            <Sparkles size={18} />
          </div>
          <h3 className="font-bold text-lg text-[#1B2559]">AI 업무 비서</h3>
        </div>
        <HelpCircle size={18} className="text-gray-300 cursor-help" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6">
        <div className="relative">
          <div className="w-24 h-24 bg-gradient-to-tr from-blue-600 to-indigo-400 rounded-full flex items-center justify-center shadow-xl shadow-blue-200">
             <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center animate-pulse">
                <div className="w-16 h-16 bg-gradient-to-tr from-blue-600 to-indigo-400 rounded-full"></div>
             </div>
          </div>
          <div className="absolute -bottom-2 -right-2 bg-white p-1.5 rounded-full shadow-md">
            <MessageSquare size={16} className="text-blue-600" />
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="font-bold text-xl text-[#1B2559]">오늘의 분석 브리핑</h4>
          <p className="text-sm text-gray-500 px-4 leading-relaxed">
            {isLoading ? "인공지능이 실시간 데이터를 분석 중입니다..." : suggestion}
          </p>
        </div>

        <button 
          onClick={fetchAIInsights}
          disabled={isLoading}
          className="w-full bg-[#F4F7FE] hover:bg-blue-50 text-blue-600 font-bold py-3 rounded-2xl flex items-center justify-center group transition-all"
        >
          <span>새로운 분석 요청</span>
          <ChevronRight size={18} className="ml-1 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      <div className="mt-6 pt-6 border-t flex items-center space-x-3">
        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
           <img src="https://picsum.photos/32/32?random=1" alt="admin" />
        </div>
        <div className="flex-1">
          <p className="text-xs font-bold text-[#1B2559]">관리 이슈 알림</p>
          <p className="text-[10px] text-red-500 font-medium uppercase mt-0.5">B구역 안전 점검 기한 만료 임박</p>
        </div>
        <button 
          onClick={handleLogout}
          className="p-2 rounded-full hover:bg-red-100 text-gray-400 hover:text-red-500 transition-colors"
          aria-label="로그아웃"
        >
          <LogOut size={18} />
        </button>
      </div>
    </div>
  );
};

export default AIAssistant;
