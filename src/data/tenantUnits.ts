
import { TenantUnit } from '../types';

export const tenantUnits: TenantUnit[] = [
  // 1F
  { id: '1F_KMI_01', floor: '1F', name: '건강검진센터 1', area: 744.07, status: 'OCCUPIED', tenant: 'KMI', pathData: "M 381, 720 L 587, 720 L 587, 850 L 381, 850 Z" },
  { id: '1F_KMI_02', floor: '1F', name: '편의시설', area: 274.05, status: 'OCCUPIED', tenant: 'KMI', pathData: "M 587, 720 L 736, 720 L 736, 788 L 587, 788 Z" },
  { id: '1F_JDC_02', floor: '1F', name: '용역원실', area: 39, status: 'OCCUPIED', tenant: 'JDC', pathData: "M 736, 563 L 851, 563 L 851, 719 L 736, 719 Z" },

  // 2F
  { id: '2F_KMI_01', floor: '2F', name: '건강검진센터 2', area: 783.04, status: 'OCCUPIED', tenant: 'KMI', pathData: "M 386, 703 L 592, 703 L 592, 824 L 386, 824 Z" },
  { id: '2F_CL_01', floor: '2F', name: '의원 1', area: 104.49, status: 'OCCUPIED', tenant: 'KMI', pathData: "M 740, 680 L 855, 680 L 855, 824 L 740, 824 Z" },
  { id: '2F_CL_02', floor: '2F', name: '의원 2', area: 104.49, status: 'VACANT', tenant: '(미지정)', pathData: "M 386, 513 L 520, 513 L 520, 584 L 386, 584 Z" },
  { id: '2F_CL_03', floor: '2F', name: '의원 3', area: 104.49, status: 'VACANT', tenant: '(미지정)', pathData: "M 386, 584 L 520, 584 L 520, 655 L 386, 655 Z" },
  { id: '2F_CL_04', floor: '2F', name: '의원 4', area: 204.20, status: 'VACANT', tenant: '(미지정)', pathData: "M 386, 420 L 520, 420 L 520, 513 L 386, 513 Z" },
  { id: '2F_DENT', floor: '2F', name: '의원 5 (치과)', area: 104.49, status: 'OCCUPIED', tenant: '치과의원', pathData: "M 609, 445 L 724, 445 L 724, 513 L 609, 513 Z" },
  { id: '2F_CL_06', floor: '2F', name: '의원 6', area: 104.49, status: 'VACANT', tenant: '(미지정)', pathData: "M 609, 513 L 724, 513 L 724, 581 L 609, 581 Z" },
  { id: '2F_CL_07', floor: '2F', name: '의원 7', area: 104.49, status: 'VACANT', tenant: '(미지정)', pathData: "M 609, 581 L 724, 581 L 724, 649 L 609, 649 Z" },
  { id: '2F_CAFE_1', floor: '2F', name: '카페 1', area: 66, status: 'OCCUPIED', tenant: 'KMI', pathData: "M 740, 290 L 855, 290 L 855, 434 L 740, 434 Z" },
  { id: '2F_CAFE_2', floor: '2F', name: '카페 2', area: 105.95, status: 'OCCUPIED', tenant: '평화의 마을', pathData: "M 550, 270 L 700, 270 L 700, 370 L 550, 370 Z" },

  // 3F
  { id: '3F_CL_08', floor: '3F', name: '의원 8', area: 104.49, status: 'VACANT', tenant: '(미지정)', pathData: "M 386, 629 L 520, 629 L 520, 701 L 386, 701 Z" },
  { id: '3F_CL_09', floor: '3F', name: '의원 9', area: 104.49, status: 'VACANT', tenant: '(미지정)', pathData: "M 386, 558 L 520, 558 L 520, 629 L 386, 629 Z" },
  { id: '3F_INST', floor: '3F', name: '의원 11~13/중앙관리', area: 417.96, status: 'OCCUPIED', tenant: '한국보건복지인재원', pathData: "M 386, 274 L 520, 558 L 386, 558 Z" },
  { id: '3F_RES_LG', floor: '3F', name: '대형연구실', area: 250.26, status: 'OCCUPIED', tenant: 'KMI', pathData: "M 740, 558 L 855, 558 L 855, 700 L 740, 700 Z" },
  { id: '3F_CONV', floor: '3F', name: '컨벤션 (대관)', area: 499.66, status: 'OCCUPIED', tenant: 'JDC', pathData: "M 580, 450 L 700, 450 L 700, 844 L 580, 844 Z" },
  { id: '3F_RES_S1', floor: '3F', name: '소형연구실 1', area: 28.64, status: 'VACANT', tenant: '(미지정)', pathData: "M 740, 360 L 855, 360 L 855, 431 L 740, 431 Z" },
  { id: '3F_RES_S2', floor: '3F', name: '소형연구실 2', area: 27.26, status: 'VACANT', tenant: '(미지정)', pathData: "M 740, 431 L 855, 431 L 855, 502 L 740, 502 Z" },
  
  // Non-rentable spaces
  { id: 'NON-RENTAL-01', floor: '1F', name: '공용공간-1F', area: 1800, status: 'NON_RENTABLE', tenant: '(공용)' },
  { id: 'NON-RENTAL-02', floor: '2F', name: '공용공간-2F', area: 1500, status: 'NON_RENTABLE', tenant: '(공용)' },
  { id: 'NON-RENTAL-03', floor: '3F', name: '공용공간-3F', area: 1200, status: 'NON_RENTABLE', tenant: '(공용)' },
];
