
import { TenantInfo } from '../types';

export const initialTenantInfo: TenantInfo[] = [
  {
    id: 'tenant-kmi',
    companyName: 'KMI',
    businessRegistrationNumber: '220-82-05115',
    representativeName: '김대현',
    contact: '010-2902-2837',
    businessCategory: '의료',
    companySize: '중견',
    businessDescription: '-',
    acquisitionChannel: '기타',
  },
  {
    id: 'tenant-kohw',
    companyName: '한국보건복지인재원',
    businessRegistrationNumber: '232-23-22131',
    representativeName: '원장',
    contact: '010-2322-2131',
    businessCategory: '교육',
    companySize: '중견', // "기타" -> "중견"으로 변경
    businessDescription: '-',
    acquisitionChannel: '기타',
  },
  {
    id: 'tenant-ige',
    companyName: '아이갓에브리띵',
    businessRegistrationNumber: '234-12-21331',
    representativeName: '대표',
    contact: '010-4821-2341',
    businessCategory: '근생',
    companySize: '스타트업',
    businessDescription: '카페',
    acquisitionChannel: '기타',
  },
  {
    id: 'tenant-khdc',
    companyName: '한국건강치과',
    businessRegistrationNumber: '232-12-12333',
    representativeName: '원장',
    contact: '010-4232-2354',
    businessCategory: '의료',
    companySize: '중소',
    businessDescription: '치과',
    acquisitionChannel: '기타',
  },
];
