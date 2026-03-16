
import React, { useState, useMemo } from 'react';
import { useProjectData } from '@/providers/ProjectDataProvider';
import { getOptimalTenantRecommendations, Recommendation } from '@/services/aiTenantRecommender';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Lightbulb, Zap, BarChart, Building, Percent } from 'lucide-react';
import { UNIT_STATUS } from '@/constants';

const LeaseTenantPage: React.FC = () => {
  const { complexFacilities, tenantUnits } = useProjectData();
  const [activeTab, setActiveTab] = useState("tenantRoster");
  const [selectedFacility, setSelectedFacility] = useState<string>("");
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const commercialFacilities = complexFacilities.filter(f => 
    f.category.includes('상가') || f.category.includes('몰') || f.category.includes('스트리트')
  );

  const leaseRateStats = useMemo(() => {
    const calculateRate = (units: any[]) => {
      if (units.length === 0) return { rate: 0, occupied: 0, inDiscussion: 0, vacant: 0, totalRentable: 0 };

      const occupiedArea = units
        .filter(u => u.status === UNIT_STATUS.OCCUPIED)
        .reduce((sum, u) => sum + u.area, 0);

      const inDiscussionArea = units
        .filter(u => u.status === UNIT_STATUS.IN_DISCUSSION)
        .reduce((sum, u) => sum + u.area, 0);
        
      const vacantArea = units
        .filter(u => u.status === UNIT_STATUS.VACANT)
        .reduce((sum, u) => sum + u.area, 0);

      const totalRentableArea = occupiedArea + inDiscussionArea + vacantArea;
      
      if (totalRentableArea === 0) return { rate: 0, occupied: 0, inDiscussion: 0, vacant: 0, totalRentable: 0 };

      const rate = (occupiedArea / totalRentableArea) * 100;

      return {
        rate: parseFloat(rate.toFixed(2)),
        occupied: occupiedArea,
        inDiscussion: inDiscussionArea,
        vacant: vacantArea,
        totalRentable: totalRentableArea
      };
    };

    const allUnits = tenantUnits;
    const floor1Units = allUnits.filter(u => u.floor === '1F');
    const floor2Units = allUnits.filter(u => u.floor === '2F');
    const floor3Units = allUnits.filter(u => u.floor === '3F');

    return {
      total: calculateRate(allUnits),
      '1F': calculateRate(floor1Units),
      '2F': calculateRate(floor2Units),
      '3F': calculateRate(floor3Units),
    };
  }, [tenantUnits]);


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
                    <CardTitle>임대율 현황</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* 전체 임대율 */}
                    <div className="bg-gray-50 rounded-lg p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Building className="w-8 h-8 text-blue-600" />
                                <h3 className="text-xl font-bold text-gray-800">전체 임대율</h3>
                            </div>
                            <div className="text-3xl font-bold text-blue-600">
                                {leaseRateStats.total.rate}%
                            </div>
                        </div>
                        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                            <div>
                                <p className="text-sm text-gray-500">임대 면적</p>
                                <p className="text-lg font-semibold">{leaseRateStats.total.occupied.toLocaleString()} m²</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">협의중 면적</p>
                                <p className="text-lg font-semibold">{leaseRateStats.total.inDiscussion.toLocaleString()} m²</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">공실 면적</p>
                                <p className="text-lg font-semibold">{leaseRateStats.total.vacant.toLocaleString()} m²</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">총 임대가능 면적</p>
                                <p className="text-lg font-semibold">{leaseRateStats.total.totalRentable.toLocaleString()} m²</p>
                            </div>
                        </div>
                    </div>

                    {/* 층별 임대율 */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {(['1F', '2F', '3F'] as const).map(floor => (
                            <Card key={floor}>
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-lg font-medium">{floor} 임대율</CardTitle>
                                    <Percent className="w-5 h-5 text-gray-400" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-gray-800">{leaseRateStats[floor].rate}%</div>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {leaseRateStats[floor].occupied.toLocaleString()} m² / {leaseRateStats[floor].totalRentable.toLocaleString()} m²
                                    </p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
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
                        ))}\
                    </SelectContent>
                </Select>
                <Button onClick={handleAnalyze} disabled={isLoading || !selectedFacility}>
                  {isLoading ? "분석 중..." : "최적 임차인 분석 실행"}\
                </Button>
              </div>

              {error && <Alert variant="destructive">\
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
