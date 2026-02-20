
import { collection, writeBatch, getDocs, query, where, doc } from "firebase/firestore";
import { db } from "../firebase"; // Firestore 인스턴스를 가져옵니다.
import { Building, Unit } from "../types"; // 데이터 타입을 가져옵니다.

// 평면도 이미지에서 추출한 유닛 데이터입니다.
// 참고: position_x, position_y는 평면도에 없어 기본값(0)으로 설정했습니다.
const units: Unit[] = [
  // 1층
  { id: "U001", floor: 1, area_sqm: 744.07, status: "occupied", tenant_name: "KMI", usage_type: "건강검진센터1", position_x: 0, position_y: 0 },
  { id: "U002", floor: 1, area_sqm: 274.05, status: "occupied", tenant_name: "KMI", usage_type: "편의시설", position_x: 0, position_y: 0 },
  { id: "U003", floor: 1, area_sqm: 70.47, status: "occupied", tenant_name: "KMI", usage_type: "사무실", position_x: 0, position_y: 0 },
  { id: "U004", floor: 1, area_sqm: 39.00, status: "occupied", tenant_name: "JDC", usage_type: "용역원실", position_x: 0, position_y: 0 },
  // 2층
  { id: "U005", floor: 2, area_sqm: 783.04, status: "occupied", tenant_name: "KMI", usage_type: "건강검진센터2", position_x: 0, position_y: 0 },
  { id: "U006", floor: 2, area_sqm: 104.49, status: "occupied", tenant_name: "KMI", usage_type: "의원1", position_x: 0, position_y: 0 },
  { id: "U007", floor: 2, area_sqm: 104.49, status: "vacant", tenant_name: null, usage_type: "의원2", position_x: 0, position_y: 0 },
  { id: "U008", floor: 2, area_sqm: 104.49, status: "vacant", tenant_name: null, usage_type: "의원3", position_x: 0, position_y: 0 },
  { id: "U009", floor: 2, area_sqm: 204.20, status: "vacant", tenant_name: null, usage_type: "의원4", position_x: 0, position_y: 0 },
  { id: "U010", floor: 2, area_sqm: 104.49, status: "occupied", tenant_name: "치과의원", usage_type: "의원5", position_x: 0, position_y: 0 },
  { id: "U011", floor: 2, area_sqm: 104.49, status: "vacant", tenant_name: null, usage_type: "의원6", position_x: 0, position_y: 0 },
  { id: "U012", floor: 2, area_sqm: 104.49, status: "vacant", tenant_name: null, usage_type: "의원7", position_x: 0, position_y: 0 },
  { id: "U013", floor: 2, area_sqm: 66.00, status: "occupied", tenant_name: "KMI", usage_type: "카페1", position_x: 0, position_y: 0 },
  { id: "U014", floor: 2, area_sqm: 105.95, status: "occupied", tenant_name: "평화의 마을", usage_type: "카페2", position_x: 0, position_y: 0 },
  // 3층
  { id: "U015", floor: 3, area_sqm: 104.49, status: "vacant", tenant_name: null, usage_type: "의원8", position_x: 0, position_y: 0 },
  { id: "U016", floor: 3, area_sqm: 104.49, status: "vacant", tenant_name: null, usage_type: "의원9", position_x: 0, position_y: 0 },
  { id: "U017", floor: 3, area_sqm: 104.49, status: "vacant", tenant_name: null, usage_type: "의원10", position_x: 0, position_y: 0 },
  { id: "U018", floor: 3, area_sqm: 104.49, status: "occupied", tenant_name: "한국보건복지인재원", usage_type: "의원11", position_x: 0, position_y: 0 },
  { id: "U019", floor: 3, area_sqm: 104.49, status: "occupied", tenant_name: "한국보건복지인재원", usage_type: "의원12", position_x: 0, position_y: 0 },
  { id: "U020", floor: 3, area_sqm: 104.49, status: "vacant", tenant_name: null, usage_type: "의원13", position_x: 0, position_y: 0 },
  { id: "U021", floor: 3, area_sqm: 104.49, status: "occupied", tenant_name: "한국보건복지인재원", usage_type: "중앙관리센터", position_x: 0, position_y: 0 },
  { id: "U022", floor: 3, area_sqm: 250.26, status: "occupied", tenant_name: "KMI", usage_type: "대형연구실", position_x: 0, position_y: 0 },
  { id: "U023", floor: 3, area_sqm: 31.39, status: "occupied", tenant_name: "JDC", usage_type: "강의실1", position_x: 0, position_y: 0 },
  { id: "U024", floor: 3, area_sqm: 27.95, status: "occupied", tenant_name: "JDC", usage_type: "강의실2", position_x: 0, position_y: 0 },
  { id: "U025", floor: 3, area_sqm: 27.95, status: "occupied", tenant_name: "JDC", usage_type: "강의실3", position_x: 0, position_y: 0 },
  { id: "U026", floor: 3, area_sqm: 32.59, status: "occupied", tenant_name: "JDC", usage_type: "국책연구실", position_x: 0, position_y: 0 },
  { id: "U027", floor: 3, area_sqm: 499.86, status: "occupied", tenant_name: "JDC", usage_type: "컨벤션", position_x: 0, position_y: 0 },
  { id: "U028", floor: 3, area_sqm: 28.64, status: "vacant", tenant_name: null, usage_type: "소형연구실1", position_x: 0, position_y: 0 },
  { id: "U029", floor: 3, area_sqm: 27.26, status: "vacant", tenant_name: null, usage_type: "소형연구실2", position_x: 0, position_y: 0 },
];

// 의료서비스센터 빌딩 데이터입니다.
const medicalServiceCenter: Building = {
  id: "MSC01",
  name: "의료서비스센터",
  total_area_sqm: 4570.85,
  floors: [
    { level: 1, name: "지상 1층", total_area_sqm: 1127.59, floor_plan_url: "/floor-plans/msc-floor-1.svg" },
    { level: 2, name: "지상 2층", total_area_sqm: 1786.13, floor_plan_url: "/floor-plans/msc-floor-2.svg" },
    { level: 3, name: "지상 3층", total_area_sqm: 1657.13, floor_plan_url: "/floor-plans/msc-floor-3.svg" },
  ],
  units: units, // 위에 정의된 유닛 데이터를 포함합니다.
};

// Firestore에 데이터를 쓰는 함수입니다.
export const seedDatabase = async () => {
  const buildingsCollection = collection(db, "buildings");

  // 데이터가 이미 있는지 확인하여 중복 저장을 방지합니다.
  const q = query(buildingsCollection, where("id", "==", medicalServiceCenter.id));
  const querySnapshot = await getDocs(q);

  if (!querySnapshot.empty) {
    console.log(`Building with ID ${medicalServiceCenter.id} already exists. Seeding skipped.`);
    return;
  }

  // Batch-write를 사용하여 Building과 모든 Units를 한 번에 씁니다.
  const batch = writeBatch(db);
  
  const buildingRef = doc(buildingsCollection, medicalServiceCenter.id);
  batch.set(buildingRef, medicalServiceCenter);
  
  console.log(`Seeding data for building: ${medicalServiceCenter.name}`);

  try {
    await batch.commit();
    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding database: ", error);
  }
};
