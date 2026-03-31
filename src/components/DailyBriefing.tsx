
import { useState, useEffect } from 'react';
import { useProjectData } from '../providers/ProjectDataProvider';
import { generateDailyBriefing } from '../services/aiBriefingService';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Lightbulb, RefreshCw } from 'lucide-react';

export const DailyBriefing = () => {
  const projectData = useProjectData();
  const [briefing, setBriefing] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAndSetBriefing = async (forceRefresh = false) => {
    if (!projectData.isDataLoaded) return;

    const today = new Date().toISOString().split('T')[0];
    const cachedData = localStorage.getItem('aiDailyBriefing');

    if (cachedData && !forceRefresh) {
      const { date, summary } = JSON.parse(cachedData);
      if (date === today) {
        setBriefing(summary);
        setIsLoading(false);
        setError(null);
        return;
      }
    }

    setIsLoading(true);
    setError(null);

    try {
      const summary = await generateDailyBriefing(projectData);
      localStorage.setItem('aiDailyBriefing', JSON.stringify({ date: today, summary }));
      setBriefing(summary);
    } catch (err) {
      console.error("Error loading AI briefing:", err);
      let errorMessage = "브리핑을 불러오는 데 실패했습니다. 네트워크 연결 또는 API 키 설정을 확인해주세요.";
      if (err instanceof Error) {
        if (err.message.includes('429')) {
          errorMessage = "AI 브리핑의 일일 사용량을 초과했습니다. 내일 다시 시도해주세요.";
        } else if (err.message.includes("API key not valid")) {
          errorMessage = "API 키가 유효하지 않습니다. 관리자에게 문의하세요.";
        }
      }
      setBriefing(''); // 기존 브리핑 내용 지우기
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // isDataLoaded가 true가 될 때 한 번만 실행
    if (projectData.isDataLoaded) {
      fetchAndSetBriefing();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectData.isDataLoaded]);

  const handleRefresh = () => {
    fetchAndSetBriefing(true);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-yellow-500" />
          <CardTitle>AI 기반 일일 브리핑</CardTitle>
        </div>
        <Button variant="ghost" size="icon" onClick={handleRefresh} disabled={isLoading || !projectData.isDataLoaded}>
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-gray-500">AI가 최신 데이터를 분석하고 있습니다...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <p className="text-base whitespace-pre-line">{briefing}</p>
        )}
      </CardContent>
    </Card>
  );
};
