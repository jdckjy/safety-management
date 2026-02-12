
import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import { useAppData } from './AppDataContext';
// 1. BusinessActivity 대신 Activity를 임포트합니다.
import { KPI, Activity, Task } from '../types'; 

export interface SearchResult {
  type: 'kpi' | 'activity' | 'task';
  id: string;
  title: string;
  path: string[];
}

interface SearchContextType {
  query: string;
  results: SearchResult[];
  loading: boolean;
  search: (query: string) => void;
  clear: () => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

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
    
    setTimeout(() => {
      const newResults: SearchResult[] = [];
      const normalizedQuery = newQuery.toLowerCase();

      (kpiData || []).forEach(kpi => {
          if(kpi.title.toLowerCase().includes(normalizedQuery)){
              newResults.push({ type: 'kpi', id: kpi.id, title: kpi.title, path: [kpi.type] });
          }

          (kpi.activities || []).forEach(activity => {
              if(activity.name && activity.name.toLowerCase().includes(normalizedQuery)){
                  newResults.push({ type: 'activity', id: activity.id, title: activity.name, path: [kpi.type, kpi.title] });
              }

              (activity.tasks || []).forEach(task => {
                  if(task.name && task.name.toLowerCase().includes(normalizedQuery)){
                      newResults.push({ type: 'task', id: task.id, title: task.name, path: [kpi.type, kpi.title, activity.name] });
                  }
              });
          });
      });

      setResults(newResults);
      setLoading(false);
    }, 300); 

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

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
};