
export type TaskStatus = 'not-started' | 'in-progress' | 'pending' | 'completed';

export interface Task {
  id: string;
  name: string;
  month: number;
  week: number;
  startDate?: number; // Optional start date
  endDate?: number;   // Optional end date
  status: TaskStatus;
}
