
import { Facility, InspectionLog, InspectionItem, TaskKPI } from '../types';
import { MOCK_FACILITIES, MOCK_LOGS, INITIAL_INSPECTION_ITEMS, MOCK_KPI_DATA } from '../constants';

// 데이터 격리를 위한 v6 키 설정
const KEYS = {
  FACILITIES: 'safelink_db_facilities_v6',
  LOGS: 'safelink_db_logs_v6',
  INSPECTION_ITEMS: 'safelink_db_inspection_items_v6',
  KPI_DATA: 'safelink_db_kpi_data_v6',
  INITIALIZED: 'safelink_db_initialized_v6'
};

export const db = {
  /**
   * 데이터가 유실되었는지 확인하고, 유실되었다면 원본에서 즉시 복구합니다.
   */
  init: () => {
    const isInitialized = localStorage.getItem(KEYS.INITIALIZED);
    const facilities = localStorage.getItem(KEYS.FACILITIES);
    
    // 초기화가 안 되어 있거나, 중요한 시설 데이터가 비어있는 경우 강제 복구
    if (!isInitialized || !facilities || JSON.parse(facilities).length === 0) {
      console.warn('[DB] Data loss detected or first run. Recovering from master seed...');
      localStorage.setItem(KEYS.FACILITIES, JSON.stringify(MOCK_FACILITIES));
      localStorage.setItem(KEYS.LOGS, JSON.stringify(MOCK_LOGS));
      localStorage.setItem(KEYS.INSPECTION_ITEMS, JSON.stringify(INITIAL_INSPECTION_ITEMS));
      localStorage.setItem(KEYS.KPI_DATA, JSON.stringify(MOCK_KPI_DATA));
      localStorage.setItem(KEYS.INITIALIZED, 'true');
    }
  },

  getFacilities: (): Facility[] => {
    const data = localStorage.getItem(KEYS.FACILITIES);
    if (!data || JSON.parse(data).length === 0) return MOCK_FACILITIES;
    return JSON.parse(data);
  },
  saveFacilities: (data: Facility[]) => {
    localStorage.setItem(KEYS.FACILITIES, JSON.stringify(data));
  },

  getLogs: (): InspectionLog[] => {
    const data = localStorage.getItem(KEYS.LOGS);
    return data ? JSON.parse(data) : MOCK_LOGS;
  },
  saveLogs: (data: InspectionLog[]) => {
    localStorage.setItem(KEYS.LOGS, JSON.stringify(data));
  },

  getInspectionItems: (): InspectionItem[] => {
    const data = localStorage.getItem(KEYS.INSPECTION_ITEMS);
    if (!data || JSON.parse(data).length === 0) return INITIAL_INSPECTION_ITEMS;
    return JSON.parse(data);
  },
  saveInspectionItems: (data: InspectionItem[]) => {
    localStorage.setItem(KEYS.INSPECTION_ITEMS, JSON.stringify(data));
  },
  
  getKpiData: (): TaskKPI[] => {
    const data = localStorage.getItem(KEYS.KPI_DATA);
    if (!data || JSON.parse(data).length === 0) return MOCK_KPI_DATA;
    return JSON.parse(data);
  },
  saveKpiData: (data: TaskKPI[]) => {
    localStorage.setItem(KEYS.KPI_DATA, JSON.stringify(data));
  },

  resetAll: () => {
    localStorage.clear();
    window.location.reload();
  }
};
