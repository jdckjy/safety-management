"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const firestore_1 = require("firebase/firestore");
const firebase_1 = require("../src/firebase");
async function inspectContractAndUnitData() {
    console.log("'contracts'와 'units' 데이터 구조를 확인합니다...");
    const docRef = (0, firestore_1.doc)(firebase_1.db, 'project_data', 'singleton');
    try {
        const docSnap = await (0, firestore_1.getDoc)(docRef);
        if (!docSnap.exists()) {
            console.error('오류: project_data/singleton 문서를 찾을 수 없습니다.');
            return;
        }
        const data = docSnap.data();
        // contracts 배열이 있는지 확인하고 출력
        if (data.contracts) {
            console.log('====== contracts 데이터 ======');
            console.log(JSON.stringify(data.contracts, null, 2));
        }
        else {
            console.log('contracts 데이터가 존재하지 않습니다.');
        }
        // buildings 배열 및 그 안의 units 배열이 있는지 확인하고 출력
        if (data.buildings && data.buildings[0] && data.buildings[0].units) {
            console.log('\n====== buildings[0].units 데이터 ======');
            console.log(JSON.stringify(data.buildings[0].units, null, 2));
        }
        else {
            console.log('\nbuildings[0].units 데이터가 존재하지 않습니다.');
        }
        console.log('\n데이터 구조 확인 완료.');
    }
    catch (error) {
        console.error('데이터 확인 중 오류가 발생했습니다:', error);
    }
}
inspectContractAndUnitData();
