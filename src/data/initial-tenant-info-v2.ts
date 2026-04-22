
import { TenantInfo } from '../types';

export const initialTenantInfoV2: TenantInfo[] = [
  {
    "id": "tenant-kmi",
    "companyName": "KMI",
    "businessRegistrationNumber": "220-82-05115",
    "representativeName": "김대현",
    "contact": "010-2902-2837",
    "businessCategory": "의료",
    "companySize": "중견",
    "businessDescription": "-",
    "acquisitionChannel": "기타",
    "contracts": [
      { "id": "contract-1F_KMI_01", "unitId": "1F_KMI_01", "startDate": "2023-01-01", "endDate": "2025-12-31", "deposit": 74407000, "monthlyRent": 7440700, "contractStatus": "ACTIVE" },
      { "id": "contract-1F_KMI_02", "unitId": "1F_KMI_02", "startDate": "2023-01-01", "endDate": "2025-12-31", "deposit": 27405000, "monthlyRent": 2740500, "contractStatus": "ACTIVE" },
      { "id": "contract-2F_KMI_01", "unitId": "2F_KMI_01", "startDate": "2023-01-01", "endDate": "2025-12-31", "deposit": 78304000, "monthlyRent": 7830400, "contractStatus": "ACTIVE" },
      { "id": "contract-2F_CL_01", "unitId": "2F_CL_01", "startDate": "2023-01-01", "endDate": "2025-12-31", "deposit": 10449000, "monthlyRent": 1044900, "contractStatus": "ACTIVE" },
      { "id": "contract-2F_CAFE_1", "unitId": "2F_CAFE_1", "startDate": "2023-01-01", "endDate": "2025-12-31", "deposit": 6600000, "monthlyRent": 660000, "contractStatus": "ACTIVE" },
      { "id": "contract-3F_RES_LG", "unitId": "3F_RES_LG", "startDate": "2023-01-01", "endDate": "2025-12-31", "deposit": 25026000, "monthlyRent": 2502600, "contractStatus": "ACTIVE" }
    ]
  },
  {
    "id": "tenant-kohw",
    "companyName": "한국보건복지인재원",
    "businessRegistrationNumber": "232-23-22131",
    "representativeName": "원장",
    "contact": "010-2322-2131",
    "businessCategory": "교육",
    "companySize": "중견",
    "businessDescription": "-",
    "acquisitionChannel": "기타",
    "contracts": [
      { "id": "contract-3F_INST", "unitId": "3F_INST", "startDate": "2023-01-01", "endDate": "2025-12-31", "deposit": 41796000, "monthlyRent": 4179600, "contractStatus": "ACTIVE" }
    ]
  },
  {
    "id": "tenant-ige",
    "companyName": "아이갓에브리띵",
    "businessRegistrationNumber": "234-12-21331",
    "representativeName": "대표",
    "contact": "010-4821-2341",
    "businessCategory": "근생",
    "companySize": "스타트업",
    "businessDescription": "카페",
    "acquisitionChannel": "기타",
    "contracts": [
        { "id": "contract-2F_CAFE_2", "unitId": "2F_CAFE_2", "startDate": "2023-01-01", "endDate": "2025-12-31", "deposit": 10595000, "monthlyRent": 1059500, "contractStatus": "ACTIVE" }
    ]
  },
  {
    "id": "tenant-khdc",
    "companyName": "한국건강치과",
    "businessRegistrationNumber": "232-12-12333",
    "representativeName": "원장",
    "contact": "010-4232-2354",
    "businessCategory": "의료",
    "companySize": "중소",
    "businessDescription": "치과",
    "acquisitionChannel": "기타",
    "contracts": [
      { "id": "contract-2F_DENT", "unitId": "2F_DENT", "startDate": "2023-01-01", "endDate": "2025-12-31", "deposit": 10449000, "monthlyRent": 1044900, "contractStatus": "ACTIVE" }
    ]
  }
];
