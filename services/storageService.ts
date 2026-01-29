
import { Facility, InspectionLog, InspectionItem, TaskKPI } from '../types';
import { MOCK_FACILITIES, MOCK_LOGS, INITIAL_INSPECTION_ITEMS, MOCK_KPI_DATA } from '../constants';

const KEYS = {
  FACILITIES: 'safelink_db_facilities',
  LOGS: 'safelink_db_logs',
  INSPECTION_ITEMS: 'safelink_db_inspection_items',
  KPI_DATA: 'safelink_db_kpi_data',
  INITIALIZED: 'safelink_db_initialized'
};

/**
 * 브라우저 로컬 스토리지를 활용한 경량 DB 서비스
 */
export const db = {
  // 초기 데이터 세팅 (최초 1회 실행)
  init: () => {
    const isInit = localStorage.getItem(KEYS.INITIALIZED);
    if (!isInit) {
      localStorage.setItem(KEYS.FACILITIES, JSON.stringify(MOCK_FACILITIES));
      localStorage.setItem(KEYS.LOGS, JSON.stringify(MOCK_LOGS));
      localStorage.setItem(KEYS.INSPECTION_ITEMS, JSON.stringify(INITIAL_INSPECTION_ITEMS));
      localStorage.setItem(KEYS.KPI_DATA, JSON.stringify(MOCK_KPI_DATA));
      localStorage.setItem(KEYS.INITIALIZED, 'true');
      console.log('[DB] Database initialized with seed data.');
    }
  },

  // 시설물 데이터
  getFacilities: (): Facility[] => {
    const data = localStorage.getItem(KEYS.FACILITIES);
    return data ? JSON.parse(data) : [];
  },
  saveFacilities: (data: Facility[]) => {
    localStorage.setItem(KEYS.FACILITIES, JSON.stringify(data));
  },

  // 점검 로그(마커) 데이터
  getLogs: (): InspectionLog[] => {
    const data = localStorage.getItem(KEYS.LOGS);
    return data ? JSON.parse(data) : [];
  },
  saveLogs: (data: InspectionLog[]) => {
    localStorage.setItem(KEYS.LOGS, JSON.stringify(data));
  },

  // 점검 항목(테이블) 데이터
  getInspectionItems: (): InspectionItem[] => {
    const data = localStorage.getItem(KEYS.INSPECTION_ITEMS);
    return data ? JSON.parse(data) : [];
  },
  saveInspectionItems: (data: InspectionItem[]) => {
    localStorage.setItem(KEYS.INSPECTION_ITEMS, JSON.stringify(data));
  },

  // KPI 데이터
  getKpiData: (): TaskKPI[] => {
    const data = localStorage.getItem(KEYS.KPI_DATA);
    return data ? JSON.parse(data) : [];
  },
  saveKpiData: (data: TaskKPI[]) => {
    localStorage.setItem(KEYS.KPI_DATA, JSON.stringify(data));
  },
  
  // 전체 초기화 (문제 발생 시 복구용)
  resetAll: () => {
    localStorage.removeItem(KEYS.INITIALIZED);
    db.init();
    window.location.reload();
  }
};
