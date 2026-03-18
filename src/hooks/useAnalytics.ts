
import { useMemo } from 'react';
import { useProjectData } from '../providers/ProjectDataProvider';
import { KPI, Task } from '../types';
import { getComputedTaskStatus } from '../utils/taskUtils';
import { TASK_STATUS } from '../constants';
import { parseISO, differenceInDays, isAfter } from 'date-fns';

/**
 * useAnalytics 훅
 * 
 * 프로젝트 데이터 전체를 분석하여 관리자 대시보드에 필요한 심층적인 분석 지표를 계산합니다.
 * 이 훅은 예측 및 병목 현상 감지와 같은 복잡한 데이터 처리 로직을 캡슐화합니다.
 */
export const useAnalytics = () => {
  const { kpiData } = useProjectData();

  /**
   * 모든 Task를 하나의 배열로 통합합니다.
   */
  const allTasks = useMemo((): Task[] => {
    if (!kpiData) return [];
    return kpiData.flatMap(kpi => 
      kpi.activities.flatMap(activity => activity.tasks)
    );
  }, [kpiData]);

  /**
   * KPI 달성률을 예측합니다.
   * 현재는 완료된 Task의 비율을 기반으로 단순 계산합니다.
   * TODO: 향후에는 시간 경과에 따른 추세를 반영한 더 정교한 예측 모델(예: 선형 회귀)을 도입해야 합니다.
   */
  const predictedKpiAchievement = useMemo((): number => {
    if (allTasks.length === 0) return 100; // 업무가 없으면 100%로 간주

    const completedTasks = allTasks.filter(
      task => getComputedTaskStatus(task) === TASK_STATUS.COMPLETED
    );
    
    const achievementRate = (completedTasks.length / allTasks.length) * 100;
    return Math.round(achievementRate);
  }, [allTasks]);


  /**
   * 프로젝트의 병목 현상을 감지합니다.
   * 정의: "지연" 상태이거나, 마감일이 임박했음에도 "시작 전"인 업무를 병목으로 간주합니다.
   */
  const bottleneckTasks = useMemo((): Task[] => {
    const now = new Date();
    return allTasks.filter(task => {
      const status = getComputedTaskStatus(task);
      const endDate = parseISO(task.endDate);
      const isOverdue = status === TASK_STATUS.OVERDUE;
      const isStuck = status === TASK_STATUS.NOT_STARTED && differenceInDays(endDate, now) <= 3;

      return isOverdue || isStuck;
    });
  }, [allTasks]);


  /**
   * 팀원별 업무량 분배를 분석합니다.
   * 현재는 각 팀원에게 할당된 업무의 수를 기준으로 분석합니다.
   * TODO: 향후에는 업무의 예상 소요 시간이나 난이도를 가중치로 부여하여 더 정확한 업무량을 측정해야 합니다.
   */
  const workloadAnalysis = useMemo(() => {
    const memberWorkload: { [key: string]: number } = {};

    allTasks.forEach(task => {
      task.assignees?.forEach(assignee => {
        if (memberWorkload[assignee.name]) {
          memberWorkload[assignee.name]++;
        } else {
          memberWorkload[assignee.name] = 1;
        }
      });
    });

    const workloads = Object.values(memberWorkload);
    if (workloads.length < 2) return '균형'; // 비교 대상이 없으면 균형으로 판단

    const maxLoad = Math.max(...workloads);
    const minLoad = Math.min(...workloads);

    if (maxLoad > minLoad * 2) return '불균형'; // 최대 업무량이 최소의 2배를 초과하면 불균형
    
    return '균형';

  }, [allTasks]);


  return {
    predictedKpiAchievement,
    bottleneckTasks,
    workloadAnalysis,
    // 향후 추가될 분석 데이터
  };
};
