
import { Building } from '../types';

export const initialBuildingData: Building[] = [
  {
    "id": "main-building",
    "name": "의료서비스센터",
    "total_area_sqm": 8776.01,
    "floors": [
      {
        "level": 1,
        "name": "1층",
        "total_area_sqm": 3000,
        "floor_plan_url": "/path/to/1f-plan.svg"
      },
      {
        "level": 2,
        "name": "2층",
        "total_area_sqm": 3000,
        "floor_plan_url": "/path/to/2f-plan.svg"
      },
      {
        "level": 3,
        "name": "3층",
        "total_area_sqm": 3000,
        "floor_plan_url": "/path/to/3f-plan.svg"
      }
    ],
    "units": [
      {
        "id": "1F_KMI_01",
        "name": "건강검진센터 1",
        "unitNumber": "1F_KMI_01",
        "floor": 1,
        "area_sqm": 744.07,
        "status": "OCCUPIED",
        "tenantId": "tenant-kmi",
        "usage_type": "Office",
        "pathData": "M 381, 720 L 587, 720 L 587, 850 L 381, 850 Z"
      },
      {
        "id": "1F_KMI_02",
        "name": "편의시설",
        "unitNumber": "1F_KMI_02",
        "floor": 1,
        "area_sqm": 274.05,
        "status": "OCCUPIED",
        "tenantId": "tenant-kmi",
        "usage_type": "Office",
        "pathData": "M 587, 720 L 736, 720 L 736, 788 L 587, 788 Z"
      },
      {
        "id": "1F_JDC_02",
        "name": "용역원실",
        "unitNumber": "1F_JDC_02",
        "floor": 1,
        "area_sqm": 39,
        "status": "OCCUPIED",
        "tenantId": null,
        "usage_type": "Office",
        "pathData": "M 736, 563 L 851, 563 L 851, 719 L 736, 719 Z"
      },
      {
        "id": "2F_KMI_01",
        "name": "건강검진센터 2",
        "unitNumber": "2F_KMI_01",
        "floor": 2,
        "area_sqm": 783.04,
        "status": "OCCUPIED",
        "tenantId": "tenant-kmi",
        "usage_type": "Office",
        "pathData": "M 386, 703 L 592, 703 L 592, 824 L 386, 824 Z"
      },
      {
        "id": "2F_CL_01",
        "name": "의원 1",
        "unitNumber": "2F_CL_01",
        "floor": 2,
        "area_sqm": 104.49,
        "status": "OCCUPIED",
        "tenantId": "tenant-kmi",
        "usage_type": "Office",
        "pathData": "M 740, 680 L 855, 680 L 855, 824 L 740, 824 Z"
      },
      {
        "id": "2F_CL_02",
        "name": "의원 2",
        "unitNumber": "2F_CL_02",
        "floor": 2,
        "area_sqm": 104.49,
        "status": "VACANT",
        "tenantId": null,
        "usage_type": "Office",
        "pathData": "M 386, 513 L 520, 513 L 520, 584 L 386, 584 Z"
      },
      {
        "id": "2F_CL_03",
        "name": "의원 3",
        "unitNumber": "2F_CL_03",
        "floor": 2,
        "area_sqm": 104.49,
        "status": "VACANT",
        "tenantId": null,
        "usage_type": "Office",
        "pathData": "M 386, 584 L 520, 584 L 520, 655 L 386, 655 Z"
      },
      {
        "id": "2F_CL_04",
        "name": "의원 4",
        "unitNumber": "2F_CL_04",
        "floor": 2,
        "area_sqm": 204.2,
        "status": "VACANT",
        "tenantId": null,
        "usage_type": "Office",
        "pathData": "M 386, 420 L 520, 420 L 520, 513 L 386, 513 Z"
      },
      {
        "id": "2F_DENT",
        "name": "의원 5 (치과)",
        "unitNumber": "2F_DENT",
        "floor": 2,
        "area_sqm": 104.49,
        "status": "OCCUPIED",
        "tenantId": "tenant-khdc",
        "usage_type": "Office",
        "pathData": "M 609, 445 L 724, 445 L 724, 513 L 609, 513 Z"
      },
      {
        "id": "2F_CL_06",
        "name": "의원 6",
        "unitNumber": "2F_CL_06",
        "floor": 2,
        "area_sqm": 104.49,
        "status": "VACANT",
        "tenantId": null,
        "usage_type": "Office",
        "pathData": "M 609, 513 L 724, 513 L 724, 581 L 609, 581 Z"
      },
      {
        "id": "2F_CL_07",
        "name": "의원 7",
        "unitNumber": "2F_CL_07",
        "floor": 2,
        "area_sqm": 104.49,
        "status": "VACANT",
        "tenantId": null,
        "usage_type": "Office",
        "pathData": "M 609, 581 L 724, 581 L 724, 649 L 609, 649 Z"
      },
      {
        "id": "2F_CAFE_1",
        "name": "카페 1",
        "unitNumber": "2F_CAFE_1",
        "floor": 2,
        "area_sqm": 66,
        "status": "OCCUPIED",
        "tenantId": "tenant-kmi",
        "usage_type": "Office",
        "pathData": "M 740, 290 L 855, 290 L 855, 434 L 740, 434 Z"
      },
      {
        "id": "2F_CAFE_2",
        "name": "카페 2",
        "unitNumber": "2F_CAFE_2",
        "floor": 2,
        "area_sqm": 105.95,
        "status": "OCCUPIED",
        "tenantId": "tenant-ige",
        "usage_type": "Office",
        "pathData": "M 550, 270 L 700, 270 L 700, 370 L 550, 370 Z"
      },
      {
        "id": "3F_CL_08",
        "name": "의원 8",
        "unitNumber": "3F_CL_08",
        "floor": 3,
        "area_sqm": 104.49,
        "status": "VACANT",
        "tenantId": null,
        "usage_type": "Office",
        "pathData": "M 386, 629 L 520, 629 L 520, 701 L 386, 701 Z"
      },
      {
        "id": "3F_CL_09",
        "name": "의원 9",
        "unitNumber": "3F_CL_09",
        "floor": 3,
        "area_sqm": 104.49,
        "status": "VACANT",
        "tenantId": null,
        "usage_type": "Office",
        "pathData": "M 386, 558 L 520, 558 L 520, 629 L 386, 629 Z"
      },
      {
        "id": "3F_INST",
        "name": "의원 11~13/중앙관리",
        "unitNumber": "3F_INST",
        "floor": 3,
        "area_sqm": 417.96,
        "status": "OCCUPIED",
        "tenantId": "tenant-kohw",
        "usage_type": "Office",
        "pathData": "M 386, 274 L 520, 558 L 386, 558 Z"
      },
      {
        "id": "3F_RES_LG",
        "name": "대형연구실",
        "unitNumber": "3F_RES_LG",
        "floor": 3,
        "area_sqm": 250.26,
        "status": "OCCUPIED",
        "tenantId": "tenant-kmi",
        "usage_type": "Office",
        "pathData": "M 740, 558 L 855, 558 L 855, 700 L 740, 700 Z"
      },
      {
        "id": "3F_CONV",
        "name": "컨벤션 (대관)",
        "unitNumber": "3F_CONV",
        "floor": 3,
        "area_sqm": 499.66,
        "status": "OCCUPIED",
        "tenantId": null,
        "usage_type": "Office",
        "pathData": "M 580, 450 L 700, 450 L 700, 844 L 580, 844 Z"
      },
      {
        "id": "3F_RES_S1",
        "name": "소형연구실 1",
        "unitNumber": "3F_RES_S1",
        "floor": 3,
        "area_sqm": 28.64,
        "status": "VACANT",
        "tenantId": null,
        "usage_type": "Office",
        "pathData": "M 740, 360 L 855, 360 L 855, 431 L 740, 431 Z"
      },
      {
        "id": "3F_RES_S2",
        "name": "소형연구실 2",
        "unitNumber": "3F_RES_S2",
        "floor": 3,
        "area_sqm": 27.26,
        "status": "VACANT",
        "tenantId": null,
        "usage_type": "Office",
        "pathData": "M 740, 431 L 855, 431 L 855, 502 L 740, 502 Z"
      },
      {
        "id": "NON-RENTAL-01",
        "name": "공용공간-1F",
        "unitNumber": "NON-RENTAL-01",
        "floor": 1,
        "area_sqm": 1800,
        "status": "NON_RENTABLE",
        "tenantId": null,
        "usage_type": "Office",
        "pathData": ""
      },
      {
        "id": "NON-RENTAL-02",
        "name": "공용공간-2F",
        "unitNumber": "NON-RENTAL-02",
        "floor": 2,
        "area_sqm": 1500,
        "status": "NON_RENTABLE",
        "tenantId": null,
        "usage_type": "Office",
        "pathData": ""
      },
      {
        "id": "NON-RENTAL-03",
        "name": "공용공간-3F",
        "unitNumber": "NON-RENTAL-03",
        "floor": 3,
        "area_sqm": 1200,
        "status": "NON_RENTABLE",
        "tenantId": null,
        "usage_type": "Office",
        "pathData": ""
      }
    ]
  }
];
