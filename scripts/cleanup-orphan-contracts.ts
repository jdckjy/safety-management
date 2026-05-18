
import { doc, getDoc, updateDoc, collection } from 'firebase/firestore';
import { db } from '../src/firebase'; // 기존 Firebase 연결을 재사용합니다.

async function cleanupOrphanContracts() {
  console.log('Firestore 데이터 정제 작업을 시작합니다...');

  const docRef = doc(db, 'project_data', 'singleton');
  
  try {
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      console.error('오류: project_data/singleton 문서를 찾을 수 없습니다.');
      return;
    }

    console.log('데이터베이스 문서를 성공적으로 불러왔습니다.');
    const data = docSnap.data();

    const validUnitIds = new Set(data.units.map((unit: any) => unit.id));
    console.log(`총 ${validUnitIds.size}개의 유효한 유닛 ID를 확인했습니다.`);

    const originalContracts = data.contracts;
    const cleanedContracts = originalContracts.filter((contract: any) => {
      if (validUnitIds.has(contract.unitId)) {
        return true;
      } else {
        console.log(`삭제될 고아 계약 데이터 발견: ID=${contract.id}, 연결된 UnitId=${contract.unitId} (존재하지 않음)`);
        return false;
      }
    });

    if (originalContracts.length === cleanedContracts.length) {
      console.log('모든 계약 데이터가 유효합니다. 삭제할 데이터가 없습니다.');
    } else {
      console.log('데이터베이스 업데이트를 시작합니다...');
      await updateDoc(docRef, {
        contracts: cleanedContracts
      });
      console.log(`성공: 총 ${originalContracts.length - cleanedContracts.length}개의 고아 계약 데이터를 데이터베이스에서 영구적으로 삭제했습니다.`);
    }

  } catch (error) {
    console.error('데이터 정제 작업 중 오류가 발생했습니다:', error);
  }
}

cleanupOrphanContracts();
