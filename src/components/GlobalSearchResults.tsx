
import React from 'react';
import { FileText, Activity, Target } from 'lucide-react';
import { useSearch, SearchResult } from '../providers/SearchProvider';

const ResultIcon = ({ type }: { type: SearchResult['type'] }) => {
    switch (type) {
        case 'kpi': return <Target size={20} className="text-blue-500" />;
        case 'activity': return <Activity size={20} className="text-green-500" />;
        case 'task': return <FileText size={20} className="text-purple-500" />;
        default: return null;
    }
};

/**
 * 전역 검색 결과를 표시하는 드롭다운 컴포넌트입니다.
 */
const GlobalSearchResults: React.FC = () => {
  const { results, loading, query } = useSearch();

  if (!query) return null; // 검색어가 없으면 아무것도 렌더링하지 않음

  return (
    <div className="absolute top-full mt-2 w-full max-w-xs bg-white rounded-2xl shadow-lg border border-gray-100 z-50">
        <div className="p-4 border-b border-gray-100">
            <h3 className="font-bold text-gray-800">검색 결과</h3>
        </div>
        <div className="max-h-96 overflow-y-auto scrollbar-hide">
            {loading ? (
                <div className="p-4 text-center text-gray-500">검색 중...</div>
            ) : results.length === 0 ? (
                <div className="p-4 text-center text-gray-500">''{query}''에 대한 결과가 없습니다.</div>
            ) : (
                results.map((result) => (
                    <div key={result.id} className="flex items-center gap-4 p-4 border-b border-gray-100 transition-colors hover:bg-gray-50 cursor-pointer">
                        <ResultIcon type={result.type} />
                        <div className="flex-1 overflow-hidden">
                            <p className="text-sm font-bold text-gray-800 truncate">{result.title}</p>
                            <p className="text-xs text-gray-500 truncate">{result.path.join(' > ')}</p>
                        </div>
                    </div>
                ))
            )}
        </div>
    </div>
  );
};

export default GlobalSearchResults;
