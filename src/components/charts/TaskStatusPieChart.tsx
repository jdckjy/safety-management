
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { TASK_STATUS, TASK_STATUS_DISPLAY_NAMES } from '../../constants';

interface TaskStatusPieChartProps {
  stats: {
    completed: number;
    inProgress: number;
    notStarted: number;
    overdue: number;
  };
}

// '완료' 상태에 대한 색상을 붉은색 계열로 변경
const COMPLETED_COLOR = '#EF4444'; // 진한 빨강
const INCOMPLETE_COLOR = '#FEE2E2'; // 연한 빨강 (배경색)

const TaskStatusPieChart: React.FC<TaskStatusPieChartProps> = ({ stats }) => {
  const totalTasks = stats.completed + stats.inProgress + stats.notStarted + stats.overdue;
  const incompleteTasks = totalTasks - stats.completed;
  const completionRate = totalTasks > 0 ? (stats.completed / totalTasks) * 100 : 0;
  const currentYear = new Date().getFullYear();

  // 프로그레스 차트 데이터: 완료 vs 미완료
  const progressChartData = [
    { name: 'completed', value: stats.completed },
    { name: 'incomplete', value: Math.max(0, incompleteTasks) },
  ];

  // 업무가 하나도 없을 때 배경만 표시하기 위한 처리
  if (totalTasks === 0) {
    progressChartData[0].value = 0;
    progressChartData[1].value = 1;
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-md h-full flex flex-col">
      <h3 className="text-lg font-semibold text-gray-900">{currentYear}년 업무진척도</h3>
      <div className="flex-grow flex flex-col items-center justify-center mt-4">
        <div className="relative h-48 w-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <defs>
                <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                  <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="rgba(0,0,0,0.1)" />
                </filter>
              </defs>
              <Pie
                data={progressChartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={75}
                startAngle={90}
                endAngle={450}
                paddingAngle={0}
                dataKey="value"
                stroke="none"
                filter="url(#shadow)"
              >
                <Cell key="cell-completed" fill={COMPLETED_COLOR} />
                <Cell key="cell-incomplete" fill={INCOMPLETE_COLOR} />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
            <span className="text-4xl font-bold text-gray-800">{completionRate.toFixed(0)}<span className="text-2xl text-gray-500">%</span></span>
            <span className="text-sm text-gray-500">완료율</span>
          </div>
        </div>
        
        {/* '임대 현황'과 동일한 고정 2항목 + 총계 구조 */}
        <div className="w-full mt-6 space-y-3">
          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COMPLETED_COLOR }}></div>
              <span className="text-gray-600">{TASK_STATUS_DISPLAY_NAMES[TASK_STATUS.COMPLETED]}</span>
            </div>
            <span className="font-semibold text-gray-800">{stats.completed}건</span>
          </div>

          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: INCOMPLETE_COLOR }}></div>
              <span className="text-gray-600">미완료</span>
            </div>
            <span className="font-semibold text-gray-800">{incompleteTasks}건</span>
          </div>

          <div className="border-t border-gray-200 my-3"></div>

          <div className="flex justify-between items-center text-sm font-bold">
            <span className="text-gray-800">총 업무</span>
            <span className="text-gray-800">{totalTasks}건</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskStatusPieChart;
