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

  const loadBriefing = async () => {
    // isDataLoaded가 false이면 projectData 전체가 아직 준비되지 않았을 수 있습니다.
    if (!projectData.isDataLoaded) return;

    setIsLoading(true);
    try {
      const summary = await generateDailyBriefing(projectData);
      setBriefing(summary);
    } catch (error) {
      console.error("Error loading AI briefing:", error);
      setBriefing("브리핑을 불러오는 데 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // 수정: isDataLoaded가 true일 때만 브리핑을 로드합니다.
    if (projectData.isDataLoaded) {
      loadBriefing();
    }
  }, [projectData.isDataLoaded]); // 수정: isDataLoaded를 의존성 배열에 추가

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-yellow-500" />
          <CardTitle>AI 기반 일일 브리핑</CardTitle>
        </div>
        <Button variant="ghost" size="icon" onClick={loadBriefing} disabled={isLoading || !projectData.isDataLoaded}>
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading && !briefing ? (
          <p className="text-gray-500">AI가 최신 데이터를 분석하고 있습니다...</p>
        ) : (
          <p className="text-base whitespace-pre-line">{briefing}</p>
        )}
      </CardContent>
    </Card>
  );
};