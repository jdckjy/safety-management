"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const firestore_1 = require("firebase/firestore");
const firebase_1 = require("../src/firebase");
const deleteUnitById = async (unitId) => {
    if (!unitId) {
        console.error("❌ 오류: 삭제할 유닛의 ID를 입력해주세요. 예: npx vite-node scripts/delete-unit.ts <unit-id>");
        return;
    }
    console.log(`🔥 Firebase 데이터베이스에서 유닛 ID '${unitId}' 삭제를 시작합니다...`);
    const projectDataDocRef = (0, firestore_1.doc)(firebase_1.db, 'project_data', 'singleton');
    try {
        const docSnap = await (0, firestore_1.getDoc)(projectDataDocRef);
        if (!docSnap.exists()) {
            console.error("❌ 오류: 'project_data/singleton' 문서를 찾을 수 없습니다.");
            return;
        }
        const projectData = docSnap.data();
        const buildings = projectData.buildings || [];
        let unitFound = false;
        const updatedBuildings = buildings.map((building) => {
            const originalUnitCount = building.units.length;
            const updatedUnits = building.units.filter(unit => {
                if (unit.id === unitId) {
                    unitFound = true;
                    return false;
                }
                return true;
            });
            if (originalUnitCount !== updatedUnits.length) {
                console.log(`🏢 빌딩 '${building.name}'에서 유닛 '${unitId}'를 찾았습니다.`);
            }
            return { ...building, units: updatedUnits };
        });
        if (!unitFound) {
            console.warn(`🤔 경고: ID '${unitId}'에 해당하는 유닛을 찾지 못했습니다. 이미 삭제되었거나 ID가 잘못되었을 수 있습니다.`);
            return;
        }
        await (0, firestore_1.updateDoc)(projectDataDocRef, { buildings: updatedBuildings });
        console.log(`✅ 성공! Firebase 데이터베이스에서 유닛 ID '${unitId}'를 성공적으로 삭제했습니다.`);
    }
    catch (error) {
        console.error('❌ Firebase 데이터 업데이트 중 심각한 오류가 발생했습니다:', error);
    }
};
const unitIdToDelete = process.argv[2];
deleteUnitById(unitIdToDelete);
