
import { TenantUnit } from '../types';

export const initialTenantUnits: TenantUnit[] = [
  // 1F
  { id: '1F_KMI_01', floor: '1F', name: '건강검진센터 1', area: 744.07, status: 'occupied', agency: 'KMI' },
  { id: '1F_KMI_02', floor: '1F', name: '편의시설', area: 274.05, status: 'occupied', agency: 'KMI' },
  { id: '1F_JDC_01', floor: '1F', name: '사무실', area: 70.47, status: 'occupied', agency: 'JDC' },
  { id: '1F_JDC_02', floor: '1F', name: '용역원실', area: 39.00, status: 'occupied', agency: 'JDC' },
  // 2F
  { id: '2F_KMI_01', floor: '2F', name: '건강검진센터 2', area: 783.04, status: 'occupied', agency: 'KMI' },
  { id: '2F_CL_01', floor: '2F', name: '의원 1', area: 104.49, status: 'occupied', agency: 'KMI' },
  { id: '2F_CL_02', floor: '2F', name: '의원 2', area: 104.49, status: 'vacant', agency: '(미지정)' },
  { id: '2F_CL_03', floor: '2F', name: '의원 3', area: 104.49, status: 'vacant', agency: '(미지정)' },
  { id: '2F_CL_04', floor: '2F', name: '의원 4', area: 204.20, status: 'vacant', agency: '(미지정)' },
  { id: '2F_DENT', floor: '2F', name: '의원 5 (치과)', area: 104.49, status: 'occupied', agency: '치과의원' },
  { id: '2F_CL_06', floor: '2F', name: '의원 6', area: 104.49, status: 'vacant', agency: '(미지정)' },
  { id: '2F_CL_07', floor: '2F', name: '의원 7', area: 104.49, status: 'vacant', agency: '(미지정)' },
  { id: '2F_CAFE_1', floor: '2F', name: '카페 1', area: 66.00, status: 'occupied', agency: 'KMI' },
  { id: '2F_CAFE_2', floor: '2F', name: '카페 2', area: 105.95, status: 'occupied', agency: '평화의 마을' },
  // 3F
  { id: '3F_CL_08', floor: '3F', name: '의원 8', area: 104.49, status: 'vacant', agency: '(미지정)' },
  { id: '3F_CL_09', floor: '3F', name: '의원 9', area: 104.49, status: 'vacant', agency: '(미지정)' },
  { id: '3F_INST', floor: '3F', name: '의원 11~13/중앙관리', area: 417.96, status: 'occupied', agency: '한국보건복지인재원' },
  { id: '3F_RES_LG', floor: '3F', name: '대형연구실', area: 250.26, status: 'occupied', agency: 'KMI' },
  { id: '3F_CONV', floor: '3F', name: '컨벤션 (대관)', area: 499.66, status: 'occupied', agency: 'JDC' },
  { id: '3F_RES_S1', floor: '3F', name: '소형연구실 1', area: 28.64, status: 'vacant', agency: '(미지정)' },
  { id: '3F_RES_S2', floor: '3F', name: '소형연구실 2', area: 27.26, status: 'vacant', agency: '(미지정)' },
];
