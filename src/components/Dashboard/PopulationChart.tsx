
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

// KOSIS API 응답 데이터 항목에 대한 타입 정의
interface PopulationData {
  PRD_DE: string; // 수록시점 (e.g., "202301")
  DT: string;     // 데이터 값 (인구수)
  UNIT_NM: string; // 단위
  ITM_NM: string;  // 항목명
}

// Recharts에서 사용할 데이터 형식
interface ChartData {
  month: string;
  population: number;
}

// API 요청 파라미터 (사용자 정의 가능)
// TODO: 실제 프로젝트에 맞는 값으로 수정하세요.
const API_PARAMS = {
  orgId: '101', // 기관 ID
  tblId: 'DT_1B040A3', // 통계표 ID
  objL1: '50', // 분류1: 행정구역(시군구)별. '50'은 제주특별자치도를 의미합니다.
  itmId: 'T20', // 항목: 총인구수
  prdSe: 'M', // 수록주기: 월별
  startPrdDe: '202301', // 시작수록시점
  endPrdDe: '202312', // 종료수록시점
};

const PopulationChart: React.FC = () => {
  const [data, setData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      // .env.local 파일에서 API 키를 가져옵니다.
      // 파일 최상단에 VITE_KOSIS_API_KEY=your_actual_api_key 형식으로 키를 저장하세요.
      const apiKey = import.meta.env.VITE_KOSIS_API_KEY;

      if (!apiKey) {
        setError('KOSIS API 키가 .env.local 파일에 설정되지 않았습니다. (VITE_KOSIS_API_KEY)');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await axios.get<PopulationData[]>(
          'https://kosis.kr/openapi/statisticsData.do',
          {
            params: {
              method: 'getList',
              apiKey: apiKey,
              format: 'json',
              jsonVD: 'Y',
              ...API_PARAMS,
            },
          }
        );
        
        // KOSIS API는 응답 구조가 배열 안에 배열이거나, 에러 객체를 배열로 감싸서 줄 수 있습니다.
        // @ts-ignore
        if (response.data && response.data[0] && response.data[0].err) {
            // @ts-ignore
            throw new Error(`API Error: ${response.data[0].errMsg}`);
        }

        // Recharts에 맞게 데이터 포맷을 변환합니다.
        const formattedData = response.data.map((item) => ({
          month: `${item.PRD_DE.substring(0, 4)}-${item.PRD_DE.substring(4, 6)}`,
          population: Number(item.DT),
        }));

        setData(formattedData);
      } catch (err) {
        if (axios.isAxiosError(err)) {
          setError(`데이터를 불러오는 데 실패했습니다: ${err.message}`);
        } else {
          setError(`알 수 없는 오류가 발생했습니다: ${String(err)}`);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div>데이터를 불러오는 중입니다...</div>;
  }

  if (error) {
    return <div style={{ color: 'red' }}>오류: {error}</div>;
  }

  if (data.length === 0) {
    return <div>표시할 데이터가 없습니다.</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart
        data={data}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis tickFormatter={(value) => new Intl.NumberFormat('ko-KR').format(value)} />
        <Tooltip formatter={(value: number) => [`${new Intl.NumberFormat('ko-KR').format(value)} 명`, '인구수']} />
        <Legend />
        <Line type="monotone" dataKey="population" stroke="#8884d8" name="제주특별자치도 총인구수" />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default PopulationChart;
