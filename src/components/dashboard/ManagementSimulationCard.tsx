
import React from 'react';
import { RefreshCw } from 'lucide-react';
import { useProjectData } from '@/providers/ProjectDataProvider';
import { Badge } from '../ui/badge';

const ManagementSimulationCard: React.FC = () => {
    const { latestEvaluationResult } = useProjectData();

    // 전역 상태에서 점수를 가져오고, 없을 경우 0으로 초기화합니다.
    const currentScore = latestEvaluationResult?.score ?? 0;
    const targetScore = 2.5; // 총 배점 2.5점 기준

    const percentage = targetScore > 0 ? (currentScore / targetScore) * 100 : 0;
    const neededScore = targetScore - currentScore;

    const getBadgeInfo = (p: number) => {
        if (p >= 80) return { text: 'Excellent', className: 'bg-green-100 text-green-800' };
        if (p >= 60) return { text: 'Good', className: 'bg-blue-100 text-blue-800' };
        if (p >= 40) return { text: 'Watch', className: 'bg-yellow-100 text-yellow-800' };
        return { text: 'Risk', className: 'bg-red-100 text-red-800' };
    };

    const badgeInfo = getBadgeInfo(percentage);

    return (
        <div className="bg-white p-6 rounded-2xl shadow-md h-full flex flex-col">
            <div className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-gray-900">경영평가 시뮬레이션</h3>
                    <Badge className={badgeInfo.className}>{badgeInfo.text}</Badge>
                </div>
                <RefreshCw className="h-5 w-5 text-gray-400 cursor-pointer hover:text-gray-600" />
            </div>
            <div className="flex-grow flex flex-col items-center justify-center text-center pt-4">
                <Badge className="mb-2 bg-purple-100 text-purple-800 font-medium py-1 px-3 rounded-full">현시점 득점</Badge>
                
                <div className="text-5xl font-bold text-purple-600">
                    {currentScore.toFixed(3)}<span className="text-3xl font-medium text-gray-500 ml-1">점</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">총 배점 {targetScore.toFixed(1)}점 기준</p>

                <div className="w-full mt-6">
                    <div className="flex justify-between items-end mb-1">
                        <p className="text-sm font-medium text-gray-700">득점 확보 현황</p>
                        <p className="text-sm text-gray-500">{targetScore.toFixed(1)}점 (목표)</p>
                    </div>
                    <div className="relative w-full bg-gray-200 rounded-full h-3">
                        <div 
                            className="bg-purple-600 h-3 rounded-full" 
                            style={{ width: `${percentage}%` }}
                        ></div>
                        <div 
                            className="absolute top-1/2 -translate-y-1/2 border-l-2 border-dashed border-gray-400" 
                            style={{left: '100%', height: '20px' }}>
                        </div>
                    </div>
                    <div className="flex justify-between mt-1">
                        <span className="text-sm font-medium text-gray-800">{currentScore.toFixed(3)}점 / {targetScore.toFixed(3)}점</span>
                        <span className="text-sm font-bold text-purple-600">{percentage.toFixed(2)}%</span>
                    </div>
                </div>

                <div className="w-full border-t my-5"></div>

                <div className="grid grid-cols-3 gap-4 w-full">
                    <div>
                        <p className="text-sm text-gray-500">현재 점수</p>
                        <p className="text-2xl font-bold text-gray-800 mt-1">{currentScore.toFixed(3)}</p>
                        <p className="text-xs text-gray-500">({percentage.toFixed(2)}%)</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">목표 점수</p>
                        <p className="text-2xl font-bold text-blue-600 mt-1">{targetScore.toFixed(3)}</p>
                        <p className="text-xs text-gray-500">(100%)</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">추가 확보 필요</p>
                        <p className="text-2xl font-bold text-orange-500 mt-1">{neededScore.toFixed(3)}</p>
                        <p className="text-xs text-gray-500">({(100 - percentage).toFixed(2)}% 부족)</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManagementSimulationCard;
