
import React, { useState } from 'react'; // useState 임포트
import { useAnalytics } from '../hooks/useAnalytics';
import { Badge } from './ui/badge';
import BottleneckTasksModal from './BottleneckTasksModal'; // 새로 만든 모달 컴포넌트 임포트

/**
 * AnalysisDashboard 컴포넌트
 * 
 * 데이터 기반의 예측 및 분석 대시보드입니다.
 * useAnalytics 훅을 사용하여 계산된 데이터를 시각화합니다.
 * 병목 현상 감지 카드 클릭 시, 상세 내용을 모달로 표시합니다.
 */
const AnalysisDashboard = () => {
  const { 
    predictedKpiAchievement,
    bottleneckTasks,
    workloadAnalysis 
  } = useAnalytics();

  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="bg-white p-6 rounded-lg shadow-inner border border-gray-200">
        <h2 className="text-xl font-bold text-gray-800 mb-6 border-b pb-3">프로젝트 분석 대시보드</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* KPI 달성률 예측 카드 */}
          <div className="bg-gray-50 p-4 rounded-lg flex flex-col">
            <h3 className="font-semibold text-gray-600">KPI 달성률 예측</h3>
            <div className="flex-grow flex items-center justify-center">
              <p className="text-5xl font-bold text-blue-500 my-2">{predictedKpiAchievement}%</p>
            </div>
            <p className="text-sm text-gray-500 mt-1 text-center">현재 추세 유지 시 예측</p>
          </div>

          {/* [수정] 병목 현상 감지 카드: 클릭 이벤트 추가 */}
          <div 
            className="bg-gray-50 p-4 rounded-lg flex flex-col hover:bg-red-50 hover:shadow-md transition-all cursor-pointer" 
            onClick={() => setIsModalOpen(true)}
          >
            <h3 className="font-semibold text-gray-600">병목 현상 감지</h3>
            <div className="flex-grow flex items-center justify-center">
              <p className="text-5xl font-bold text-red-500 my-2">{bottleneckTasks.length}개</p>
            </div>
            <p className="text-sm text-gray-500 mt-1 text-center">지연/정체 중인 주요 업무</p>
          </div>

          {/* 업무량 분석 카드 */}
          <div className="bg-gray-50 p-4 rounded-lg flex flex-col">
            <h3 className="font-semibold text-gray-600">팀원별 업무량 분석</h3>
            <div className="flex-grow flex items-center justify-center">
              <p className={`text-3xl font-bold my-2 ${workloadAnalysis === '균형' ? 'text-green-500' : 'text-yellow-500'}`}>
                {workloadAnalysis}
              </p>
            </div>
            <p className="text-sm text-gray-500 mt-1 text-center">주요 담당자 간 업무 분배</p>
          </div>
        </div>

        {/* [삭제] 기존의 병목 업무 상세 목록 UI는 삭제됨 */}
      </div>

      {/* [추가] 병목 업무 상세 모달 */}
      <BottleneckTasksModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        tasks={bottleneckTasks} 
      />
    </>
  );
};

export default AnalysisDashboard;
