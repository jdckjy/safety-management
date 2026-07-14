
import { collection, writeBatch, getDocs, doc } from 'firebase/firestore'; // 'doc' 추가
import { db } from '../src/firebase';

interface TargetCompanyData {
  companyName: string;
  businessNumber: string;
  industry: string;
  location: string;
  financialScore: number;
  growthScore: number;
  clusterFitScore: number;
  totalScore: number;
  lastUpdated: Date;
}

const sampleTargets: TargetCompanyData[] = [
  {
    companyName: '그린바이오 연구소',
    businessNumber: '123-45-67890',
    industry: '의료 R&D',
    location: '경기도 성남시',
    financialScore: 85,
    growthScore: 92,
    clusterFitScore: 95,
    totalScore: 91,
    lastUpdated: new Date(),
  },
  {
    companyName: '힐링 시니어케어',
    businessNumber: '234-56-78901',
    industry: '시니어 메디컬 타운',
    location: '부산광역시 해운대구',
    financialScore: 95,
    growthScore: 88,
    clusterFitScore: 92,
    totalScore: 92,
    lastUpdated: new Date(),
  },
  {
    companyName: '퓨처 메디텍',
    businessNumber: '345-67-89012',
    industry: '의료기기 제조',
    location: '서울특별시 강남구',
    financialScore: 78,
    growthScore: 85,
    clusterFitScore: 80,
    totalScore: 81,
    lastUpdated: new Date(),
  },
  {
    companyName: '이노 헬스 파트너스',
    businessNumber: '456-78-90123',
    industry: '디지털 헬스케어',
    location: '대전광역시 유성구',
    financialScore: 88,
    growthScore: 95,
    clusterFitScore: 85,
    totalScore: 89,
    lastUpdated: new Date(),
  },
];

async function populateData() {
  const targetsCollection = collection(db, 'attraction_targets');

  // 1. Clear existing data
  const existingDocs = await getDocs(targetsCollection);
  if (!existingDocs.empty) {
    const deleteBatch = writeBatch(db);
    existingDocs.forEach(doc => deleteBatch.delete(doc.ref));
    await deleteBatch.commit();
    console.log('Previous data cleared.');
  }

  // 2. Add new sample data
  const addBatch = writeBatch(db);
  sampleTargets.forEach(target => {
    // --- THIS IS THE CORRECTED LINE ---
    const docRef = doc(targetsCollection);
    addBatch.set(docRef, target);
  });
  await addBatch.commit();

  console.log(`${sampleTargets.length} sample targets have been added to Firestore.`);
}

populateData().catch(console.error);
