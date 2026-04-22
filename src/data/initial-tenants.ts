
import { TenantInfo, BusinessCategory, CompanySize, AcquisitionChannel } from '../types';

/**
 * 정규화된 임차인 정보 초기 데이터
 *
 * 기존의 initial-tenant-info.ts와 initial-tenant-units.ts에 흩어져 있던
 * 임차인 정보를 통합하고, 중복을 제거한 후 고유 ID를 부여했습니다.
 * 이 파일은 앞으로 프로젝트의 모든 임차인 정보의 "Master" 데이터 역할을 합니다.
 */
export const initialTenants: TenantInfo[] = [
  {
    id: 'T-KMI',
    companyName: 'KMI',
    businessRegistrationNumber: '220-82-05115',
    representativeName: '김대현',
    contact: '010-2902-2837',
    businessCategory: '의료' as BusinessCategory,
    companySize: '중견' as CompanySize,
    businessDescription: '종합 건강검진 센터',
    acquisitionChannel: '기타' as AcquisitionChannel,
  },
  {
    id: 'T-JDC',
    companyName: 'JDC',
    businessRegistrationNumber: '000-00-00000', // 임시 데이터
    representativeName: '대표', // 임시 데이터
    contact: '000-0000-0000', // 임시 데이터
    businessCategory: '기타' as BusinessCategory,
    companySize: '중견' as CompanySize,
    businessDescription: '제주국제자유도시개발센터',
    acquisitionChannel: '직접 유치' as AcquisitionChannel,
  },
  {
    id: 'T-DENTIST',
    companyName: '한국건강치과',
    businessRegistrationNumber: '232-12-12333',
    representativeName: '원장',
    contact: '010-4232-2354',
    businessCategory: '의료' as BusinessCategory,
    companySize: '중소' as CompanySize,
    businessDescription: '치과 의원',
    acquisitionChannel: '기타' as AcquisitionChannel,
  },
  {
    id: 'T-PEACEVILL',
    companyName: '평화의 마을',
    businessRegistrationNumber: '111-11-11111', // 임시 데이터
    representativeName: '대표', // 임시 데이터
    contact: '010-1111-1111', // 임시 데이터
    businessCategory: '근생' as BusinessCategory,
    companySize: '중소' as CompanySize,
    businessDescription: '카페 및 휴게음식점',
    acquisitionChannel: '기타' as AcquisitionChannel,
  },
  {
    id: 'T-KOHW',
    companyName: '한국보건복지인재원',
    businessRegistrationNumber: '232-23-22131',
    representativeName: '원장',
    contact: '010-2322-2131',
    businessCategory: '교육' as BusinessCategory,
    companySize: '중견' as CompanySize,
    businessDescription: '보건복지 분야 인재 양성 교육기관',
    acquisitionChannel: '유관기관 소개' as AcquisitionChannel,
  },
];
