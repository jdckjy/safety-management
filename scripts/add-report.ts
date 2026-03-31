
// scripts/add-report.ts
import { db } from '../src/firebase';
import { doc, updateDoc, arrayUnion, getDoc } from 'firebase/firestore';
import { MonthlyReport, ReportRawData } from '../src/types';
import reportJson from '../src/data/2026-02-report.json';

/**
 * Firestore 데이터베이스에 새로운 월간 보고서를 추가합니다.
 * 'project_data/singleton' 문서의 'monthly_reports' 배열에 원자적으로 새 보고서를 추가합니다.
 */
async function addMonthlyReport() {
  console.log('⏳ 월간 보고서 데이터를 데이터베이스에 추가합니다...');

  try {
    const projectDataDocRef = doc(db, "project_data", "singleton");

    // 이미지 분석을 통해 "추출된" 가상의 데이터입니다.
    const reportRawData: ReportRawData = reportJson as ReportRawData;
    const newReport: MonthlyReport = {
      id: '2026-02',
      year: 2026,
      month: 2,
      raw_data: reportRawData,
    };

    // 중복 추가를 방지하기 위해, 해당 ID의 보고서가 이미 존재하는지 확인합니다.
    const docSnap = await getDoc(projectDataDocRef);
    if (docSnap.exists()) {
        const data = docSnap.data();
        // monthly_reports 필드가 존재하고 배열인지 확인합니다.
        if (data.monthly_reports && Array.isArray(data.monthly_reports)) {
            const reports = data.monthly_reports as MonthlyReport[];
            if (reports.some(report => report.id === newReport.id)) {
                console.log(`✅ 보고서(ID: ${newReport.id})가 이미 존재하여 추가하지 않습니다.`);
                return; // 이미 존재하면 함수를 종료합니다.
            }
        }
    }

    // Firestore의 arrayUnion을 사용하여 원자적으로 새 보고서를 배열에 추가합니다.
    // 문서가 존재하지 않으면, monthly_reports 필드를 가진 새 문서가 생성됩니다.
    await updateDoc(projectDataDocRef, {
        monthly_reports: arrayUnion(newReport)
    }, { merge: true }); // merge: true는 문서가 없을 경우 생성하도록 보장합니다.

    console.log(`✅ 월간 보고서(ID: ${newReport.id})가 성공적으로 추가되었습니다.`);

  } catch (error) { 
    console.error('❌ 보고서 추가 중 오류가 발생했습니다:', error);
    process.exit(1); // 오류 발생 시 스크립트 실행 중단
  }
}

// 보고서 추가 함수를 실행합니다.
addMonthlyReport();
