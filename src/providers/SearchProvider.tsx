
import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import { useAppData } from './AppDataContext';
import { KPI, Activity, Task } from '../types';

// 1. 검색 결과 타입을 정의
export interface SearchResult {
  type: 'kpi' | 'activity' | 'task';
  id: string;
  title: string;
  path: string[]; // 예: ['안전 관리', '안전보건 점검', '주간 순회 점검']
}

// 2. Context 타입 정의
interface SearchContextType {
  query: string;
  results: SearchResult[];
  loading: boolean;
  search: (query: string) => void;
  clear: () => void;
}

// 3. Context 생성
const SearchContext = createContext<SearchContextType | undefined>(undefined);

// 4. Provider 컴포넌트 생성
export const SearchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { kpiData } = useAppData();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  const search = useCallback((newQuery: string) => {
    setQuery(newQuery);
    if (!newQuery.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    
    // 실제 애플리케이션에서는 이 로직이 서버의 검색 API를 호출할 수 있습니다.
    // 여기서는 클라이언트 사이드 검색을 시뮬레이션합니다.
    setTimeout(() => {
      const newResults: SearchResult[] = [];
      const normalizedQuery = newQuery.toLowerCase();

      if (!kpiData) {
        setResults([]);
        setLoading(false);
        return;
      }
      
      const allKpis: {category: string, kpis: KPI[]}[] = [
          { category: '안전 관리', kpis: kpiData.safetyKPIs || [] },
          { category: '임대 및 세대 관리', kpis: kpiData.leaseKPIs || [] },
          { category: '자산 가치 관리', kpis: kpiData.assetKPIs || [] },
          { category: '인프라 개발', kpis: kpiData.infraKPIs || [] },
      ];

      allKpis.forEach(({category, kpis}) => {
          kpis.forEach(kpi => {
              if(kpi.name.toLowerCase().includes(normalizedQuery)){
                  newResults.push({ type: 'kpi', id: kpi.id, title: kpi.name, path: [category] });
              }

              (kpi.activities || []).forEach(activity => {
                  if(activity.name.toLowerCase().includes(normalizedQuery)){
                      newResults.push({ type: 'activity', id: activity.id, title: activity.name, path: [category, kpi.name] });
                  }

                  (activity.tasks || []).forEach(task => {
                      if(task.name.toLowerCase().includes(normalizedQuery)){
                          newResults.push({ type: 'task', id: task.id, title: task.name, path: [category, kpi.name, activity.name] });
                      }
                  });
              });
          });
      });

      setResults(newResults);
      setLoading(false);
    }, 300); // 네트워크 지연 시뮬레이션

  }, [kpiData]);

  const clear = useCallback(() => {
    setQuery('');
    setResults([]);
  }, []);

  const value = { query, results, loading, search, clear };

  return (
    <SearchContext.Provider value={value}>
      {children}
    </SearchContext.Provider>
  );
};

// 5. 커스텀 훅 생성
export const useSearch = () => {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
};