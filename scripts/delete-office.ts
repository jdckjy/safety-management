
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../src/firebase';
import { IProjectData } from '../src/types';

const deleteOfficeUnit = async () => {
  console.log("Firebase 데이터베이스에서 '사무실' 데이터 삭제를 시작합니다...");

  const projectDataDocRef = doc(db, 'project_data', 'singleton');

  try {
    // 1. 현재 프로젝트 데이터 가져오기
    const docSnap = await getDoc(projectDataDocRef);
    if (!docSnap.exists()) {
      console.error("오류: 'project_data/singleton' 문서를 찾을 수 없습니다.");
      return;
    }

    const projectData = docSnap.data() as IProjectData;
    const originalUnits = projectData.tenantUnits || [];
    console.log(`현재 총 ${originalUnits.length}개의 임대 유닛이 있습니다.`);

    // 2. '사무실' 데이터 (ID: '1F_JDC_01') 필터링하여 제외
    const updatedTenantUnits = originalUnits.filter(unit => unit.id !== '1F_JDC_01');

    if (originalUnits.length === updatedTenantUnits.length) {
      console.warn("경고: ID '1F_JDC_01'에 해당하는 '사무실' 데이터를 찾지 못했습니다. 이미 삭제되었을 수 있습니다.");
      return;
    }

    // 3. 필터링된 데이터로 Firestore 문서 업데이트
    await updateDoc(projectDataDocRef, { tenantUnits: updatedTenantUnits });

    console.log("성공! Firebase 데이터베이스에서 '사무실'(ID: '1F_JDC_01') 데이터를 성공적으로 삭제했습니다.");
    console.log(`삭제 후 총 ${updatedTenantUnits.length}개의 임대 유닛이 남았습니다.`);

  } catch (error) {
    console.error('Firebase 데이터 업데이트 중 심각한 오류가 발생했습니다:', error);
  }
};

deleteOfficeUnit();
