
import React, { useEffect, useState } from 'react';
import JejuPopulationMap from '../components/JejuPopulationMap';
import { mockPopulationData } from '../data/jeju-population-mock';

// 데이터 타입 정의
interface PopulationDataItem {
  C1_NM: string; C2_NM: string; DT: string; ITM_NM: string; PRD_DE: string;
}
interface ProcessedPopulationData {
  region: string; subRegion: string; period: string; total: string; male: string; female: string;
}

const JejuPopulationTab: React.FC = () => {
  const [populationData, setPopulationData] = useState<ProcessedPopulationData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = () => {
      try {
        setPopulationData(mockPopulationData);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div>데이터를 불러오는 중입니다...</div>;
  if (error) return <div>오류가 발생했습니다: {error}</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">제주도 행정구역별 인구 현황</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="h-96">
          <h2 className="text-xl font-semibold mb-2">제주도 지도</h2>
          <JejuPopulationMap populationData={populationData} />
        </div>
        <div className="overflow-x-auto">
           <h2 className="text-xl font-semibold mb-2">인구 통계표</h2>
          <table className="min-w-full bg-white border border-gray-200 text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-3 border-b">시/도</th> <th className="py-2 px-3 border-b">읍/면/동</th>
                <th className="py-2 px-3 border-b">조사기간</th> <th className="py-2 px-3 border-b">총인구</th>
                <th className="py-2 px-3 border-b">남자인구</th> <th className="py-2 px-3 border-b">여자인구</th>
              </tr>
            </thead>
            <tbody>
              {populationData.map((data, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="py-1 px-3 border-b text-center">{data.region}</td>
                  <td className="py-1 px-3 border-b text-center">{data.subRegion}</td>
                  <td className="py-1 px-3 border-b text-center">{data.period}</td>
                  <td className="py-1 px-3 border-b text-right">{parseInt(data.total).toLocaleString()}</td>
                  <td className="py-1 px-3 border-b text-right">{parseInt(data.male).toLocaleString()}</td>
                  <td className="py-1 px-3 border-b text-right">{parseInt(data.female).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default JejuPopulationTab;
