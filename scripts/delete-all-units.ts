
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../src/firebase';

const deleteAllTenantUnits = async () => {
  console.log('Firebase 데이터베이스에서 모든 임대 유닛 데이터 삭제를 시작합니다...');

  const projectDataDocRef = doc(db, 'project_data', 'singleton');

  try {
    const docSnap = await getDoc(projectDataDocRef);
    if (!docSnap.exists()) {
      console.error("오류: 'project_data/singleton' 문서를 찾을 수 없습니다.");
      return;
    }

    // tenantUnits 필드를 빈 배열로 업데이트하여 모든 유닛을 삭제합니다.
    await updateDoc(projectDataDocRef, { tenantUnits: [] });

    console.log('성공! Firebase 데이터베이스에서 모든 임대 유닛 데이터를 성공적으로 삭제했습니다.');

  } catch (error) {
    console.error('Firebase 데이터 업데이트 중 오류가 발생했습니다:', error);
  }
};

deleteAllTenantUnits();
