
// scripts/seed.ts
import { db } from '../src/firebase';
import { seedData } from '../src/seed';
import { doc, setDoc } from 'firebase/firestore';

/**
 * Firestore 데이터베이스에 초기 데이터를 시딩(seeding)합니다.
 * [주의] 이 스크립트는 'project_data/singleton' 문서의 모든 기존 데이터를 삭제하고
 * 'src/seed.ts' 파일에 정의된 새로운 데이터로 완전히 대체합니다.
 */
async function seedDatabase() {
  console.log('⏳ 데이터베이스 시딩을 시작합니다...');
  console.warn('⚠️  기존 project_data/singleton 문서의 모든 데이터가 삭제됩니다.');

  try {
    const projectDataDocRef = doc(db, "project_data", "singleton");

    // 1. 문서를 빈 객체로 설정하여 모든 필드를 효과적으로 삭제합니다.
    await setDoc(projectDataDocRef, {});
    console.log('🗑️  기존 데이터 삭제 완료.');

    // 2. 새로운 시드 데이터로 문서를 다시 작성합니다.
    await setDoc(projectDataDocRef, seedData);
    console.log('✍️  새로운 데이터 쓰기 완료.');

    console.log('✅ 데이터베이스 시딩이 성공적으로 완료되었습니다!');
    console.log('이제 애플리케이션에서 초기 데이터를 사용할 수 있습니다.');

  } catch (error) { 
    console.error('❌ 데이터베이스 시딩 중 오류가 발생했습니다:', error);
    process.exit(1); // 오류 발생 시 스크립트 실행 중단
  }
}

// 시딩 함수를 실행합니다.
seedDatabase();
