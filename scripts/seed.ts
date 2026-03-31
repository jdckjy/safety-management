
// scripts/seed.ts
import { db } from '../src/firebase';
import { seedData } from '../src/seed';
import { doc, setDoc } from 'firebase/firestore';

/**
 * Firestore 데이터베이스에 초기 데이터를 시딩(seeding)합니다.
 * 'project_data' 컬렉션의 'singleton' 문서에 전체 시드 데이터를 씁니다.
 */
async function seedDatabase() {
  console.log('⏳ 데이터베이스 시딩을 시작합니다...');

  try {
    // 'project_data' 컬렉션의 'singleton' 문서를 참조합니다.
    const projectDataDocRef = doc(db, "project_data", "singleton");

    // 해당 문서에 seedData 객체의 모든 내용을 씁니다.
    // 기존 데이터가 있다면 덮어쓰게 됩니다.
    await setDoc(projectDataDocRef, seedData);

    console.log('✅ 데이터베이스 시딩이 성공적으로 완료되었습니다!');
    console.log('이제 애플리케이션에서 초기 데이터를 사용할 수 있습니다.');

  } catch (error) { 
    console.error('❌ 데이터베이스 시딩 중 오류가 발생했습니다:', error);
    process.exit(1); // 오류 발생 시 스크립트 실행 중단
  }
}

// 시딩 함수를 실행합니다.
seedDatabase();
