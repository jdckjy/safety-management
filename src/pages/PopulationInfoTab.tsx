import { useState, useEffect } from 'react';
import type { PopulationData } from '@/types/population';
import PopulationChart from '@/components/charts/PopulationChart';
import JejuPopulationMap from '@/components/JejuPopulationMap';
import PopulationDataTable from '@/components/PopulationDataTable';
import Demographics from '@/components/Demographics';
import { jejuPopulationActualData } from '@/data/jeju-population-actual';

const YEAR_OPTIONS = ['2020', '2021', '2022', '2023', '2024'];

export default function PopulationInfoTab() {
    const [allData, setAllData] = useState<PopulationData[]>([]);
    const [chartData, setChartData] = useState<PopulationData[]>([]);
    const [mapData, setMapData] = useState<PopulationData[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    
    const [startYear, setStartYear] = useState('2020');
    const [endYear, setEndYear] = useState('2024');

    useEffect(() => {
        const fetchData = () => {
            setLoading(true);
            setError(null);

            // Filter local data based on years
            const filteredData = jejuPopulationActualData.filter(item => {
                const year = item.PRD_DE.slice(0, 4);
                return year >= startYear && year <= endYear;
            });

            if (filteredData.length > 0) {
                // 1. In allData, include all regions (Jeju-do, Jeju-si, Seogwipo-si, and all Eup/Myeon/Dongs).
                const transformedAll = filteredData.map(item => ({
                    period: `${item.PRD_DE.slice(0, 4)}-${item.PRD_DE.slice(4, 6)}`,
                    value: Number(item.DT),
                    region: item.C1_NM,
                })).sort((a, b) => a.period.localeCompare(b.period));
                
                setAllData(transformedAll);

                // 2. For chartData, continue to use only '제주특별자치도' to show the overall trend.
                const yearlyMap = new Map<string, any>();
                filteredData.forEach(item => {
                    if (item.C1_NM === '제주특별자치도') {
                        const year = item.PRD_DE.slice(0, 4);
                        const month = item.PRD_DE.slice(4, 6);
                        if (!yearlyMap.has(year) || month > yearlyMap.get(year).month) {
                            yearlyMap.set(year, { year, month, value: Number(item.DT) });
                        }
                    }
                });

                const yearlyChartData = Array.from(yearlyMap.values())
                    .map(d => ({
                        period: d.year,
                        value: d.value,
                        region: '제주특별자치도'
                    }))
                    .sort((a, b) => a.period.localeCompare(b.period));

                setChartData(yearlyChartData);

                if (yearlyChartData.length === 0) {
                    setError("조회 기간에 해당하는 제주특별자치도 데이터가 없습니다.");
                }

                // 3. For mapData, prioritize showing Eup/Myeon/Dong if available in the latest period.
                const getLatestPopulationByRegion = (data: PopulationData[]): PopulationData[] => {
                    if (data.length === 0) return [];
                    const latestPeriod = data.reduce((max, p) => p.period > max ? p.period : max, data[0].period);
                    const latestData = data.filter(d => d.period === latestPeriod);
                    
                    // Filter for Eup/Myeon/Dongs (excluding top-level regions for detail map if they exist)
                    const details = latestData.filter(d => 
                        d.region !== '제주특별자치도' && 
                        d.region !== '제주시' && 
                        d.region !== '서귀포시'
                    );

                    // Fallback to city level if no Eup/Myeon/Dong data
                    if (details.length > 0) return details;
                    return latestData.filter(d => d.region.includes('제주시') || d.region.includes('서귀포시'));
                };
                const latestByRegion = getLatestPopulationByRegion(transformedAll);
                setMapData(latestByRegion);
            } else {
                setError("조회 기간에 해당하는 데이터가 없습니다.");
                setAllData([]);
                setChartData([]);
                setMapData([]);
            }
            setLoading(false);
        };

        fetchData();
    }, [startYear, endYear]);

    return (
        <div className="py-4">
            <div className="bg-gray-100 p-4 rounded-lg mb-8 flex items-center gap-4">
                <h3 className="text-md font-semibold">조회 기간 설정</h3>
                <select value={startYear} onChange={e => setStartYear(e.target.value)} className="border-gray-300 rounded-md">{YEAR_OPTIONS.map(y => <option key={y} value={y}>{y}년</option>)}</select>
                <span>~</span>
                <select value={endYear} onChange={e => setEndYear(e.target.value)} className="border-gray-300 rounded-md">{YEAR_OPTIONS.map(y => <option key={y} value={y}>{y}년</option>)}</select>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <p className='text-lg font-semibold text-gray-500'>인구 통계 데이터를 불러오는 중입니다...</p>
                </div>
            ) : error ? (
                <div className="text-red-600 bg-red-100 p-4 rounded-md">⚠️ {error}</div>
            ) : (
                <>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                        <div>
                            <h3 className="text-lg font-semibold mb-4">제주도 연도별 인구 추이</h3>
                            {chartData.length > 0 ? <PopulationChart data={chartData} /> : <div className="flex items-center justify-center h-full bg-gray-50 rounded-md"><p className='text-gray-500'>차트 데이터가 없습니다.</p></div>}
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold mb-4">최신 인구 현황 (상세 읍면동)</h3>
                            {mapData.length > 0 ? <JejuPopulationMap latestPopulation={mapData} /> : <div className="flex items-center justify-center h-full bg-gray-50 rounded-md"><p className='text-gray-500'>지도 데이터가 없습니다.</p></div>}
                        </div>
                    </div>
                    {/* 4. Ensure the DataTable displays all regions correctly. */}
                    <PopulationDataTable data={allData} />
                    
                    <div className="mt-12">
                        <Demographics />
                    </div>
                </>
            )}
        </div>
    );
}