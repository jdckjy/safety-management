
import { Contract } from '../types';

// This file is generated based on the legacy `tenantUnits` data.
// It represents the contractual relationship between a tenant and a unit.

// Helper function to get today's date in YYYY-MM-DD format
const getDummyDate = (year: number, month: number, day: number) => {
  const date = new Date(year, month - 1, day);
  return date.toISOString().split('T')[0];
};

export const initialContracts: Contract[] = [
  // KMI Contracts
  { 
    id: 'contract-kmi-1', 
    tenantId: 'tenant-kmi', 
    unitId: '1F_KMI_01', // 건강검진센터 1
    startDate: getDummyDate(2023, 1, 1), 
    endDate: getDummyDate(2028, 12, 31),
    area: 744.07, // area from unit
  },
  { 
    id: 'contract-kmi-2', 
    tenantId: 'tenant-kmi', 
    unitId: '1F_KMI_02', // 편의시설
    startDate: getDummyDate(2023, 1, 1), 
    endDate: getDummyDate(2028, 12, 31),
    area: 274.05,
  },
  { 
    id: 'contract-kmi-3', 
    tenantId: 'tenant-kmi', 
    unitId: '2F_KMI_01', // 건강검진센터 2
    startDate: getDummyDate(2023, 1, 1), 
    endDate: getDummyDate(2028, 12, 31),
    area: 783.04,
  },
  { 
    id: 'contract-kmi-4', 
    tenantId: 'tenant-kmi', 
    unitId: '2F_CL_01', // 의원 1
    startDate: getDummyDate(2023, 1, 1), 
    endDate: getDummyDate(2028, 12, 31),
    area: 104.49,
  },
  { 
    id: 'contract-kmi-5', 
    tenantId: 'tenant-kmi', 
    unitId: '2F_CAFE_1', // 카페 1
    startDate: getDummyDate(2023, 1, 1), 
    endDate: getDummyDate(2028, 12, 31),
    area: 66,
  },
  { 
    id: 'contract-kmi-6', 
    tenantId: 'tenant-kmi', 
    unitId: '3F_RES_LG', // 대형연구실
    startDate: getDummyDate(2023, 1, 1), 
    endDate: getDummyDate(2028, 12, 31),
    area: 250.26,
  },

  // JDC Contracts
  { 
    id: 'contract-jdc-1', 
    tenantId: 'tenant-jdc', 
    unitId: '1F_JDC_02', // 용역원실
    startDate: getDummyDate(2022, 5, 1), 
    endDate: getDummyDate(2027, 4, 30),
    area: 39,
  },
  { 
    id: 'contract-jdc-2', 
    tenantId: 'tenant-jdc', 
    unitId: '3F_CONV', // 컨벤션 (대관)
    startDate: getDummyDate(2022, 5, 1), 
    endDate: getDummyDate(2027, 4, 30),
    area: 499.66,
  },

  // Dental Clinic Contract
  { 
    id: 'contract-dental-1', 
    tenantId: 'tenant-dental', 
    unitId: '2F_DENT', // 의원 5 (치과)
    startDate: getDummyDate(2024, 3, 15), 
    endDate: getDummyDate(2029, 3, 14),
    area: 104.49,
  },

  // Peace Village Contract
  { 
    id: 'contract-peace-1', 
    tenantId: 'tenant-peace-village', 
    unitId: '2F_CAFE_2', // 카페 2
    startDate: getDummyDate(2023, 8, 1), 
    endDate: getDummyDate(2025, 7, 31),
    area: 105.95,
  },

  // KOHUBI Contract
  { 
    id: 'contract-kohubi-1', 
    tenantId: 'tenant-kohubi', 
    unitId: '3F_INST', // 의원 11~13/중앙관리
    startDate: getDummyDate(2022, 1, 1), 
    endDate: getDummyDate(2026, 12, 31),
    area: 417.96,
  },
];
