
// src/data/tenantUnits.ts
// 임시 목업 데이터입니다. 실제 애플리케이션에서는 API를 통해 가져와야 합니다.

import { TenantUnit } from '../types';

export const tenantUnits: TenantUnit[] = [
  // 1층
  { id: 'MSC-1F-01', floor: '1층', name: '건강검진센터1', tenant: '서울의료재단', area: 250.5, status: '임대' },
  { id: 'MSC-1F-02', floor: '1층', name: '편의시설', tenant: 'GS25', area: 90.2, status: '임대' },
  { id: 'MSC-1F-03', floor: '1층', name: '사무실', tenant: 'JDC', area: 75.0, status: '임대' },
  { id: 'MSC-1F-04', floor: '1층', name: 'JDC', tenant: 'JDC', area: 180.8, status: '임대' },

  // 2층
  { id: 'MSC-2F-01', floor: '2층', name: '건강검진센터2', tenant: '서울의료재단', area: 245.0, status: '임대' },
  { id: 'MSC-2F-02', floor: '2층', name: '의원1', tenant: '제주클리닉', area: 170.0, status: '임대' },
  { id: 'MSC-2F-03', floor: '2층', name: '의원2', tenant: '', area: 85.0, status: '미임대' },
  { id: 'MSC-2F-04', floor: '2층', name: '의원3', tenant: '', area: 85.0, status: '미임대' },
  { id: 'MSC-2F-05', floor: '2층', name: '의원4', tenant: '', area: 110.0, status: '미임대' },
  { id: 'MSC-2F-06', floor: '2층', name: '의원5', tenant: '미래이비인후과', area: 80.5, status: '임대' },
  { id: 'MSC-2F-07', floor: '2층', name: '의원6', tenant: '', area: 80.5, status: '미임대' },
  { id: 'MSC-2F-08', floor: '2층', name: '의원7', tenant: '', area: 80.5, status: '미임대' },
  { id: 'MSC-2F-09', floor: '2층', name: '카페1', tenant: '스타벅스', area: 165.0, status: '임대' },
  { id: 'MSC-2F-10', floor: '2층', name: '카페2', tenant: '이디야커피', area: 120.0, status: '임대' },

  // 3층
  { id: 'MSC-3F-01', floor: '3층', name: '의원8', tenant: '', area: 85.0, status: '미임대' },
  { id: 'MSC-3F-02', floor: '3층', name: '의원9', tenant: '', area: 85.0, status: '미임대' },
  { id: 'MSC-3F-03', floor: '3층', name: '의원10', tenant: '우리들치과', area: 85.0, status: '임대' },
  { id: 'MSC-3F-04', floor: '3층', name: '의원11', tenant: '아이튼튼소아과', area: 85.0, status: '임대' },
  { id: 'MSC-3F-05', floor: '3층', name: '의원12', tenant: '조은안과', area: 85.0, status: '임대' },
  { id: 'MSC-3F-06', floor: '3층', name: '의원13', tenant: '제주피부과', area: 85.0, status: '임대' },
  { id: 'MSC-3F-07', floor: '3층', name: '중앙관리센터', tenant: 'JDC', area: 170.0, status: '임대' },
  { id: 'MSC-3F-08', floor: '3층', name: '대형연구실', tenant: '카카오', area: 170.0, status: '임대' },
  { id: 'MSC-3F-09', floor: '3층', name: '강의실1', tenant: 'JDC 교육센터', area: 60.0, status: '임대' },
  { id: 'MSC-3F-10', floor: '3층', name: '강의실2', tenant: 'JDC 교육센터', area: 60.0, status: '임대' },
  { id: 'MSC-3F-11', floor: '3층', name: '강의실3', tenant: 'JDC 교육센터', area: 60.0, status: '임대' },
  { id: 'MSC-3F-12', floor: '3층', name: '국책연구실', tenant: 'ETRI', area: 60.0, status: '임대' },
  { id: 'MSC-3F-13', floor: '3층', name: '컨벤션', tenant: '제주관광공사', area: 220.0, status: '임대' },
  { id: 'MSC-3F-14', floor: '3층', name: '소형연구실1', tenant: '', area: 85.0, status: '미임대' },
  { id: 'MSC-3F-15', floor: '3층', name: '소형연구실2', tenant: '', area: 85.0, status: '미임대' },
];
