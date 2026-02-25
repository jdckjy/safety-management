
import React, { useState } from 'react';
// [수정] 절대 경로로 변경
import { useAppData } from '@/providers/AppDataContext';
import { getOptimalTenantRecommendations, Recommendation } from '@/services/aiTenantRecommender';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Lightbulb, Zap, BarChart } from 'lucide-react';

const LeaseTenantPage: React.FC = () => {
  const { complexFacilities } = useAppData();
  const [activeTab, setActiveTab] = useState("aiRecommendation");
  const [selectedFacility, setSelectedFacility] = useState<string>("");
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 상업용 시설만 필터링 (예: "상가", "몰", "스트리트")
  const commercialFacilities = complexFacilities.filter(f => 
    f.category.includes('상가') || f.category.includes('몰') || f.category.includes('스트리트')
  );

  const handleAnalyze = async () => {
    if (!selectedFacility) {
      setError("분석할 시설을 먼저 선택해주세요.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setRecommendations([]);
    try {
      const result = await getOptimalTenantRecommendations(selectedFacility);
      setRecommendations(result);
    } catch (err) {
      setError("AI 추천 데이터를 가져오는 중 오류가 발생했습니다.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatRevenue = (value: number) => {
    return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(value);
  }

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <h1 className="text-2xl font-bold tracking-tight mb-6">임대 및 세대 관리</h1>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="kpiReports">KPI 보고서</TabsTrigger>
          <TabsTrigger value="tenantRoster">임차인 명단</TabsTrigger>
          <TabsTrigger value="aiRecommendation">AI 최적 임차인 추천</TabsTrigger>
        </TabsList>

        {/* KPI 보고서 탭 */}
        <TabsContent value="kpiReports">
          <Card>
            <CardHeader>
              <CardTitle>KPI 보고서</CardTitle>
            </CardHeader>
            <CardContent>
              <p>KPI 보고서 기능은 현재 개발 중입니다.</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 임차인 명단 탭 */}
        <TabsContent value="tenantRoster">
          <Card>
            <CardHeader>
              <CardTitle>임차인 명단</CardTitle>
            </CardHeader>
            <CardContent>
              <p>임차인 명단 기능은 현재 개발 중입니다.</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI 최적 임차인 추천 탭 */}
        <TabsContent value="aiRecommendation">
          <Card>
            <CardHeader>
              <CardTitle>AI 최적 임차인 추천</CardTitle>
               <p className="text-sm text-gray-500">AI가 주변 상권, 인구 통계, 유동 인구 데이터를 분석하여 최적의 임차 업종을 추천합니다.</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-4 items-center">
                <Select onValueChange={setSelectedFacility} value={selectedFacility}>
                    <SelectTrigger className="w-full sm:w-[300px]">
                        <SelectValue placeholder="분석할 상가 시설을 선택하세요" />
                    </SelectTrigger>
                    <SelectContent>
                        {commercialFacilities.map(f => (
                            <SelectItem key={f.id} value={f.name}>{f.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Button onClick={handleAnalyze} disabled={isLoading || !selectedFacility}>
                  {isLoading ? "분석 중..." : "최적 임차인 분석 실행"}
                </Button>
              </div>

              {error && <Alert variant="destructive">
                  <AlertTitle>오류</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
              </Alert>}

              {isLoading && (
                  <div className="text-center p-8">
                      <p>AI가 최적의 임차인을 분석하고 있습니다. 잠시만 기다려주세요...</p>
                  </div>
              )}

              {!isLoading && recommendations.length > 0 && (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {recommendations.map((rec, index) => (
                    <Card key={index} className="flex flex-col">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Lightbulb className="text-yellow-500" />
                          추천 업종: {rec.tenantType}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="flex-grow space-y-4">
                        <div>
                            <h4 className="font-semibold flex items-center gap-2"><Zap size={16} className="text-blue-500"/> AI 추천 사유</h4>
                            <p className="text-sm text-gray-600">{rec.reason}</p>
                        </div>
                        <div>
                           <h4 className="font-semibold flex items-center gap-2"><BarChart size={16} className="text-green-500"/>성공 지표</h4>
                           <ul className="text-sm list-disc list-inside space-y-1 mt-1">
                             <li><span className="font-medium">예상 월 매출:</span> {formatRevenue(rec.expectedMonthlyRevenue)}</li>
                             <li><span className="font-medium">성공 가능성:</span> <span className="font-bold text-indigo-600">{rec.successScore}점 / 100점</span></li>
                           </ul>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LeaseTenantPage;
