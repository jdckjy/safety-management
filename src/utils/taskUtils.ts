
import { TASK_STATUS, TaskStatus, MASTER_STATUS_TRANSITION_MAP } from '../constants';
import { isBefore, parseISO } from 'date-fns';

// Task 타입을 임시로 정의합니다. 실제 프로젝트에서는 전역 types 파일에서 가져와야 합니다.
// 이 타입은 프로젝트의 다양한 부분에서 사용되는 Task 객체의 구조를 나타냅니다.
interface Task {
  id: string;
  name: string;
  status: string; // 데이터 소스에서는 다양한 문자열 값일 수 있음
  startDate: string;
  endDate: string;
}

/**
 * 업무(Task) 객체를 입력받아, 현재 시간을 기준으로 계산된 최종 상태를 반환합니다.
 * 이 함수는 두 가지 핵심 역할을 수행합니다:
 * 1. '지연' 상태 판별: 업무의 마감일이 지났지만 아직 완료되지 않았다면, 'overdue' 상태를 반환합니다.
 * 2. 상태 정제: 오래된 데이터나 다른 시스템에서 온 데이터의 다양한 상태 값(예: 'pending', 'complete')을
 *    MASTER_STATUS_TRANSITION_MAP을 사용하여 표준 상태(예: 'not-started', 'completed')로 변환합니다.
 * 
 * @param task 상태를 계산할 업무 객체
 * @returns 계산된 최종 TaskStatus ('not-started', 'in-progress', 'completed', 'overdue')
 */
export const getComputedTaskStatus = (task: Task): TaskStatus => {
  // 1. 마스터 맵을 사용하여 입력된 status를 표준 상태로 정제합니다.
  const cleanStatus = MASTER_STATUS_TRANSITION_MAP[task.status] || TASK_STATUS.NOT_STARTED;

  // 2. 날짜 유효성 검사를 포함하여 '지연' 상태를 최우선으로 확인합니다.
  try {
    const endDate = parseISO(task.endDate);
    const now = new Date();
    
    // 완료되지 않았고, 마감일이 현재 시간보다 이전이라면 '지연'으로 판단합니다.
    if (cleanStatus !== TASK_STATUS.COMPLETED && isBefore(endDate, now)) {
      return TASK_STATUS.OVERDUE;
    }
  } catch (e) {
    // endDate가 유효하지 않은 날짜 문자열일 경우, 오류를 발생시키지 않고 정제된 상태를 그대로 반환합니다.
    return cleanStatus;
  }

  // 3. '지연' 상태가 아니라면, 정제된 표준 상태를 반환합니다.
  return cleanStatus;
};
