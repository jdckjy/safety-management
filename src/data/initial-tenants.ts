
import { TenantInfo } from '../types';

export const initialTenants: TenantInfo[] = [
  {
    id: 'tenant-kmi',
    companyName: 'KMI',
    representativeName: '김대표',
    contact: '02-1234-5678',
    businessRegistrationNumber: '123-45-67890',
  },
  {
    id: 'tenant-jdc',
    companyName: 'JDC',
    representativeName: '이제주',
    contact: '064-797-5500',
    businessRegistrationNumber: '111-22-33333',
  },
  {
    id: 'tenant-dental',
    companyName: '치과의원',
    representativeName: '이튼튼',
    contact: '010-1111-2222',
    businessRegistrationNumber: '222-33-44444',
  },
  {
    id: 'tenant-peace-village',
    companyName: '평화의 마을',
    representativeName: '박평화',
    contact: '010-3333-4444',
    businessRegistrationNumber: '333-44-55555',
  },
  {
    id: 'tenant-kohubi',
    companyName: '한국보건복지인재원',
    representativeName: '원장님',
    contact: '02-5555-6666',
    businessRegistrationNumber: '444-55-66666',
  },
];
