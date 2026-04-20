
// src/data/initial-tenant-units.ts
import { TenantUnit } from '../types';

/**
 * 이 파일은 임대 현황 관리 기능의 초기 데이터를 정의합니다.
 * 사용자가 제공한 임대 현황 리스트와 코드에 정의된 SVG 경로 데이터를 병합했습니다.
 * 이 데이터는 AppDataContext를 통해 앱 전역 상태로 관리됩니다.
 */

export const initialTenantUnits: TenantUnit[] = [
  // ========================== 1층 데이터 ==========================
  {
    id: '1F_KMI_01',
    floor: '1F',
    name: '건강검진센터 1',
    tenant: 'KMI',
    area: 744.07,
    status: 'OCCUPIED',
    pathData: 'M 381, 720 L 587, 720 L 587, 850 L 381, 850 Z',
  },
  {
    id: '1F_KMI_02',
    floor: '1F',
    name: '편의시설',
    tenant: 'KMI',
    area: 274.05,
    status: 'OCCUPIED',
    pathData: 'M 587, 720 L 736, 720 L 736, 788 L 587, 788 Z',
  },
  // {
  //   id: '1F_JDC_01',
  //   floor: '1F',
  //   name: '사무실',
  //   tenant: 'JDC',
  //   area: 70.47,
  //   status: 'OCCUPIED',
  //   pathData: 'M 587, 788 L 736, 788 L 736, 850 L 587, 850 Z',
  // },
  {
    id: '1F_JDC_02',
    floor: '1F',
    name: '용역원실',
    tenant: 'JDC',
    area: 39.0,
    status: 'OCCUPIED',
    pathData: 'M 736, 563 L 851, 563 L 851, 719 L 736, 719 Z',
  },

  // ========================== 2층 데이터 ==========================
  {
    id: '2F_KMI_01',
    floor: '2F',
    name: '건강검진센터 2',
    tenant: 'KMI',
    area: 783.04,
    status: 'OCCUPIED',
    pathData: 'M 386, 703 L 592, 703 L 592, 824 L 386, 824 Z',
  },
  {
    id: '2F_CL_01',
    floor: '2F',
    name: '의원 1',
    tenant: 'KMI',
    area: 104.49,
    status: 'OCCUPIED',
    pathData: 'M 740, 680 L 855, 680 L 855, 824 L 740, 824 Z',
  },
  {
    id: '2F_CL_02',
    floor: '2F',
    name: '의원 2',
    tenant: '(미지정)',
    area: 104.49,
    status: 'VACANT',
    pathData: 'M 386, 513 L 520, 513 L 520, 584 L 386, 584 Z',
  },
  {
    id: '2F_CL_03',
    floor: '2F',
    name: '의원 3',
    tenant: '(미지정)',
    area: 104.49,
    status: 'VACANT',
    pathData: 'M 386, 584 L 520, 584 L 520, 655 L 386, 655 Z',
  },
  {
    id: '2F_CL_04',
    floor: '2F',
    name: '의원 4',
    tenant: '(미지정)',
    area: 204.2,
    status: 'VACANT',
    pathData: 'M 386, 420 L 520, 420 L 520, 513 L 386, 513 Z',
  },
  {
    id: '2F_DENT',
    floor: '2F',
    name: '의원 5 (치과)',
    tenant: '치과의원',
    area: 104.49,
    status: 'OCCUPIED',
    pathData: 'M 609, 445 L 724, 445 L 724, 513 L 609, 513 Z',
  },
  {
    id: '2F_CL_06',
    floor: '2F',
    name: '의원 6',
    tenant: '(미지정)',
    area: 104.49,
    status: 'VACANT',
    pathData: 'M 609, 513 L 724, 513 L 724, 581 L 609, 581 Z',
  },
  {
    id: '2F_CL_07',
    floor: '2F',
    name: '의원 7',
    tenant: '(미지정)',
    area: 104.49,
    status: 'VACANT',
    pathData: 'M 609, 581 L 724, 581 L 724, 649 L 609, 649 Z',
  },
  {
    id: '2F_CAFE_1',
    floor: '2F',
    name: '카페 1',
    tenant: 'KMI',
    area: 66.0,
    status: 'OCCUPIED',
    pathData: 'M 740, 290 L 855, 290 L 855, 434 L 740, 434 Z',
  },
  {
    id: '2F_CAFE_2',
    floor: '2F',
    name: '카페 2',
    tenant: '평화의 마을',
    area: 105.95,
    status: 'OCCUPIED',
    pathData: 'M 550, 270 L 700, 270 L 700, 370 L 550, 370 Z',
  },

  // ========================== 3층 데이터 ==========================
  {
    id: '3F_CL_08',
    floor: '3F',
    name: '의원 8',
    tenant: '(미지정)',
    area: 104.49,
    status: 'VACANT',
    pathData: 'M 386, 629 L 520, 629 L 520, 701 L 386, 701 Z',
  },
  {
    id: '3F_CL_09',
    floor: '3F',
    name: '의원 9',
    tenant: '(미지정)',
    area: 104.49,
    status: 'VACANT',
    pathData: 'M 386, 558 L 520, 558 L 520, 629 L 386, 629 Z',
  },
  {
    id: '3F_INST',
    floor: '3F',
    name: '의원 11~13/중앙관리',
    tenant: '한국보건복지인재원',
    area: 417.96,
    status: 'OCCUPIED',
    // 참고: 기획서의 'INST'는 3F의 여러 유닛(의원10~13, 중앙관리)을 포함하는 것으로 보임.
    // 여기서는 가장 유사한 위치의 여러 path들을 Grouping 하는 방식으로 접근해야 하나,
    // 우선 기획서의 단일 항목으로 표현하기 위해 대표적인 path 하나를 임시로 지정함.
    // 추후 이 부분의 시각화 방식에 대한 논의가 필요함.
    // 3F_CL_10(의원10), 3F_CL_11(의원11), 3F_CL_12(의원12), 3F_CEN(중앙관리) 등의 path를 조합해야 함.
    pathData: 'M 386, 274 L 520, 487 L 386, 487 Z', // 임시. 여러 유닛을 합친 영역
  },
  {
    id: '3F_RES_LG',
    floor: '3F',
    name: '대형연구실',
    tenant: 'KMI',
    area: 250.26,
    status: 'OCCUPIED',
    pathData: 'M 740, 558 L 855, 558 L 855, 700 L 740, 700 Z',
  },
  {
    id: '3F_CONV',
    floor: '3F',
    name: '컨벤션 (대관)',
    tenant: 'JDC',
    area: 499.66,
    status: 'OCCUPIED',
    pathData: 'M 580, 450 L 700, 450 L 700, 640 L 580, 640 Z',
  },
  {
    id: '3F_RES_S1',
    floor: '3F',
    name: '소형연구실 1',
    tenant: '(미지정)',
    area: 28.64,
    status: 'VACANT',
    pathData: 'M 740, 360 L 855, 360 L 855, 431 L 740, 431 Z',
  },
  {
    id: '3F_RES_S2',
    floor: '3F',
    name: '소형연구실 2',
    tenant: '(미지정)',
    area: 27.26,
    status: 'VACANT',
    pathData: 'M 740, 431 L 855, 431 L 855, 502 L 740, 502 Z',
  },
];
