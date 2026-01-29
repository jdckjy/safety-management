
import { Facility, InspectionLog, InspectionItem, TaskKPI } from '../types';
import { MOCK_FACILITIES, MOCK_LOGS, INITIAL_INSPECTION_ITEMS, MOCK_KPI_DATA } from '../constants';

const KEYS = {
  FACILITIES: 'safelink_db_facilities_v2',
  LOGS: 'safelink_db_logs_v2',
  INSPECTION_ITEMS: 'safelink_db_inspection_items_v2',
  KPI_DATA: 'safelink_db_kpi_data_v2',
  INITIALIZED: 'safelink_db_initialized_v2'
};

export const db = {
  init: () => {
    const isInit = localStorage.getItem(KEYS.INITIALIZED);
    if (!isInit) {
      localStorage.setItem(KEYS.FACILITIES, JSON.stringify(MOCK_FACILITIES));
      localStorage.setItem(KEYS.LOGS, JSON.stringify(MOCK_LOGS));
      localStorage.setItem(KEYS.INSPECTION_ITEMS, JSON.stringify(INITIAL_INSPECTION_ITEMS));
      localStorage.setItem(KEYS.KPI_DATA, JSON.stringify(MOCK_KPI_DATA));
      localStorage.setItem(KEYS.INITIALIZED, 'true');
    }
  },

  getFacilities: () => JSON.parse(localStorage.getItem(KEYS.FACILITIES) || '[]'),
  saveFacilities: (data: Facility[]) => localStorage.setItem(KEYS.FACILITIES, JSON.stringify(data)),

  getLogs: () => JSON.parse(localStorage.getItem(KEYS.LOGS) || '[]'),
  saveLogs: (data: InspectionLog[]) => localStorage.setItem(KEYS.LOGS, JSON.stringify(data)),

  getInspectionItems: () => JSON.parse(localStorage.getItem(KEYS.INSPECTION_ITEMS) || '[]'),
  saveInspectionItems: (data: InspectionItem[]) => localStorage.setItem(KEYS.INSPECTION_ITEMS, JSON.stringify(data)),

  resetAll: () => {
    localStorage.clear();
    db.init();
    window.location.reload();
  }
};
