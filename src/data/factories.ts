
import { KPI, BusinessActivity, Plan, MonthlyRecord, Pulse } from '../types';

// A default pulse object to ensure it's never undefined
const defaultPulse: Pulse = {
  value: 0,
  trend: 'stable',
};

// Factory to create a KPI object with all necessary defaults
export const createKpi = (partialKpi: Partial<KPI>): KPI => {
  // Basic structure with guaranteed defaults
  const baseKpi: KPI = {
    id: `kpi-${Date.now()}-${Math.random()}`,
    name: 'Unnamed KPI',
    current: 0,
    target: 100,
    unit: ''
    ,
    pulse: { ...defaultPulse }, // Always include a pulse object
    activities: [], // Default to an empty array
  };

  // Merge the provided partial data with the base structure
  const finalKpi = { ...baseKpi, ...partialKpi };

  // Ensure pulse is valid, even if partialKpi had a partial pulse
  finalKpi.pulse = { ...defaultPulse, ...finalKpi.pulse };

  return finalKpi;
};

// Factory for BusinessActivity
export const createBusinessActivity = (partialActivity: Partial<BusinessActivity>): BusinessActivity => ({
  id: `activity-${Date.now()}`,
  content: 'New Business Activity',
  status: 'ongoing',
  date: new Date().toISOString().split('T')[0],
  monthlyRecords: [],
  ...partialActivity,
});

// Factory for Plan
export const createPlan = (partialPlan: Partial<Plan>): Plan => ({
  id: `plan-${Date.now()}`,
  content: 'New Plan',
  completed: false,
  ...partialPlan,
});
