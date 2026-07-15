
import axios from 'axios';
import { collection, writeBatch, doc } from 'firebase/firestore';
import { db } from '../src/firebase'; 

const HIRA_API_KEY = process.env.VITE_HIRA_API_KEY;
const KOSIS_API_KEY = process.env.VITE_KOSIS_API_KEY; 

const targetsCollection = collection(db, 'attraction_targets');

async function fetchAllHiraDataForJeju() {
    if (!HIRA_API_KEY) return [];
    const baseUrl = 'http://apis.data.go.kr/B551182/hospInfoServicev2/getHospBasisList';
    const jejuCityCode = '390000';
    const numOfRows = 500;
    let pageNo = 1;
    const allItems = [];
    let totalCount = 0;
    console.log('Fetching all hospital data for Jeju...');
    const encodedApiKey = encodeURIComponent(HIRA_API_KEY);
    do {
        const apiUrl = `${baseUrl}?ServiceKey=${encodedApiKey}&pageNo=${pageNo}&numOfRows=${numOfRows}&sidoCd=${jejuCityCode}&_type=json`;
        try {
            const response = await axios.get(apiUrl);
            const items = response.data.response?.body?.items?.item;
            if (pageNo === 1) {
                totalCount = response.data.response?.body?.totalCount || 0;
                if (totalCount === 0) break;
            }
            if (items && Array.isArray(items) && items.length > 0) {
                allItems.push(...items);
            } else {
                break;
            }
            pageNo++;
        } catch (error) {
            console.error(`Error fetching HIRA data on page ${pageNo}:`, error.message);
            break;
        }
    } while (allItems.length < totalCount);
    console.log(`Finished fetching ${allItems.length} hospital items.`);
    return allItems;
}

// --- KOSIS 함수는 현재 사용하지 않으므로 주석 처리 ---
// async function fetchKosisDataForJeju() { ... }

/**
 * 스크립트 메인 실행 함수
 */
async function updateAttractionTargets() {
    console.log('Starting data update with schema alignment...');

    // 1. 병원 데이터 가져오기
    const hiraData = await fetchAllHiraDataForJeju();
    
    if (hiraData.length === 0) {
        console.log('No HIRA data to process. Aborting.');
        return;
    }

    const batch = writeBatch(db);

    hiraData.forEach(item => {
        // 프론트엔드 TargetCompany 인터페이스에 맞게 데이터 스키마 변환
        const doctorCount = parseInt(item.sdrCnt, 10) || 0; // 의사 수(sdrCnt)를 기반으로 점수 재산정
        const totalScore = Math.min(70 + (doctorCount * 3), 99); // 기본 70점, 의사 1명당 3점 가산, 최대 99점

        const targetData = {
            companyName: item.yadmNm,      // 병원 이름 -> 기업명
            businessNumber: 'N/A',         // 사업자번호 (API에 없음)
            industry: item.clCdNm,       // 업종명 -> 업종
            location: item.addr,         // 주소 -> 소재지
            financialScore: Math.floor(Math.random() * 31) + 60, // 60~90점 사이 랜덤 점수
            growthScore: Math.floor(Math.random() * 31) + 65,    // 65~95점 사이 랜덤 점수
            clusterFitScore: Math.floor(Math.random() * 21) + 75, // 75~95점 사이 랜덤 점수
            totalScore: totalScore,
        };
        
        const docRef = doc(targetsCollection, item.ykiho); // ykiho를 고유 ID로 사용
        batch.set(docRef, targetData);
    });

    console.log(`Preparing to write ${hiraData.length} items to Firestore with new schema...`);

    try {
        await batch.commit();
        console.log(`✅ Successfully wrote ${hiraData.length} documents to Firestore.`);
    } catch (error) {
        console.error('Error committing batch to Firestore:', error);
    }

    console.log('Script finished.');
}

updateAttractionTargets();
