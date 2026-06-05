export interface KosisResponse {
  [key: string]: string;
}

export interface PopulationData {
  period: string; // 시점 (예: 2023년 01월)
  value: number; // 데이터 (예: 인구수)
  region: string; // 지역
}
